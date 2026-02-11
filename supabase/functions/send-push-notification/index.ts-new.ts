import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY');
        const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY');
        const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
        const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

        if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
            console.error('VAPID keys not configured');
            return new Response(
                JSON.stringify({ error: 'VAPID keys not configured' }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        const payload = await req.json();
        console.log('Received payload:', JSON.stringify(payload, null, 2));

        let userId: string;
        let title = 'Nuevo mensaje';
        let body: string;
        let url = '/profile';

        // Create Supabase client with service role
        const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

        // Check if it's a database webhook
        if (payload.record && payload.table === 'messages') {
            const message = payload.record;
            const { data: conversation, error: convError } = await supabase
                .from('conversations')
                .select('adopter_id, publisher_id')
                .eq('id', message.conversation_id)
                .single();

            if (convError || !conversation) {
                console.error('Error fetching conversation:', convError);
                throw new Error('Conversation not found');
            }

            // Determine recipient (the one who didn't send the message)
            userId = message.sender_id === conversation.adopter_id
                ? conversation.publisher_id
                : conversation.adopter_id;

            body = message.content;
            title = 'Nuevo mensaje en el chat';
            url = '/profile'; // Redirect to messages tab in profile
        } else {
            // Direct call payload
            userId = payload.user_id;
            title = payload.title || 'Huellas Digitales';
            body = payload.body || 'Tienes una nueva notificación';
            url = payload.url || '/';
        }

        if (!userId) {
            return new Response(
                JSON.stringify({ error: 'Target User ID not found' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        console.log('Sending push notification to user:', userId);

        // Get user's push subscriptions
        const { data: subscriptions, error: subError } = await supabase
            .from('push_subscriptions')
            .select('*')
            .eq('user_id', userId);

        if (subError) {
            console.error('Error fetching subscriptions:', subError);
            throw subError;
        }

        if (!subscriptions || subscriptions.length === 0) {
            console.log('No push subscriptions found for user:', userId);
            return new Response(
                JSON.stringify({ message: 'No subscriptions found' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Import web-push library
        const webPush = await import("https://esm.sh/web-push@3.6.7");

        webPush.setVapidDetails(
            'mailto:noreply@huellasdigitales.app',
            VAPID_PUBLIC_KEY,
            VAPID_PRIVATE_KEY
        );

        const pushPayload = JSON.stringify({
            title,
            body,
            icon: '/logo-192.png',
            badge: '/logo-192.png',
            url,
            timestamp: Date.now()
        });

        // Send to all subscriptions
        const results = await Promise.allSettled(
            subscriptions.map(async (sub) => {
                try {
                    const pushSubscription = {
                        endpoint: sub.endpoint,
                        keys: {
                            p256dh: sub.p256dh,
                            auth: sub.auth
                        }
                    };

                    await webPush.sendNotification(pushSubscription, pushPayload);
                    return { success: true, endpoint: sub.endpoint };
                } catch (error: any) {
                    console.error('Push failed:', error.message);

                    // Remove invalid subscriptions (410 Gone or 404 Not Found)
                    if (error.statusCode === 410 || error.statusCode === 404) {
                        await supabase
                            .from('push_subscriptions')
                            .delete()
                            .eq('id', sub.id);
                    }

                    return { success: false, error: error.message, endpoint: sub.endpoint };
                }
            })
        );

        const successful = results.filter(r => r.status === 'fulfilled' && (r.value as any).success).length;
        console.log(`Push notifications sent: ${successful}/${subscriptions.length}`);

        return new Response(
            JSON.stringify({
                message: 'Push notifications processed',
                sent: successful,
                total: subscriptions.length
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (error: any) {
        console.error('Error in send-push-notification:', error);
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});

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

            // 1. Fetch conversation details to find recipients
            const { data: conversation, error: convError } = await supabase
                .from('conversations')
                .select('adopter_id, publisher_id')
                .eq('id', message.conversation_id)
                .single();

            if (convError || !conversation) {
                console.error('Error fetching conversation:', convError);
                throw new Error('Conversation not found');
            }

            // 2. Determine recipient and sender IDs
            let senderId: string;

            if (message.sender_id === conversation.adopter_id) {
                userId = conversation.publisher_id;
                senderId = conversation.adopter_id;
            } else {
                userId = conversation.adopter_id;
                senderId = conversation.publisher_id;
            }

            // 3. Fetch Sender Profile for Rich Notifications
            const { data: senderProfile } = await supabase
                .from('profiles')
                .select('full_name, avatar_url')
                .eq('id', senderId)
                .single();

            const senderName = senderProfile?.full_name || 'Alguien';

            // 4. Construct Rich Notification
            title = `${senderName}`;
            body = message.content;

            // Smart Navigation: Open directly to chats tab
            url = '/profile?tab=chats';

            // 5. Use Avatar if available (otherwise default logo)
            const icon = senderProfile?.avatar_url || '/logo-192.png';

            // 6. Grouping tag (groups messages by conversation)
            const tag = `conversation-${message.conversation_id}`;

            // Prepare payload with extra rich data for the Service Worker
            const pushPayload = JSON.stringify({
                title,
                body,
                icon, // Sender avatar
                badge: '/logo-192.png', // Small monochrome icon for status bar
                image: message.content.includes('imagen') ? icon : undefined, // Optional: show big image if attachment (simplified logic)
                url,
                tag, // Grouping
                renotify: true, // Vibrate again even if group exists
                timestamp: Date.now(),
                data: {
                    conversationId: message.conversation_id,
                    senderId: senderId
                }
            });

            // Need to redefine pushPayload usage below since we changed the logic flow
            // Move the rest of the logic out or restructure slightly

            // ... (Send logic follows)

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

        } else if (payload.record && payload.table === 'animals' && payload.type === 'INSERT') {
            const animal = payload.record;

            // Only notify for "Perdido" status
            if (animal.status !== 'perdido' || !animal.province) {
                return new Response(
                    JSON.stringify({ message: 'Not a lost pet or no province specified, skipping.' }),
                    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                );
            }

            console.log(`Processing lost pet alert for province: ${animal.province}`);

            // 1. Find users in the same province
            const { data: profiles, error: profileError } = await supabase
                .from('profiles')
                .select('id')
                .eq('province', animal.province);

            if (profileError) throw profileError;

            const userIds = profiles.map(p => p.id).filter(id => id !== animal.user_id); // Exclude sender

            if (userIds.length === 0) {
                return new Response(
                    JSON.stringify({ message: 'No users found in this province.' }),
                    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                );
            }

            // 2. Prepare payload
            title = '¡Alerta de Mascota Perdida!';
            body = `Se perdió un ${animal.type} en ${animal.location || animal.province}. ¡Ayuda a encontrarlo!`;
            url = `/mascota/${animal.id}`;
            const icon = animal.image_url || '/logo-192.png';
            const tag = `lost-pet-${animal.province}`;

            const pushPayload = JSON.stringify({
                title,
                body,
                icon,
                badge: '/logo-192.png',
                image: animal.image_url,
                url,
                tag,
                renotify: true,
                timestamp: Date.now(),
                data: {
                    animalId: animal.id,
                    type: 'lost_pet'
                }
            });

            // 3. Get subscriptions for all these users
            const { data: subscriptions, error: subError } = await supabase
                .from('push_subscriptions')
                .select('*')
                .in('user_id', userIds);

            if (subError) throw subError;

            if (!subscriptions || subscriptions.length === 0) {
                return new Response(
                    JSON.stringify({ message: 'No subscriptions found for target users.' }),
                    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                );
            }

            // Import web-push (re-import or move to top if possible, but keep here for now to match block)
            const webPush = await import("https://esm.sh/web-push@3.6.7");
            webPush.setVapidDetails(
                'mailto:noreply@huellasdigitales.app',
                VAPID_PUBLIC_KEY,
                VAPID_PRIVATE_KEY
            );

            // 4. Send notifications
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
                        return { success: true };
                    } catch (error: any) {
                        if (error.statusCode === 410 || error.statusCode === 404) {
                            await supabase.from('push_subscriptions').delete().eq('id', sub.id);
                        }
                        return { success: false, error: error.message };
                    }
                })
            );

            const successful = results.filter(r => r.status === 'fulfilled' && (r.value as any).success).length;

            return new Response(
                JSON.stringify({
                    message: 'Lost pet alerts sent',
                    sent: successful,
                    target_users: userIds.length,
                    total_subs: subscriptions.length
                }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );

        } else {
            return new Response(
                JSON.stringify({ message: 'Event type not handled or ignored.' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }



    } catch (error: any) {
        console.error('Error in send-push-notification:', error);
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});

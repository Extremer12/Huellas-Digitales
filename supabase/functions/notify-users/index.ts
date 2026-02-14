
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
        );

        const payload = await req.json();
        console.log("Webhook received:", payload);

        const { type, record } = payload;

        // Solo procesar INSERT de animales 'perdido'
        if (type !== "INSERT" || record.status !== "perdido" || !record.province) {
            console.log("Ignorado: No es un animal perdido o falta provincia.");
            return new Response(JSON.stringify({ message: "Ignored" }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 200,
            });
        }

        const province = record.province;
        console.log(`Buscando usuarios en ${province} para notificar...`);

        // 1. Obtener usuarios de la misma provincia que tengan tokens de notificación
        // Asumimos que existe una tabla 'push_subscriptions' o similar, o usamos 'profiles' si guardamos tokens ahí.
        // Por ahora, consultaremos 'profiles' para ver cuántos hay, y simularemos el envío.
        // Si tienes OneSignal, aquí iría la llamada a su API.

        const { data: users, error: usersError } = await supabaseClient
            .from("profiles")
            .select("id, push_token") // Asumiendo que 'push_token' existe o se usará 'push_subscriptions' join
            .eq("province", province);

        if (usersError) throw usersError;

        console.log(`Encontrados ${users?.length || 0} usuarios en ${province}.`);

        // TODO: Integrar con OneSignal o FCM aquí
        // Por ahora, solo logueamos el éxito.

        // Ejemplo de cómo sería con OneSignal (comentado)
        /*
        if (users.length > 0) {
            const tokens = users.map(u => u.push_token).filter(Boolean);
            if (tokens.length > 0) {
                await sendOneSignalNotification(tokens, "¡Mascota perdida cerca!", `Se perdió ${record.name} en ${record.location}. ¡Ayuda a encontrarlo!`);
            }
        }
        */

        return new Response(JSON.stringify({ message: `Notified ${users?.length} users` }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
        });

    } catch (error) {
        console.error("Error:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
        });
    }
});

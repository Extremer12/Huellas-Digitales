import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    // Handle CORS
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const url = new URL(req.url);
        const id = url.searchParams.get('id');

        if (!id) {
            return new Response("No ID provided", { status: 400 });
        }

        const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
        const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

        // Fetch animal details
        const { data: animal, error } = await supabase
            .from('animals')
            .select('name, description, image_url, status, type')
            .eq('id', id)
            .single();

        if (error || !animal) {
            return new Response("Animal not found", { status: 404 });
        }

        // Construct Metadata
        const title = animal.status === 'perdido'
            ? `⚠️ ¡SE BUSCA! Ayúdanos a encontrar a ${animal.name}`
            : `🐶 ¡Adopta a ${animal.name}!`;

        const description = animal.description.substring(0, 160) + "...";
        const imageUrl = animal.image_url || 'https://huellasdigitales.app/logo-512.png';
        const targetUrl = `https://huellasdigitales.app/mascota/${id}`;

        // Generate HTML with Meta Tags
        const html = `
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${title}</title>
                
                <!-- Open Graph / Facebook -->
                <meta property="og:type" content="website">
                <meta property="og:url" content="${targetUrl}">
                <meta property="og:title" content="${title}">
                <meta property="og:description" content="${description}">
                <meta property="og:image" content="${imageUrl}">

                <!-- Twitter -->
                <meta property="twitter:card" content="summary_large_image">
                <meta property="twitter:url" content="${targetUrl}">
                <meta property="twitter:title" content="${title}">
                <meta property="twitter:description" content="${description}">
                <meta property="twitter:image" content="${imageUrl}">

                <!-- Redirect to App -->
                <script>
                    window.location.href = "${targetUrl}";
                </script>
            </head>
            <body>
                <p>Redirigiendo a <a href="${targetUrl}">Huellas Digitales</a>...</p>
            </body>
            </html>
        `;

        return new Response(html, {
            headers: { ...corsHeaders, 'Content-Type': 'text/html' },
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});

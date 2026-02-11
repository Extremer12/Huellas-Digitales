
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const url = new URL(req.url)
        const petId = url.searchParams.get('id')

        if (!petId) {
            return new Response("Missing pet ID", { status: 400 })
        }

        // Initialize Supabase Client
        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        const supabase = createClient(supabaseUrl, supabaseKey)

        // Fetch Pet Data
        const { data: animal, error } = await supabase
            .from('animals')
            .select('*')
            .eq('id', petId)
            .single()

        if (error || !animal) {
            return new Response("Pet not found", { status: 404 })
        }

        // Construct Metadata
        const title = `${animal.name} - ${animal.status === 'perdido' ? '¡Ayúdame a volver a casa!' : 'En Adopción'}`
        const description = `Conoce a ${animal.name}, un ${animal.type} de ${animal.age} años. ${animal.description?.substring(0, 100)}...`
        const imageUrl = animal.image_url || 'https://huellas-digitales.com/logo-512.png'
        const appUrl = `https://huellas-digitales.com/mascota/${petId}` // Cambiar por dominio real

        // Generate HTML with OG Tags
        const html = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>${title}</title>
        <meta name="description" content="${description}">
        
        <!-- Open Graph / Facebook / WhatsApp -->
        <meta property="og:type" content="article" />
        <meta property="og:title" content="${title}" />
        <meta property="og:description" content="${description}" />
        <meta property="og:image" content="${imageUrl}" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:url" content="${appUrl}" />
        
        <!-- Twitter -->
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="${title}" />
        <meta name="twitter:description" content="${description}" />
        <meta name="twitter:image" content="${imageUrl}" />

        <!-- Redirect to App -->
        <script>
          window.location.href = "/?pet=${petId}";
        </script>
      </head>
      <body>
        <h1>${title}</h1>
        <img src="${imageUrl}" alt="${animal.name}" style="max-width: 100%;">
        <p>${description}</p>
        <a href="/?pet=${petId}">Ver en Huellas Digitales</a>
      </body>
      </html>
    `

        return new Response(html, {
            headers: { ...corsHeaders, 'Content-Type': 'text/html' },
        })

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        })
    }
})

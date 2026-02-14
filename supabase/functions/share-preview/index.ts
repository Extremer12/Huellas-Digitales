
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const animalId = url.searchParams.get("id");

    if (!animalId) {
      return new Response("Missing id", { status: 400 });
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Fetch animal details
    const { data: animal, error } = await supabaseClient
      .from("animals")
      .select("*")
      .eq("id", animalId)
      .single();

    if (error || !animal) {
      // Fallback or error page
      return new Response("Animal not found", { status: 404 });
    }

    // Prepare content
    const title = `Ayuda a ${animal.name || 'este animalito'} a encontrar ${animal.status === 'perdido' ? 'su casa' : 'un hogar'}`;
    const description = animal.description ? animal.description.substring(0, 150) + "..." : "Huellas Digitales - Red de Bienestar Animal";
    const imageUrl = animal.image_url || "https://huellas.app/og-default.png"; // Replace with actual default
    const appUrl = `https://huellas-digitales.vercel.app/pet/${animal.id}`; // Replace with actual domain

    // Return HTML with Open Graph tags
    const html = `
      <!DOCTYPE html>
      <html lang="es">
        <head>
          <meta charset="UTF-8">
          <title>${title}</title>
          <meta name="description" content="${description}">
          
          <!-- Open Graph / Facebook -->
          <meta property="og:type" content="website">
          <meta property="og:url" content="${appUrl}">
          <meta property="og:title" content="${title}">
          <meta property="og:description" content="${description}">
          <meta property="og:image" content="${imageUrl}">

          <!-- Twitter -->
          <meta property="twitter:card" content="summary_large_image">
          <meta property="twitter:url" content="${appUrl}">
          <meta property="twitter:title" content="${title}">
          <meta property="twitter:description" content="${description}">
          <meta property="twitter:image" content="${imageUrl}">

          <script>
            window.location.href = "${appUrl}";
          </script>
        </head>
        <body>
          <h1>${title}</h1>
          <p>${description}</p>
          <img src="${imageUrl}" style="max-width: 100%;" />
          <p>Redireccionando...</p>
        </body>
      </html>
    `;

    return new Response(html, {
      headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8" },
      status: 200,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});

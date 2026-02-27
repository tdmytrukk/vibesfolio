const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ success: false, error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }

    const parsedUrl = new URL(formattedUrl);
    const domain = parsedUrl.hostname.replace('www.', '');
    const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;

    let ogImage: string | null = null;
    let ogTitle: string | null = null;
    let ogDescription: string | null = null;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(formattedUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; BuilderJournal/1.0)',
          'Accept': 'text/html',
        },
        signal: controller.signal,
        redirect: 'follow',
      });

      clearTimeout(timeout);

      const html = await response.text();

      // Extract og:image
      const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i)
        || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i);
      if (ogImageMatch) {
        ogImage = ogImageMatch[1];
        // Make relative URLs absolute
        if (ogImage && !ogImage.startsWith('http')) {
          ogImage = new URL(ogImage, formattedUrl).href;
        }
      }

      // Extract og:title or <title>
      const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i)
        || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:title["']/i);
      if (ogTitleMatch) {
        ogTitle = ogTitleMatch[1];
      } else {
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        if (titleMatch) {
          ogTitle = titleMatch[1].trim();
        }
      }

      // Extract og:description or meta description
      const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i)
        || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:description["']/i);
      if (ogDescMatch) {
        ogDescription = ogDescMatch[1];
      } else {
        const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i)
          || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["']/i);
        if (descMatch) {
          ogDescription = descMatch[1];
        }
      }
    } catch (fetchError) {
      console.log('Could not fetch OG data, using fallbacks:', fetchError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        domain,
        ogImage,
        ogTitle,
        ogDescription,
        faviconUrl,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching metadata:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Failed to fetch metadata' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

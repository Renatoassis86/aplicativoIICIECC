import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { folderId } = await req.json()
    if (!folderId) {
      return new Response(JSON.stringify({ error: 'folderId is required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    // Método 1: embeddedfolderview (scraping HTML)
    const url = `https://drive.google.com/embeddedfolderview?id=${folderId}&resourcekey=&sort=1&direction=a`
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml',
      }
    })
    const html = await response.text()

    const files: { id: string; name: string; url: string }[] = []

    // Padrão 1: formato clássico com MIME type de imagem
    const regex1 = /"([a-zA-Z0-9_-]{28,})","([^"]+)"(?:,[^,]*){0,3},"image\/[^"]+"/g
    for (const m of html.matchAll(regex1)) {
      files.push({ id: m[1], name: m[2], url: `https://lh3.googleusercontent.com/d/${m[1]}` })
    }

    // Padrão 2: extrai IDs de thumbnails embutidos no HTML
    if (files.length === 0) {
      const regex2 = /\/thumbnail\?id=([a-zA-Z0-9_-]{28,})/g
      const seen = new Set<string>()
      for (const m of html.matchAll(regex2)) {
        if (!seen.has(m[1])) {
          seen.add(m[1])
          files.push({ id: m[1], name: m[1], url: `https://lh3.googleusercontent.com/d/${m[1]}` })
        }
      }
    }

    // Padrão 3: IDs de arquivos em links de preview
    if (files.length === 0) {
      const regex3 = /\/file\/d\/([a-zA-Z0-9_-]{28,})/g
      const seen = new Set<string>()
      for (const m of html.matchAll(regex3)) {
        if (!seen.has(m[1])) {
          seen.add(m[1])
          files.push({ id: m[1], name: m[1], url: `https://lh3.googleusercontent.com/d/${m[1]}` })
        }
      }
    }

    // Remove duplicatas
    const uniqueFiles = Array.from(new Map(files.map(f => [f.id, f])).values())

    return new Response(JSON.stringify({ files: uniqueFiles, total: uniqueFiles.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})

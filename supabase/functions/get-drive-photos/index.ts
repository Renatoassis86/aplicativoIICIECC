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

    // Link público da pasta (Exige que a pasta esteja como "Qualquer pessoa com o link pode ver")
    const url = `https://drive.google.com/embeddedfolderview?id=${folderId}`
    const response = await fetch(url)
    const html = await response.text()

    // Regex Ninja para extrair IDs de arquivos da view HTML do Google Drive
    // O Google Drive injeta os metadados dos arquivos em blocos JSON no HTML
    const idRegex = /"([^"]{25,})","([^"]+)",(true|false),"image\/[^"]+"/g
    const matches = [...html.matchAll(idRegex)]
    
    const files = matches.map(match => ({
      id: match[1],
      name: match[2],
      url: `https://lh3.googleusercontent.com/d/${match[1]}`
    }))

    // Remove duplicatas (Regex pode pegar referências múltiplas)
    const uniqueFiles = Array.from(new Map(files.map(item => [item.id, item])).values());

    return new Response(JSON.stringify({ files: uniqueFiles, total: uniqueFiles.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})

export default {
  async fetch(request, env) {
    if (env.ASSETS?.fetch) return env.ASSETS.fetch(request)
    return new Response('Watermark tool is ready', { headers: { 'content-type': 'text/plain; charset=utf-8' } })
  }
}

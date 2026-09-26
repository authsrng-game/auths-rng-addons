export async function onRequest(context) {
  const assetUrl = new URL(context.request.url);
  assetUrl.pathname = '/run/index.html';
  const res = await context.env.ASSETS.fetch(assetUrl.toString());
  const body = await res.arrayBuffer();
  return new Response(body, { status: 200, headers: { 'content-type': 'text/html; charset=utf-8' } });
}

// Admin visits endpoint for shazid.me (Cloudflare Pages Function).
// Self-contained: no imports.
// Auth: header `Authorization: Bearer <ADMIN_PASSWORD>` (env ADMIN_PASSWORD).
// Reads the rolling 'latest' list from the VISITS KV namespace (newest first).

function jsonResponse(body, status) {
  return new Response(JSON.stringify(body), {
    status: status || 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });
}

export async function onRequestGet(context) {
  var request = context.request;
  var env = context.env || {};

  var adminPassword = env.ADMIN_PASSWORD;
  if (!adminPassword) {
    return jsonResponse({ ok: false, code: 'ADMIN_NOT_CONFIGURED' }, 503);
  }

  var auth = request.headers.get('Authorization') || '';
  if (auth !== 'Bearer ' + adminPassword) {
    return jsonResponse({ ok: false, code: 'UNAUTHORIZED' }, 401);
  }

  var kv = env.VISITS;
  if (!kv) {
    return jsonResponse({ ok: false, code: 'KV_NOT_BOUND' }, 503);
  }

  var visits = [];
  try {
    var raw = await kv.get('latest');
    if (raw) {
      var parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) visits = parsed.slice(0, 200);
    }
  } catch (e) {
    visits = [];
  }

  return jsonResponse({ ok: true, count: visits.length, visits: visits });
}

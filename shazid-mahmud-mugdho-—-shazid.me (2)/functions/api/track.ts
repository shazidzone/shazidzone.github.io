// Visitor tracking endpoint for shazid.me (Cloudflare Pages Function).
// Self-contained: no imports, so it can never break on a missing module.
// Storage (KV namespace VISITS) and Telegram are both optional: if their
// bindings/env vars are absent, the endpoint still answers {ok:true}.

function parseUA(ua) {
  var u = ua || '';
  var isMobile = /Mobile|Android|iPhone|iPad|iPod/i.test(u);
  var device = isMobile ? 'Mobile' : 'Desktop';
  if (/iPad/i.test(u)) device = 'Tablet';
  var browser = 'Other';
  if (/Edg\//i.test(u)) browser = 'Edge';
  else if (/OPR\/|Opera/i.test(u)) browser = 'Opera';
  else if (/Chrome\//i.test(u)) browser = 'Chrome';
  else if (/Safari\//i.test(u)) browser = 'Safari';
  else if (/Firefox\//i.test(u)) browser = 'Firefox';
  var os = 'Other';
  if (/Android/i.test(u)) os = 'Android';
  else if (/iPhone|iPad|iPod/i.test(u)) os = 'iOS';
  else if (/Windows/i.test(u)) os = 'Windows';
  else if (/Mac OS X/i.test(u)) os = 'macOS';
  else if (/Linux/i.test(u)) os = 'Linux';
  return { device: device, browser: browser, os: os };
}

function jsonResponse(body, status) {
  return new Response(JSON.stringify(body), {
    status: status || 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });
}

export async function onRequestPost(context) {
  var request = context.request;
  var env = context.env || {};
  var waitUntil = context.waitUntil;

  var body = {};
  try {
    body = await request.json();
  } catch (e) {
    body = {};
  }

  var ip =
    request.headers.get('CF-Connecting-IP') ||
    (request.headers.get('X-Forwarded-For') || '').split(',')[0].trim() ||
    'unknown';
  var country = request.headers.get('CF-IPCountry') || 'unknown';
  var ua = String(body.ua || request.headers.get('User-Agent') || '');
  var parsed = parseUA(ua);
  var now = new Date();
  var visit = {
    ts: now.toISOString(),
    path: String(body.path || '/'),
    referrer: String(body.referrer || ''),
    screen: String(body.screen || ''),
    lang: String(body.lang || ''),
    ip: ip,
    country: country,
    device: parsed.device,
    browser: parsed.browser,
    os: parsed.os,
  };

  var stored = false;
  try {
    var kv = env.VISITS;
    if (kv) {
      var key =
        'v:' + now.getTime() + ':' + Math.random().toString(36).slice(2, 10);
      await kv.put(key, JSON.stringify(visit));
      var latest = [];
      try {
        var raw = await kv.get('latest');
        if (raw) {
          var parsedList = JSON.parse(raw);
          if (Array.isArray(parsedList)) latest = parsedList;
        }
      } catch (e) {
        latest = [];
      }
      latest.unshift(visit);
      await kv.put('latest', JSON.stringify(latest.slice(0, 200)));
      stored = true;
    }
  } catch (e) {
    stored = false;
  }

  // `telegram` reports that a notification was dispatched, not delivery:
  // the response is intentionally not delayed waiting for Telegram.
  var telegram = false;
  try {
    var token = env.TELEGRAM_BOT_TOKEN;
    var chatId = env.TELEGRAM_CHAT_ID;
    if (token && chatId) {
      var text =
        '👀 New visit — shazid.me\n' +
        'Time: ' + visit.ts + '\n' +
        'Page: ' + visit.path + '\n' +
        'From: ' + visit.country + ' (' + visit.ip + ')\n' +
        'Device: ' + visit.device + ' · ' + visit.browser + ' on ' + visit.os + '\n' +
        'Referrer: ' + (visit.referrer || '(direct)');
      var send = fetch('https://api.telegram.org/bot' + token + '/sendMessage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: text }),
      }).catch(function () {});
      telegram = true;
      if (waitUntil) waitUntil(send);
      else await send;
    }
  } catch (e) {
    telegram = false;
  }

  return jsonResponse({ ok: true, stored: stored, telegram: telegram });
}

export async function onRequestGet() {
  return jsonResponse({ ok: true, service: 'track' });
}

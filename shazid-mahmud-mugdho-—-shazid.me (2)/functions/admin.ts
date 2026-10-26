// Admin page for shazid.me visitor tracking (Cloudflare Pages Function).
// Self-contained: no imports, no external assets. Serves one standalone
// HTML page (inline CSS + JS) that reads /api/visits with a Bearer token
// the admin types in (kept in sessionStorage, never in the URL).

var ADMIN_HTML = '<!doctype html>\n' +
'<html lang="en">\n' +
'<head>\n' +
'<meta charset="UTF-8" />\n' +
'<meta name="viewport" content="width=device-width, initial-scale=1.0" />\n' +
'<title>shazid.me — Visitor Admin</title>\n' +
'<style>\n' +
'body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;background:#090B10;color:#F4F5F7;margin:0;padding:24px}\n' +
'h1{font-size:20px;margin:0 0 16px}\n' +
'.bar{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px}\n' +
'input,button{font-size:14px;padding:8px 10px;border-radius:8px;border:1px solid #2a2f3a;background:#141821;color:#F4F5F7}\n' +
'button{cursor:pointer;background:#3978FF;border-color:#3978FF}\n' +
'button:hover{opacity:.9}\n' +
'.status{margin-bottom:16px;color:#9aa3b2;font-size:14px}\n' +
'.error{color:#ff7a7a}\n' +
'table{width:100%;border-collapse:collapse;font-size:13px}\n' +
'th,td{text-align:left;padding:8px;border-bottom:1px solid #232838;vertical-align:top}\n' +
'th{color:#9aa3b2}\n' +
'td{word-break:break-all}\n' +
'</style>\n' +
'</head>\n' +
'<body>\n' +
'<h1>shazid.me — Visitor Admin</h1>\n' +
'<div class="bar">\n' +
'<input id="pw" type="password" placeholder="Admin password" autocomplete="off" />\n' +
'<button id="refresh">Refresh</button>\n' +
'</div>\n' +
'<div id="status" class="status">Enter the admin password, then Refresh.</div>\n' +
'<table>\n' +
'<thead><tr><th>Time</th><th>Page</th><th>IP</th><th>Country</th><th>Device</th><th>Browser / OS</th><th>Referrer</th><th>Screen</th></tr></thead>\n' +
'<tbody id="rows"></tbody>\n' +
'</table>\n' +
'<script>\n' +
'function esc(s){return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}\n' +
'function load(){\n' +
'  var pw=document.getElementById("pw").value;\n' +
'  var status=document.getElementById("status");\n' +
'  var rows=document.getElementById("rows");\n' +
'  if(!pw){status.textContent="Enter the admin password first.";status.className="status error";return}\n' +
'  try{sessionStorage.setItem("shazid_admin_pw",pw)}catch(e){}\n' +
'  status.textContent="Loading…";status.className="status";\n' +
'  fetch("/api/visits",{headers:{"Authorization":"Bearer "+pw}})\n' +
'    .then(function(r){return r.json().then(function(j){return {status:r.status,body:j}})})\n' +
'    .then(function(res){\n' +
'      var j=res.body;\n' +
'      if(res.status===401){status.textContent="Wrong password.";status.className="status error";rows.innerHTML="";return}\n' +
'      if(res.status===503 && j.code==="KV_NOT_BOUND"){status.textContent="Storage not connected yet (KV binding missing). Visits will appear once storage is connected.";status.className="status error";rows.innerHTML="";return}\n' +
'      if(res.status===503 && j.code==="ADMIN_NOT_CONFIGURED"){status.textContent="Admin not configured yet (ADMIN_PASSWORD is not set).";status.className="status error";rows.innerHTML="";return}\n' +
'      if(!j.ok){status.textContent="Could not load visits.";status.className="status error";rows.innerHTML="";return}\n' +
'      status.textContent=j.count+" visit(s), newest first.";\n' +
'      rows.innerHTML=j.visits.map(function(v){\n' +
'        return "<tr><td>"+esc(v.ts)+"</td><td>"+esc(v.path)+"</td><td>"+esc(v.ip)+"</td><td>"+esc(v.country)+"</td><td>"+esc(v.device)+"</td><td>"+esc(v.browser)+" / "+esc(v.os)+"</td><td>"+esc(v.referrer)+"</td><td>"+esc(v.screen)+"</td></tr>";\n' +
'      }).join("");\n' +
'    })\n' +
'    .catch(function(){status.textContent="Network error while loading visits.";status.className="status error"})\n' +
'}\n' +
'document.getElementById("refresh").addEventListener("click",load);\n' +
'document.getElementById("pw").addEventListener("keydown",function(e){if(e.key==="Enter")load()});\n' +
'try{var saved=sessionStorage.getItem("shazid_admin_pw");if(saved){document.getElementById("pw").value=saved;load()}}catch(e){}\n' +
'<\/script>\n' +
'</body>\n' +
'</html>\n';

export async function onRequestGet() {
  return new Response(ADMIN_HTML, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}

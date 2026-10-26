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
'*{box-sizing:border-box}\n' +
'body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;background:#090B10;color:#F4F5F7;margin:0;padding:24px}\n' +
'.wrap{max-width:1100px;margin:0 auto}\n' +
'header{margin-bottom:20px}\n' +
'h1{font-size:22px;margin:0 0 6px}\n' +
'.sub{color:#9aa3b2;font-size:14px;margin:0}\n' +
'.bar{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px}\n' +
'input,button{font-size:14px;padding:10px 12px;border-radius:8px;border:1px solid #2a2f3a;background:#141821;color:#F4F5F7}\n' +
'input{flex:1;min-width:220px}\n' +
'button{cursor:pointer;background:#3978FF;border-color:#3978FF;font-weight:600}\n' +
'button:hover{opacity:.9}\n' +
'.stats{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:16px}\n' +
'.card{background:#141821;border:1px solid #232838;border-radius:12px;padding:14px 18px;min-width:150px}\n' +
'.num{font-size:26px;font-weight:700}\n' +
'.lbl{color:#9aa3b2;font-size:13px;margin-top:2px}\n' +
'.status{margin-bottom:16px;color:#9aa3b2;font-size:14px}\n' +
'.error{color:#ff7a7a}\n' +
'.tablewrap{overflow-x:auto;border:1px solid #232838;border-radius:12px}\n' +
'table{width:100%;border-collapse:collapse;font-size:13px}\n' +
'th,td{text-align:left;padding:10px 12px;border-bottom:1px solid #232838;vertical-align:top}\n' +
'th{color:#9aa3b2;font-size:12px;text-transform:uppercase;letter-spacing:.04em;background:#10141d}\n' +
'tr:last-child td{border-bottom:none}\n' +
'td{word-break:break-all}\n' +
'</style>\n' +
'</head>\n' +
'<body>\n' +
'<div class="wrap">\n' +
'<header>\n' +
'<h1>shazid.me — Visitor Admin</h1>\n' +
'<p class="sub">Who visited your site, and from where.</p>\n' +
'</header>\n' +
'<div class="bar">\n' +
'<input id="pw" type="password" placeholder="Admin password" autocomplete="off" />\n' +
'<button id="refresh">Refresh</button>\n' +
'</div>\n' +
'<div class="stats">\n' +
'<div class="card"><div class="num" id="statTotal">–</div><div class="lbl">Total visits</div></div>\n' +
'<div class="card"><div class="num" id="statToday">–</div><div class="lbl">Visits today</div></div>\n' +
'<div class="card"><div class="num" id="statLast">–</div><div class="lbl">Last updated</div></div>\n' +
'</div>\n' +
'<div id="status" class="status">Enter the admin password, then Refresh.</div>\n' +
'<div class="tablewrap"><table>\n' +
'<thead><tr><th>Time</th><th>Page</th><th>IP</th><th>Country</th><th>Device</th><th>Browser / OS</th><th>Referrer</th><th>Screen</th></tr></thead>\n' +
'<tbody id="rows"></tbody>\n' +
'</table></div>\n' +
'</div>\n' +
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
'      status.className="status";\n' +
'      var today=new Date().toDateString();\n' +
'      var todayCount=0;\n' +
'      try{todayCount=j.visits.filter(function(v){var d=new Date(v.ts);return !isNaN(d) && d.toDateString()===today}).length}catch(e){todayCount=0}\n' +
'      document.getElementById("statTotal").textContent=j.count;\n' +
'      document.getElementById("statToday").textContent=todayCount;\n' +
'      document.getElementById("statLast").textContent=new Date().toLocaleTimeString();\n' +
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

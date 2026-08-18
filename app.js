const app=document.getElementById("app"), toast=document.getElementById("toast");
const pages={};

function shell(title,subtitle,body){return `<div class="content"><div class="notice"><b>${title}</b><br><span class="muted">${subtitle}</span></div>${body}</div>`}
function flash(t){toast.textContent=t;toast.style.display="block";setTimeout(()=>toast.style.display="none",1800)}
function esc(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]))}

pages.dashboard=()=>shell("Dashboard","คำนวณในเบราว์เซอร์เท่านั้น ไม่มีฐานข้อมูล ไม่มี localStorage ไม่มี Drive/Sheet/Docs",`
<div class="grid">
<div class="card"><h3>🔎 Screening</h3><p>แยก workflow คัดกรองกับประเมินให้ชัดเจน</p><button class="btn" onclick="go('screening')">เปิด</button></div>
<div class="card"><h3>🧠 Adult</h3><p>PHQ-9, GAD-7, DASS-21, WHO-5, PSS-10 และเครื่องมืออื่น</p><button class="btn" onclick="go('adult')">เปิด</button></div>
<div class="card"><h3>🧒 Child</h3><p>SDQ, SNAP-IV, ASRS, M-CHAT-R/F, DSPM workflow และพัฒนาการ</p><button class="btn" onclick="go('child')">เปิด</button></div>
<div class="card"><h3>📅 Workload</h3><p>ปฏิทิน/Waitlist แบบ session-only — รีเฟรชแล้วหาย</p><button class="btn" onclick="go('schedule')">เปิด</button></div>
</div>
<div class="card" style="margin-top:16px"><h3>หลักการข้อมูล</h3><ul class="list"><li>ไม่มี Google Sheets / Drive / Docs</li><li>ไม่มี server-side database</li><li>ไม่มี localStorage / IndexedDB / cookies สำหรับ case data</li><li>ไม่มี analytics/third-party tracker ใน starter นี้</li><li>ข้อมูลที่กรอกใช้เพื่อคำนวณ/แสดงผลใน session และหายเมื่อ reload/ปิดหน้า</li></ul></div>`);

pages.adult=()=>shell("จิตวิทยาคลินิก — ผู้ใหญ่","เครื่องมือคำนวณตัวอย่างด้านล่างเป็น score calculator; ตัวข้อคำถามของแบบทดสอบที่มีลิขสิทธิ์/ข้อจำกัดไม่ถูกฝังในโค้ด",`
<div class="grid">
<div class="card"><h3>PHQ-9</h3><p class="muted">กรอกคะแนนรายข้อ 0–3 จากแบบฟอร์มที่ได้รับอนุญาต</p>${scoreInputs("phq",9)}<button class="btn" onclick="calcPHQ()">คำนวณ</button><div id="phqResult"></div></div>
<div class="card"><h3>GAD-7</h3><p class="muted">กรอกคะแนนรายข้อ 0–3 จากแบบฟอร์มที่ได้รับอนุญาต</p>${scoreInputs("gad",7)}<button class="btn" onclick="calcGAD()">คำนวณ</button><div id="gadResult"></div></div>
<div class="card"><h3>WHO-5</h3><p class="muted">ใส่คะแนน 0–5 จำนวน 5 ข้อ แล้วคำนวณเป็นคะแนนร้อยละ</p>${scoreInputs("who",5,0,5)}<button class="btn" onclick="calcWHO()">คำนวณ</button><div id="whoResult"></div></div>
<div class="card"><h3>Risk / MSE / Formulation</h3><p>ใช้เป็น template สำหรับการบันทึกเชิงคลินิก ไม่แทนการประเมินโดยผู้ประกอบวิชาชีพ</p><button class="btn" onclick="go('notes')">เปิด template</button></div>
</div>
<div class="card" style="margin-top:16px"><h3>เครื่องมือที่เตรียมหมวดไว้</h3><span class="tag">DASS-21</span><span class="tag">PSS-10</span><span class="tag">Rosenberg</span><span class="tag">AUDIT</span><span class="tag">Mini-Cog</span><span class="tag">BDI/BAI*</span><span class="tag">C-SSRS*</span><p class="small muted">* ฝังเฉพาะ calculator / interface ที่ไม่ทำซ้ำข้อคำถามหรือเนื้อหาที่มีลิขสิทธิ์/เงื่อนไขการใช้งาน</p></div>`);

function scoreInputs(prefix,n,min=0,max=3){let s="";for(let i=1;i<=n;i++)s+=`<div class="field"><label>${i}</label><input id="${prefix}${i}" type="number" min="${min}" max="${max}" value="0"></div>`;return s}
function nums(prefix,n){return Array.from({length:n},(_,i)=>Number(document.getElementById(prefix+(i+1)).value)||0)}
function result(id,score,text,extra=""){document.getElementById(id).innerHTML=`<div class="result"><div class="score">${score}</div><b>${text}</b>${extra?`<p>${extra}</p>`:""}</div>`}
function calcPHQ(){let s=nums("phq",9).reduce((a,b)=>a+b,0);let t=s<=4?"minimal":s<=9?"mild":s<=14?"moderate":s<=19?"moderately severe":"severe";result("phqResult",s,t,"คะแนนเป็นตัวช่วยประกอบการประเมิน ไม่ใช่การวินิจฉัย")}
function calcGAD(){let s=nums("gad",7).reduce((a,b)=>a+b,0);let t=s<=4?"minimal":s<=9?"mild":s<=14?"moderate":"severe";result("gadResult",s,t,"คะแนนเป็นตัวช่วยประกอบการประเมิน ไม่ใช่การวินิจฉัย")}
function calcWHO(){let s=nums("who",5).reduce((a,b)=>a+b,0)*4;result("whoResult",s+"%","WHO-5 raw percentage","ใช้ร่วมกับแนวทางการแปลผลและบริบททางคลินิก")}

pages.child=()=>shell("จิตพัฒนาการเด็ก","เน้น workflow และ calculator โดยไม่ฝังแบบประเมินฉบับเต็มที่มีข้อจำกัดด้านลิขสิทธิ์/ใบอนุญาต",`
<div class="grid">
<div class="card"><h3>Developmental intake</h3>${textArea("devConcern","ข้อกังวลของผู้ปกครอง / เหตุผลที่มารับบริการ")}${textArea("devHistory","ประวัติพัฒนาการที่สำคัญ")}${textArea("devContext","บริบทบ้าน/โรงเรียน/การสื่อสาร/การเล่น")}<button class="btn" onclick="generateIntake()">สร้างสรุป</button><div id="intakeResult"></div></div>
<div class="card"><h3>Corrected Age</h3><div class="row">${dateField("birth","วันเกิด")}${dateField("assessment","วันที่ประเมิน")}</div><div class="field"><label>อายุครรภ์เมื่อคลอด (สัปดาห์)</label><input id="ga" type="number" min="20" max="42" value="32"></div><button class="btn" onclick="correctedAge()">คำนวณ</button><div id="ageResult"></div></div>
<div class="card"><h3>Growth / Percentile</h3><p>เตรียมช่องสำหรับเชื่อม reference table ของ WHO/กรมอนามัย โดยไม่เก็บข้อมูล</p>${numberField("ageMonths","อายุ (เดือน)")}${numberField("height","ส่วนสูง (cm)")}${numberField("weight","น้ำหนัก (kg)")}${numberField("head","รอบศีรษะ (cm)")}<button class="btn" onclick="growthDemo()">ตรวจข้อมูล</button><div id="growthResult"></div></div>
<div class="card"><h3>Early Intervention pathway</h3><ol class="list"><li>รับ concern</li><li>screening ที่เหมาะสม</li><li>พิจารณาประเมินเชิงลึก</li><li>ประสานผู้เชี่ยวชาญตาม domain</li><li>วางแผนติดตาม</li></ol></div>
</div>`);

function textArea(id,label){return `<div class="field"><label>${label}</label><textarea id="${id}" rows="4"></textarea></div>`}
function numberField(id,label){return `<div class="field"><label>${label}</label><input id="${id}" type="number" step="0.1"></div>`}
function dateField(id,label){return `<div class="field"><label>${label}</label><input id="${id}" type="date"></div>`}
function generateIntake(){let a=esc(document.getElementById("devConcern").value),b=esc(document.getElementById("devHistory").value),c=esc(document.getElementById("devContext").value);document.getElementById("intakeResult").innerHTML=`<div class="result"><b>Parent concern</b><p>${a||"-"}</p><b>Developmental history</b><p>${b||"-"}</p><b>Context</b><p>${c||"-"}</p></div>`}
function correctedAge(){let b=new Date(document.getElementById("birth").value),a=new Date(document.getElementById("assessment").value),ga=Number(document.getElementById("ga").value);if(!b.getTime()||!a.getTime())return flash("กรอกวันที่ให้ครบ");let chronological=(a-b)/86400000;let weeks=Math.round(chronological/7);let correctedWeeks=weeks-(40-ga);document.getElementById("ageResult").innerHTML=`<div class="result"><b>ประมาณ corrected age</b><p>${Math.floor(correctedWeeks/4.345)} เดือน ${Math.round(correctedWeeks%4.345)} สัปดาห์</p><p class="small muted">เป็นการคำนวณประมาณการเพื่อช่วยงาน ต้องพิจารณาแนวทางของหน่วยงาน</p></div>`}
function growthDemo(){document.getElementById("growthResult").innerHTML=`<div class="result warning">ช่องข้อมูลพร้อมใช้ แต่ percentile ต้องใช้ reference dataset ที่ถูกต้องตามเพศ/อายุและแหล่งมาตรฐานก่อนนำไปใช้จริง</div>`}

pages.screening=()=>shell("Screening vs Assessment","แยกการใช้งานเพื่อป้องกันการตีความ screening เป็น diagnosis",`
<div class="grid">
<div class="card"><h3>🔎 Screening</h3><p>เป้าหมาย: ระบุความเสี่ยง/ข้อกังวลและตัดสินใจว่าควรประเมินต่อหรือไม่</p><span class="tag">SDQ</span><span class="tag">M-CHAT-R/F</span><span class="tag">AUDIT</span><span class="tag">DSPM</span><div class="result"><b>Positive → next step</b><ol><li>ทบทวนบริบทและ false positives</li><li>เลือก assessment ที่เหมาะสม</li><li>พิจารณา referral ตาม domain</li></ol></div></div>
<div class="card"><h3>📐 Assessment</h3><p>เป้าหมาย: ประเมินอาการ/การทำหน้าที่อย่างละเอียดและติดตามการเปลี่ยนแปลง</p><span class="tag">PHQ-9</span><span class="tag">GAD-7</span><span class="tag">DASS-21</span><span class="tag">WHO-5</span><span class="tag">PSS-10</span><div class="result"><b>Workflow</b><ol><li>กำหนดคำถามทางคลินิก</li><li>เลือกเครื่องมือที่เหมาะสม</li><li>ตีความร่วมกับสัมภาษณ์/ข้อมูลหลายแหล่ง</li><li>ติดตามผลตามช่วงเวลา</li></ol></div></div>
</div>`);

pages.schedule=()=>shell("ตารางงาน","ข้อมูลในหน้านี้เป็น session-only: ไม่บันทึกลง browser, Drive, Sheet หรือ server",`
<div class="card"><h3>เพิ่มรายการชั่วคราว</h3><div class="row"><div class="field"><label>เวลา</label><input id="eventTime" type="datetime-local"></div><div class="field"><label>Case code (ห้ามใช้ชื่อจริง)</label><input id="eventCase" placeholder="เช่น C-001"></div></div><div class="field"><label>ประเภท</label><select id="eventType"><option>Initial assessment</option><option>Follow-up</option><option>Reassessment</option><option>Supervision</option><option>Teaching</option></select></div><button class="btn" onclick="addEvent()">เพิ่มใน session</button></div>
<div class="card" style="margin-top:16px"><h3>รายการ</h3><div id="events"><p class="muted">ยังไม่มีรายการ</p></div><button class="secondary" onclick="clearEvents()">ล้างข้อมูล session</button></div>`);

let events=[];
function addEvent(){events.push({time:document.getElementById("eventTime").value,caseCode:document.getElementById("eventCase").value,type:document.getElementById("eventType").value});renderEvents()}
function renderEvents(){document.getElementById("events").innerHTML=events.length?`<table class="table"><tr><th>เวลา</th><th>Case</th><th>ประเภท</th></tr>${events.map(e=>`<tr><td>${esc(e.time)}</td><td>${esc(e.caseCode)}</td><td>${esc(e.type)}</td></tr>`).join("")}</table>`:"<p class='muted'>ยังไม่มีรายการ</p>"}
function clearEvents(){events=[];renderEvents()}

pages.notes=()=>shell("Notes / Case Formulation","Template สำหรับการเขียนงานคลินิก; อย่าใส่ข้อมูลระบุตัวบุคคลในเว็บไซต์นี้",`
<div class="card">${textArea("presenting","Presenting problem")}${textArea("predisposing","Predisposing factors")}${textArea("precipitating","Precipitating factors")}${textArea("perpetuating","Perpetuating factors")}${textArea("protective","Protective factors")}${textArea("goals","Goals / intervention plan")}${textArea("risk","Risk assessment summary")}${textArea("mse","MSE summary")}<button class="btn" onclick="makeNote()">สร้าง progress note</button><div id="noteResult"></div></div>`);
function makeNote(){let ids=["presenting","predisposing","precipitating","perpetuating","protective","goals","risk","mse"];let names=["Presenting","Predisposing","Precipitating","Perpetuating","Protective","Goals","Risk","MSE"];let out=ids.map((id,i)=>`<p><b>${names[i]}</b><br>${esc(document.getElementById(id).value)||"-"}</p>`).join("");document.getElementById("noteResult").innerHTML=`<div class="result">${out}</div>`}

pages.reference=()=>shell("Reference","หน้านี้ไม่ฝังข้อความเต็มของ DSM-5-TR, ICD-11 หรือเครื่องมือที่มีลิขสิทธิ์",`
<div class="grid">
<div class="card"><h3>DSM-5-TR</h3><p>ทำเป็น browser/index ได้โดยใส่ชื่อหมวดและลิงก์ไปยังแหล่งที่ผู้ใช้มีสิทธิ์เข้าถึง</p></div>
<div class="card"><h3>ICD-11</h3><p>ใช้เป็น diagnostic reference โดยไม่คัดลอกเนื้อหาที่มีลิขสิทธิ์มาไว้ใน repository</p></div>
<div class="card"><h3>Instrument licensing</h3><p>ตรวจ permission ของแต่ละเครื่องมือก่อนฝังข้อคำถาม/แบบฟอร์มฉบับเต็ม</p></div>
</div>`);

pages.resources=()=>shell("Psychoeducation Library","ตัวอย่างโครงสร้าง resource library แบบไม่เก็บผู้ป่วย",`
<div class="grid">
${["Sleep hygiene","Stress management","Emotion regulation","Parent psychoeducation","School collaboration","When to seek further assessment"].map(x=>`<div class="card"><h3>${x}</h3><p class="muted">เพิ่มเนื้อหาที่หน่วยงานอนุญาตให้เผยแพร่ได้</p><button class="secondary" onclick="flash('Template พร้อมให้เติมเนื้อหา')">เปิด</button></div>`).join("")}
</div>`);

pages.statistics=()=>shell("Statistics","สถิติจากข้อมูลที่ผู้ใช้กรอกใน session เท่านั้น",`
<div class="card"><h3>Session calculator</h3>${numberField("nTotal","จำนวน session")}${numberField("nAssess","จำนวน assessment")}${numberField("nFollow","จำนวน follow-up")}<button class="btn" onclick="stats()">คำนวณ</button><div id="statsResult"></div></div>`);
function stats(){let a=+document.getElementById("nTotal").value||0,b=+document.getElementById("nAssess").value||0,c=+document.getElementById("nFollow").value||0;document.getElementById("statsResult").innerHTML=`<div class="result">Assessment: ${a?Math.round(b/a*100):0}%<br>Follow-up: ${a?Math.round(c/a*100):0}%</div>`}

pages.privacy=()=>shell("Privacy / Data architecture","โหมดนี้ตั้งใจออกแบบให้ไม่สร้างระบบเก็บข้อมูล",`
<div class="card"><h3>Data flow</h3><pre>User input → Browser memory → calculation/render → print
                         ↘ refresh/close → data gone</pre>
<ul class="list"><li>ไม่ใช้ localStorage</li><li>ไม่ใช้ sessionStorage</li><li>ไม่ใช้ IndexedDB</li><li>ไม่มี fetch ไป database</li><li>Google Apps Script ใช้ doGet() ส่งหน้าเว็บอย่างเดียว</li><li>GitHub Pages เป็น static hosting อย่างเดียว</li></ul></div>`);

function go(page){document.querySelectorAll("nav button").forEach(b=>b.classList.toggle("active",b.dataset.page===page));app.innerHTML=pages[page]?pages[page]():pages.dashboard()}
document.querySelectorAll("nav button").forEach(b=>b.addEventListener("click",()=>go(b.dataset.page)));
document.getElementById("printBtn").addEventListener("click",()=>window.print());
document.getElementById("search").addEventListener("input",e=>{let q=e.target.value.toLowerCase();document.querySelectorAll("nav button").forEach(b=>b.style.display=b.textContent.toLowerCase().includes(q)?"block":"none")});
go("dashboard");

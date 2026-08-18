const main=document.getElementById("main"), toast=document.getElementById("toast");
let session={events:[],screenings:0,assessments:0};

function esc(x){return String(x??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]))}
function flash(x){toast.textContent=x;toast.style.display="block";setTimeout(()=>toast.style.display="none",1600)}
function printPage(){window.print()}
function clearSession(){session={events:[],screenings:0,assessments:0};go("dashboard");flash("ล้างข้อมูล session แล้ว")}
function shell(title,sub,body){return `<div class="content"><section class="hero"><h2>${title}</h2><p>${sub}</p></section>${body}</div>`}
function field(id,label,type="text",extra=""){return `<div class="field"><label>${label}</label><input id="${id}" type="${type}" ${extra}></div>`}
function area(id,label,rows=4){return `<div class="field"><label>${label}</label><textarea id="${id}" rows="${rows}"></textarea></div>`}
function navActive(page){document.querySelectorAll("#nav button").forEach(b=>b.classList.toggle("active",b.dataset.page===page))}
function go(page){navActive(page);main.innerHTML=(pages[page]||pages.dashboard)()}

const pages={};

pages.dashboard=()=>shell("Professional Psychology Toolkit v2","เครื่องมือช่วยงานแบบ privacy-first — ข้อมูลเคสไม่ถูกส่งไป server หรือบันทึกลง browser storage",`
<div class="grid">
<div class="card"><div class="kpi">${session.screenings}</div><div class="muted">Screening ใน session</div></div>
<div class="card"><div class="kpi">${session.assessments}</div><div class="muted">Assessment ใน session</div></div>
<div class="card"><div class="kpi">${session.events.length}</div><div class="muted">รายการนัดใน session</div></div>
<div class="card"><div class="kpi">0</div><div class="muted">ข้อมูลที่เก็บถาวร</div></div>
</div>
<div class="grid" style="margin-top:14px">
${[
["🔎","Screening Hub","คัดกรอง → positive → เลือก assessment","screening"],
["🧠","Adult Clinical","PHQ-9, GAD-7, WHO-5 และ clinical templates","adult"],
["🧒","Child Development","พัฒนาการ, corrected age, intake และ referral","child"],
["🧩","Case Formulation","5Ps + goals + risk + protective factors","formulation"],
["📅","Schedule","นัดหมาย/Waitlist แบบ session-only","schedule"],
["📊","Statistics","สถิติ workload จากข้อมูลใน session","statistics"]
].map(x=>`<div class="card"><h3>${x[0]} ${x[1]}</h3><p class="muted">${x[2]}</p><button class="btn" onclick="go('${x[3]}')">เปิด</button></div>`).join("")}
</div>
<div class="card" style="margin-top:14px"><h3>Privacy architecture</h3>
<div class="flow"><div class="node">User input</div><div class="arrow">→</div><div class="node">Browser memory</div><div class="arrow">→</div><div class="node">Calculation</div><div class="arrow">→</div><div class="node">Print/PDF</div><div class="arrow">→</div><div class="node">Refresh = gone</div></div>
<p class="small muted">v2 ไม่ใช้ localStorage, sessionStorage, IndexedDB, Google Sheets, Drive, Docs, database หรือ analytics ใน starter นี้</p></div>`);

function scoreInputs(prefix,n,max=3){return Array.from({length:n},(_,i)=>`<div class="field"><label>ข้อ ${i+1}</label><input id="${prefix}${i+1}" type="number" min="0" max="${max}" value="0"></div>`).join("")}
function sum(prefix,n){return Array.from({length:n},(_,i)=>Number(document.getElementById(prefix+(i+1)).value)||0).reduce((a,b)=>a+b,0)}
pages.adult=()=>shell("Adult Clinical","ตัวคำนวณใช้เมื่อผู้ใช้มีแบบฟอร์มที่ได้รับอนุญาต; ไม่ฝังข้อความเครื่องมือที่มีข้อจำกัดด้านลิขสิทธิ์",`
<div class="grid">
<div class="card"><h3>PHQ-9 Calculator</h3>${scoreInputs("phq",9)}<button class="btn" onclick="calcPHQ()">คำนวณ</button><div id="phqR"></div></div>
<div class="card"><h3>GAD-7 Calculator</h3>${scoreInputs("gad",7)}<button class="btn" onclick="calcGAD()">คำนวณ</button><div id="gadR"></div></div>
<div class="card"><h3>WHO-5 Calculator</h3>${scoreInputs("who",5,5)}<button class="btn" onclick="calcWHO()">คำนวณ</button><div id="whoR"></div></div>
<div class="card"><h3>Clinical toolkit</h3><span class="tag">DASS-21</span><span class="tag">PSS-10</span><span class="tag">Rosenberg</span><span class="tag">AUDIT</span><span class="tag">Mini-Cog</span><span class="tag">MSE</span><span class="tag">Risk</span><p class="small muted">ทำ calculator เพิ่มได้ตาม license/permission ของเครื่องมือ</p></div>
</div>`);

function put(id,score,label,detail=""){document.getElementById(id).innerHTML=`<div class="result"><div class="score">${score}</div><b>${label}</b><p class="small muted">${detail}</p></div>`}
function calcPHQ(){let s=sum("phq",9);let t=s<=4?"minimal":s<=9?"mild":s<=14?"moderate":s<=19?"moderately severe":"severe";session.assessments++;put("phqR",s,t,"คะแนนประกอบการประเมิน ไม่ใช่ diagnosis");}
function calcGAD(){let s=sum("gad",7);let t=s<=4?"minimal":s<=9?"mild":s<=14?"moderate":"severe";session.assessments++;put("gadR",s,t,"คะแนนประกอบการประเมิน ไม่ใช่ diagnosis");}
function calcWHO(){let s=sum("who",5)*4;session.assessments++;put("whoR",s+"%","Raw percentage","ควรใช้เกณฑ์และบริบทตามคู่มือเครื่องมือ");}

pages.screening=()=>shell("Screening Hub","ออกแบบให้ screening เป็นตัวคัดกรอง ไม่ใช่การวินิจฉัย",`
<div class="grid">
<div class="card"><h3>เลือก domain</h3>
<div class="check"><input type="checkbox" id="sMood"><label for="sMood">Mood / depression concern</label></div>
<div class="check"><input type="checkbox" id="sAnxiety"><label for="sAnxiety">Anxiety concern</label></div>
<div class="check"><input type="checkbox" id="sDev"><label for="sDev">Developmental concern</label></div>
<div class="check"><input type="checkbox" id="sAlcohol"><label for="sAlcohol">Alcohol-related concern</label></div>
<div class="check"><input type="checkbox" id="sFunction"><label for="sFunction">Functional impairment</label></div>
<button class="btn" onclick="suggestAssessment()">สร้าง next-step</button><div id="screenR"></div></div>
<div class="card"><h3>Screening library</h3><span class="tag">SDQ</span><span class="tag">M-CHAT-R/F</span><span class="tag">DSPM</span><span class="tag">AUDIT</span><span class="tag">ASRS</span><span class="tag">SNAP-IV</span><p class="small muted">รายการนี้เป็น navigation/decision support; ใช้แบบฉบับที่ได้รับอนุญาต</p></div>
</div>`);

function suggestAssessment(){session.screenings++;let out=[];if(document.getElementById("sMood").checked)out.push("พิจารณา depression assessment เช่น PHQ-9");if(document.getElementById("sAnxiety").checked)out.push("พิจารณา anxiety assessment เช่น GAD-7");if(document.getElementById("sDev").checked)out.push("พิจารณา developmental assessment และ multidisciplinary referral ตาม domain");if(document.getElementById("sAlcohol").checked)out.push("ทบทวน alcohol use และพิจารณาการประเมินเพิ่มเติม");if(document.getElementById("sFunction").checked)out.push("ประเมิน functional impairment และบริบทชีวิต");if(!out.length)out.push("ยังไม่มี domain ที่เลือก — ทบทวน presenting concern");document.getElementById("screenR").innerHTML=`<div class="result"><b>Suggested next step</b><ul>${out.map(x=>`<li>${x}</li>`).join("")}</ul></div>`}

pages.assessment=()=>shell("Assessment Hub","เลือกเครื่องมือจาก clinical question ไม่ใช่จากคะแนน screening เพียงอย่างเดียว",`
<div class="grid">${[
["Mood","PHQ-9","ติดตาม depressive symptom severity"],
["Anxiety","GAD-7","ติดตาม anxiety symptoms"],
["Stress","PSS-10","ประเมิน perceived stress"],
["Well-being","WHO-5","ประเมิน well-being"],
["Development","Developmental assessment","ประเมินตาม domain และอายุ"],
["Function","Functional assessment","ดูผลกระทบต่อชีวิตประจำวัน/โรงเรียน/งาน"]
].map(x=>`<div class="card"><h3>${x[0]}</h3><span class="tag">${x[1]}</span><p>${x[2]}</p><button class="ghost" onclick="flash('เลือกเครื่องมือ: ${x[1]}')">เลือก</button></div>`).join("")}</div>`);

pages.child=()=>shell("Child Development","สำหรับ developmental intake, corrected age, referral และการวางแผนประเมิน",`
<div class="grid">
<div class="card"><h3>Parent Concern Intake</h3>${area("concern","ข้อกังวลหลัก")}${area("history","ประวัติพัฒนาการ")}${area("school","บ้าน/โรงเรียน/การสื่อสาร/การเล่น")}<button class="btn" onclick="childSummary()">สรุป</button><div id="childR"></div></div>
<div class="card"><h3>Corrected Age</h3><div class="row">${field("dob","วันเกิด","date")}${field("assessDate","วันที่ประเมิน","date")}</div>${field("gestAge","อายุครรภ์เมื่อคลอด (สัปดาห์)","number",'min="20" max="42" value="32"')}<button class="btn" onclick="corrected()">คำนวณ</button><div id="ageR"></div></div>
<div class="card"><h3>Developmental pathway</h3><ol><li>Parent concern</li><li>Screening</li><li>Clinical observation</li><li>Domain assessment</li><li>Multidisciplinary review</li><li>Intervention + follow-up</li></ol></div>
<div class="card"><h3>Observation domains</h3><span class="tag">Social communication</span><span class="tag">Play</span><span class="tag">Language</span><span class="tag">Adaptive</span><span class="tag">Motor</span><span class="tag">Regulation</span><span class="tag">Sensory context</span></div>
</div>`);

function childSummary(){let a=esc(document.getElementById("concern").value),b=esc(document.getElementById("history").value),c=esc(document.getElementById("school").value);document.getElementById("childR").innerHTML=`<div class="result"><b>Concern</b><p>${a||"-"}</p><b>History</b><p>${b||"-"}</p><b>Context</b><p>${c||"-"}</p></div>`}
function corrected(){let b=new Date(document.getElementById("dob").value),a=new Date(document.getElementById("assessDate").value),ga=Number(document.getElementById("gestAge").value);if(!b.getTime()||!a.getTime())return flash("กรอกวันที่");let weeks=Math.floor((a-b)/604800000),cw=weeks-(40-ga);document.getElementById("ageR").innerHTML=`<div class="result"><b>Corrected age (ประมาณ)</b><p>${Math.floor(cw/4.345)} เดือน ${Math.round(cw%4.345)} สัปดาห์</p></div>`}

pages.formulation=()=>shell("Case Formulation — 5Ps","Template สำหรับ clinical reasoning; ไม่ควรใส่ข้อมูลระบุตัวบุคคลในระบบนี้",`
<div class="grid-2"><div class="card">
${area("fPresent","Presenting")}
${area("fPred","Predisposing")}
${area("fPrec","Precipitating")}
${area("fPerp","Perpetuating")}
${area("fProt","Protective")}
</div><div class="card">
${area("fGoals","Goals")}
${area("fStrength","Strengths")}
${area("fPlan","Intervention plan")}
${area("fFollow","Follow-up plan")}
<button class="btn" onclick="formulation()">สร้างสรุป</button><div id="formR"></div>
</div></div>`);

function formulation(){let ids=[["Presenting","fPresent"],["Predisposing","fPred"],["Precipitating","fPrec"],["Perpetuating","fPerp"],["Protective","fProt"],["Goals","fGoals"],["Strengths","fStrength"],["Plan","fPlan"],["Follow-up","fFollow"]];document.getElementById("formR").innerHTML=`<div class="result">${ids.map(x=>`<p><b>${x[0]}</b><br>${esc(document.getElementById(x[1]).value)||"-"}</p>`).join("")}</div>`}

pages.notes=()=>shell("Progress Notes / MSE","ใช้เป็น template และตรวจทานโดยผู้ประกอบวิชาชีพก่อนนำไปใช้จริง",`
<div class="card"><div class="grid-2">
<div>${area("nSubjective","Subjective")}${area("nObjective","Objective")}${area("nMSE","MSE")}</div>
<div>${area("nAssessment","Assessment")}${area("nPlan","Plan")}${area("nRisk","Risk / safety summary")}</div>
</div><button class="btn" onclick="notePreview()">Preview note</button><div id="noteR"></div></div>`);

function notePreview(){let ids=["nSubjective","nObjective","nMSE","nAssessment","nPlan","nRisk"];let names=["S","O","MSE","A","P","Risk"];document.getElementById("noteR").innerHTML=`<div class="result">${ids.map((id,i)=>`<p><b>${names[i]}</b><br>${esc(document.getElementById(id).value)||"-"}</p>`).join("")}</div>`}

pages.schedule=()=>shell("Schedule / Waitlist","รายการนี้อยู่ใน JavaScript memory เท่านั้น — refresh แล้วหาย",`
<div class="card"><div class="row">${field("evDate","วันที่/เวลา","datetime-local")}${field("evCase","Case code","text",'placeholder="C-001"')}</div><div class="row"><div class="field"><label>ประเภท</label><select id="evType"><option>Initial</option><option>Follow-up</option><option>Reassessment</option><option>Supervision</option><option>Teaching</option></select></div>${field("evNote","หมายเหตุสั้น ๆ")}</div><button class="btn" onclick="addEvent()">เพิ่ม</button></div>
<div class="card" style="margin-top:14px"><h3>Session schedule</h3><div id="eventR"></div></div>`);

function addEvent(){session.events.push({date:document.getElementById("evDate").value,code:document.getElementById("evCase").value,type:document.getElementById("evType").value,note:document.getElementById("evNote").value});renderEvents()}
function renderEvents(){document.getElementById("eventR").innerHTML=session.events.length?`<table class="table"><tr><th>Date</th><th>Case</th><th>Type</th><th>Note</th></tr>${session.events.map(e=>`<tr><td>${esc(e.date)}</td><td>${esc(e.code)}</td><td>${esc(e.type)}</td><td>${esc(e.note)}</td></tr>`).join("")}</table>`:"<p class='muted'>ยังไม่มีรายการ</p>"}

pages.referral=()=>shell("Referral Pathway","decision-support template — referral ปลายทางควรอิงระบบจริงของหน่วยงานและพื้นที่",`
<div class="grid">
${[
["Mental health / psychiatric","อาการรุนแรง, risk, diagnostic complexity → ประเมินโดยผู้เชี่ยวชาญที่เหมาะสม"],
["Developmental pediatrics","สงสัยพัฒนาการหลาย domain / medical-developmental concern"],
["Psychology","assessment, formulation, psychotherapy ตามขอบเขตวิชาชีพ"],
["OT","occupation, sensory-motor, ADL, participation"],
["SLP","speech, language, communication, feeding ตามขอบเขต"],
["PT","gross motor / mobility / physical function"],
["Social work","family, social determinants, safeguarding / community support"]
].map(x=>`<div class="card"><h3>${x[0]}</h3><p>${x[1]}</p></div>`).join("")}</div>`);

pages.resources=()=>shell("Psychoeducation Resource Library","วางลิงก์หรือเอกสารที่หน่วยงานมีสิทธิ์เผยแพร่ได้ โดยไม่เก็บข้อมูลผู้รับบริการ",`
<div class="grid">${["Sleep hygiene","Stress & coping","Emotion regulation","Parent coaching","School collaboration","Developmental milestones","When to seek help","Communication supports"].map(x=>`<div class="card"><h3>📄 ${x}</h3><p class="muted">Resource placeholder</p><button class="ghost" onclick="flash('เพิ่ม resource ได้ใน repository')">จัดการ</button></div>`).join("")}</div>`);

pages.statistics=()=>shell("Statistics / Workload","คำนวณจากตัวเลขที่กรอกใน session เท่านั้น",`
<div class="grid"><div class="card">${field("st","Total sessions","number",'min="0" value="0"')}${field("sa","Assessments","number",'min="0" value="0"')}${field("sf","Follow-ups","number",'min="0" value="0"')}<button class="btn" onclick="stats()">คำนวณ</button><div id="statR"></div></div><div class="card"><h3>Privacy note</h3><p>ไม่มี patient-level dataset และไม่มี historical database ในระบบนี้</p></div></div>`);
function stats(){let a=+document.getElementById("st").value||0,b=+document.getElementById("sa").value||0,c=+document.getElementById("sf").value||0;document.getElementById("statR").innerHTML=`<div class="result"><div>Assessment ratio: ${a?Math.round(b/a*100):0}%</div><div>Follow-up ratio: ${a?Math.round(c/a*100):0}%</div></div>`}

pages.reference=()=>shell("Reference & Licensing","ไม่คัดลอกเนื้อหา protected/copyrighted ลง repository โดยอัตโนมัติ",`
<div class="grid">
<div class="card"><h3>DSM-5-TR</h3><p>ทำเป็น index/ลิงก์ไปยังแหล่งที่ผู้ใช้มีสิทธิ์เข้าถึง แทนการคัดลอกเกณฑ์เต็ม</p></div>
<div class="card"><h3>ICD-11</h3><p>ใช้ official reference/authorized content ตามเงื่อนไขการใช้งาน</p></div>
<div class="card"><h3>Assessment licensing</h3><p>ตรวจ license ก่อนฝังข้อคำถาม, manual, scoring rules หรือ forms ฉบับเต็ม</p></div>
</div>`);

pages.privacy=()=>shell("Privacy Center","สถาปัตยกรรม v2 ตั้งใจให้เป็น stateless/session-only",`
<div class="grid">
<div class="card"><h3>สิ่งที่ไม่มี</h3><ul><li>Google Drive storage</li><li>Google Sheets</li><li>Google Docs</li><li>Database</li><li>localStorage</li><li>sessionStorage</li><li>IndexedDB</li><li>Analytics / tracking ใน starter</li></ul></div>
<div class="card"><h3>สิ่งที่มี</h3><ul><li>HTML/CSS/JavaScript</li><li>Browser memory</li><li>Local calculations</li><li>Print / browser PDF</li></ul></div>
</div>
<div class="card" style="margin-top:14px"><h3>Security boundary</h3><div class="result warning"><b>Privacy-first ≠ automatic clinical compliance.</b><p>หากนำไปใช้กับข้อมูลผู้รับบริการจริง ต้องพิจารณานโยบายขององค์กร กฎหมาย/จริยธรรม การควบคุมอุปกรณ์ การส่งออก PDF และความเสี่ยงจาก clipboard/print/browser อย่างแยกต่างหาก</p></div></div>`);

function filterNav(){let q=document.getElementById("search").value.toLowerCase();document.querySelectorAll("#nav button").forEach(b=>b.style.display=b.innerText.toLowerCase().includes(q)?"block":"none")}
document.querySelectorAll("#nav button").forEach(b=>b.onclick=()=>go(b.dataset.page));
go("dashboard");

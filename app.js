(() => {
const $=id=>document.getElementById(id), dialog=$("loginDialog"), toastEl=$("toast");
let toastTimer,isGuest=true,isSignedIn=false,supabaseClient=null;
function toast(m){toastEl.textContent=m;toastEl.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>toastEl.classList.remove("show"),3000)}
let qrLibraryPromises={};
function loadQrLibrary(kind){
 if(kind==="generator"&&window.QRCode)return Promise.resolve(true);
 if(kind==="reader"&&window.jsQR)return Promise.resolve(true);
 if(qrLibraryPromises[kind])return qrLibraryPromises[kind];
 const urls=kind==="generator"
 ?["https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js","https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js","https://unpkg.com/qrcodejs@1.0.0/qrcode.min.js"]
 :["https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js","https://unpkg.com/jsqr@1.4.0/dist/jsQR.js","https://cdnjs.cloudflare.com/ajax/libs/jsqr/1.4.0/jsQR.min.js"];
 qrLibraryPromises[kind]=(async()=>{
  for(const src of urls){
   try{
    await new Promise((resolve,reject)=>{
     const script=document.createElement("script");script.src=src;script.async=true;
     script.onload=resolve;script.onerror=()=>{script.remove();reject(new Error("load failed"))};
     document.head.appendChild(script);
    });
    if((kind==="generator"&&window.QRCode)||(kind==="reader"&&window.jsQR))return true;
   }catch(_){}
  }
  qrLibraryPromises[kind]=null;return false;
 })();
 return qrLibraryPromises[kind];
}

// SYNEX يعمل مباشرة دون حساب أو تسجيل دخول.
// سجل النشاط والعمليات يحتفظ بهما هذا الجهاز لمدة 48 ساعة فقط.
$("openLogin").classList.add("hidden");
$("accountButton").classList.add("hidden");
$("startNow").addEventListener("click",()=>openTool("compressor"));
$("guestWarning").classList.remove("hidden");
$("themeToggle").addEventListener("click",()=>{document.body.classList.toggle("light");localStorage.setItem("synex-theme",document.body.classList.contains("light")?"light":"dark")});
if(localStorage.getItem("synex-theme")==="light")document.body.classList.add("light");
const info={quickdrop:["QuickDrop","نقل الملفات","نقل الملفات بين الأجهزة يحتاج إلى خدمة نقل واتصال مخصصة."],screentext:["ScreenText","استخراج النصوص والتصميم","استخراج النصوص من الصور وتحريرها قيد التطوير."],voicetype:["Voice FX","تأثيرات الصوت","سجّل صوتك وغيّر سرعته ونبرته ثم استمع أو نزّل النتيجة."]};
function openTool(name){
if(!isGuest&&!isSignedIn){openLogin();return}
$("tools").classList.add("hidden");document.querySelector(".hero").classList.add("hidden");$("workspace").classList.remove("hidden");
document.querySelectorAll(".side-tool").forEach(b=>b.classList.toggle("active",b.dataset.tool===name));
if(name==="compressor")renderCompressor();
else if(name==="qrreader")renderQrReader();
else if(name==="qrgenerator")renderQrGenerator();
else if(name==="screentext")renderScreenText();
else if(name==="voicetype")renderVoiceType();
else if(name==="converter")renderConverter();
else if(name==="videostudio")renderVideoStudio();
else if(name==="textlab")renderTextLab();
else renderQuickDrop();
window.scrollTo({top:0,behavior:"smooth"});
}
document.querySelectorAll("[data-tool]").forEach(btn=>btn.addEventListener("click",()=>openTool(btn.dataset.tool)));
function showHome(){$("workspace").classList.add("hidden");$("tools").classList.remove("hidden");document.querySelector(".hero").classList.remove("hidden");document.querySelectorAll(".side-tool").forEach(b=>b.classList.remove("active"));window.scrollTo({top:0,behavior:"smooth"})}
function showHelp(){
$("tools").classList.add("hidden");document.querySelector(".hero").classList.add("hidden");$("workspace").classList.remove("hidden");
$("toolContent").innerHTML='<div class="tool-workspace"><span class="section-kicker">SYNEX GUIDE</span><h2>مركز المساعدة</h2><div class="help-grid"><article><b>Video Studio</b><p>تحرير الفيديو، قص المقاطع ودمجها، إضافة التأثيرات والكتابة والترجمة والصوت، وتصدير MP4 أو GIF أو MP3/WAV. معالجة الملفات تتم داخل المتصفح، وقد تحتاج الملفات الكبيرة إلى ذاكرة إضافية.</p></article><article><b>Text Lab</b><p>إنشاء كلمات مرور، عدّ الكلمات والأحرف والأسطر، مقارنة نصين، وتنظيف النصوص وتنسيقها.</p></article><article><b>File Lab</b><p>ضغط GZIP لملف واحد أو ZIP لعدة ملفات ومجلدات. اختر الصور لمعاينتها وتصديرها بصيغ مختلفة.</p></article><article><b>QR Generator</b><p>أنشئ رمز QR من رابط أو نص ثم نزّله كصورة PNG.</p></article><article><b>QR Reader</b><p>ارفع صورة QR لقراءة محتواها ونسخه أو فتح الرابط.</p></article><article><b>ScreenText</b><p>استخرج النص من صورة باستخدام OCR داخل المتصفح، ثم انسخه أو نزّله TXT.</p></article><article><b>VoiceType</b><p>حوّل الكلام المباشر إلى نص باستخدام خدمة التعرف على الكلام في المتصفح؛ يتطلب متصفحاً يدعمها وميكروفوناً.</p></article><article><b>QuickDrop</b><p>شارك رابطاً أو QR لاستقبال ملفات مباشرة عبر PeerJS وWebRTC. يتطلب بقاء الصفحتين مفتوحتين، وقد تتعذر بعض الشبكات المقيدة.</p></article><article><b>السجل والخصوصية</b><p>السجل الحالي محفوظ محلياً على هذا الجهاز. الزائر يحتفظ به 48 ساعة، والمستخدم المسجل 120 يوماً محلياً. المزامنة السحابية بين الأجهزة تحتاج إعداد قاعدة بيانات وتخزين.</p></article><article><b>تسجيل الدخول</b><p>يتطلب إعداد مفاتيح Supabase وتفعيل Google OAuth. بيانات الاتصال غير مضبوطة في نسخة الإعداد الحالية.</p></article></div></div>';
}
function showGlobalHistory(){
$("tools").classList.add("hidden");document.querySelector(".hero").classList.add("hidden");$("workspace").classList.remove("hidden");
const items=readActivity();
$("toolContent").innerHTML='<div class="tool-workspace"><span class="section-kicker">ACTIVITY VAULT</span><h2>سجل الملفات والعمليات</h2><p>تبقى السجلات على هذا الجهاز دون حذف تلقائي. الملفات التي تم حفظها يمكن فتحها أو إعادة تنزيلها.</p><div class="history-toolbar"><span id="historyCount"></span><button class="ghost-btn" id="clearGlobalHistory">مسح السجل والملفات</button></div><div class="history-panel" id="globalHistory"></div></div>';
const box=$("globalHistory");$("historyCount").textContent=items.length+" عملية محفوظة";
if(!items.length){box.textContent="لا توجد عمليات مسجلة بعد.";return}
items.forEach(x=>{
const row=document.createElement("article");row.className="history-row history-file-row";
const left=document.createElement("div"),b=document.createElement("b"),s=document.createElement("small"),actions=document.createElement("div");
b.textContent=x.title||x.fileName||"عملية";s.textContent=(x.date||"")+" • "+(x.type||"")+(x.fileName?" • "+x.fileName:"")+(x.size?" • "+formatBytes(x.size):"");
left.append(b,s);actions.className="history-actions";
if(x.fileId){const open=document.createElement("button"),again=document.createElement("button");open.className="ghost-btn";again.className="primary-btn";open.textContent="فتح الملف";again.textContent="إعادة تنزيل";open.onclick=()=>useActivityFile(x.fileId,false);again.onclick=()=>useActivityFile(x.fileId,true);actions.append(open,again)}
else{const note=document.createElement("small");note.className="history-no-file";note.textContent="سجل نشاط فقط — لم يُحفظ ملف لهذه العملية";actions.append(note)}
row.append(left,actions);box.append(row);
});
$("clearGlobalHistory").onclick=async()=>{
if(!confirm("سيتم حذف سجل العمليات والملفات المحفوظة على هذا الجهاز. هل تريد المتابعة؟"))return;
localStorage.removeItem(ACTIVITY_KEY);
try{const db=await openActivityDB();await new Promise((resolve,reject)=>{const tx=db.transaction("files","readwrite");tx.objectStore("files").clear();tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)});db.close()}catch(_){}
showGlobalHistory();
};
}
const ACTIVITY_KEY="synex-global-history";
function readActivity(){try{return JSON.parse(localStorage.getItem(ACTIVITY_KEY)||"[]")}catch(_){return[]}}
function writeActivity(list){localStorage.setItem(ACTIVITY_KEY,JSON.stringify(list.slice(0,2000)))}
function recordActivity(title,type){const list=readActivity();list.unshift({id:"act-"+Date.now()+"-"+Math.random().toString(36).slice(2,8),title,type,date:new Date().toLocaleString(),ts:Date.now()});writeActivity(list)}
function openActivityDB(){
return new Promise((resolve,reject)=>{
if(!window.indexedDB){reject(Error("التخزين المحلي للملفات غير مدعوم"));return}
const req=indexedDB.open("synex-activity-files",1);
req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains("files"))db.createObjectStore("files")};
req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error||Error("تعذر فتح مخزن الملفات"));
});
}
async function saveActivityFile(title,type,fileName,blob){
const id="file-"+Date.now()+"-"+Math.random().toString(36).slice(2,9),db=await openActivityDB();
await new Promise((resolve,reject)=>{const tx=db.transaction("files","readwrite");tx.objectStore("files").put({blob,fileName,type:blob.type||"application/octet-stream",savedAt:Date.now()},id);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error||Error("تعذر حفظ الملف"))});
db.close();
const list=readActivity();list.unshift({id,title,type,date:new Date().toLocaleString(),ts:Date.now(),fileId:id,fileName,size:blob.size});
writeActivity(list);return id;
}
async function getActivityFile(id){
const db=await openActivityDB();
const value=await new Promise((resolve,reject)=>{const tx=db.transaction("files","readonly"),req=tx.objectStore("files").get(id);req.onsuccess=()=>resolve(req.result||null);req.onerror=()=>reject(req.error)});
db.close();return value;
}
async function useActivityFile(id,download){
try{
const item=await getActivityFile(id);if(!item||!item.blob){toast("الملف غير موجود في التخزين المحلي؛ ربما تم مسح بيانات المتصفح.");return}
const url=URL.createObjectURL(item.blob),a=document.createElement("a");a.href=url;
if(download){a.download=item.fileName||"SYNEX-file";a.click();toast("بدأت إعادة تنزيل الملف")}
else{a.target="_blank";a.rel="noopener";a.click();toast("تم فتح الملف في تبويب جديد")}
setTimeout(()=>URL.revokeObjectURL(url),120000);
}catch(e){toast("تعذر فتح الملف: "+(e.message||"خطأ في التخزين"))}
}
$("sideHome").addEventListener("click",showHome);$("sideHelp").addEventListener("click",showHelp);$("sideHistory").addEventListener("click",showGlobalHistory);
function renderQuickDrop(){
const params=new URLSearchParams(location.search),target=params.get("quickdrop")||"";
$("toolContent").innerHTML='<div class="tool-workspace"><span class="section-kicker">SYNEX QUICKDROP / PEER-TO-PEER</span><h2>نقل الملفات بين الأجهزة</h2><p>اختر الملفات وأنشئ رابطاً. افتح الرابط في الجهاز الآخر ليبدأ النقل تلقائياً، ثم نزّل ملفاً أو كل الملفات دفعة واحدة.</p><div class="compress-panel qd-panel"><div class="qd-status" id="qdStatus"><i></i><span>جاهز</span></div><div class="qd-tabs"><button class="mode-btn active" id="qdSendTab">إرسال ملفات</button><button class="mode-btn" id="qdReceiveTab">استقبال ملفات</button></div><section id="qdSendPane"><label class="file-drop" for="qdFiles"><span class="drop-symbol">⇧</span><strong>اختر الصور أو الملفات</strong><small>يمكنك اختيار عدة ملفات معاً</small></label><input id="qdFiles" type="file" multiple class="hidden"><div id="qdFileList" class="qd-file-list"></div><button class="primary-btn action-wide" id="qdCreate" disabled>إنشاء رابط المشاركة</button><div id="qdShare" class="qd-share hidden"><b>أرسل هذا الرابط إلى الجهاز الآخر</b><input id="qdLink" readonly><div class="qr-actions"><button class="ghost-btn" id="qdCopy">نسخ الرابط</button><button class="ghost-btn" id="qdNew">رابط جديد</button></div><div id="qdQr" class="qd-qr"></div><p class="compression-note">عندما يفتح المستلم الرابط يبدأ الاتصال والإرسال تلقائياً، دون طلب قبول.</p></div></section><section id="qdReceivePane" class="hidden"><div class="qd-receiver"><b>استقبال الملفات الكبيرة مباشرة إلى القرص</b><button class="ghost-btn action-wide" id="qdChooseFolder">اختيار مجلد الحفظ</button><small id="qdFolderStatus" class="compression-note">اختر مجلد الحفظ أولاً لتجنب تحميل الملفات الكبيرة كاملة في الذاكرة.</small><input id="qdPeerId" placeholder="معرّف المرسل" autocomplete="off"><button class="primary-btn action-wide" id="qdConnect">اتصال بالمرسل</button><p class="compression-note">اترك الصفحة مفتوحة أثناء النقل. اختيار المجلد يتيح كتابة أجزاء الملف مباشرة على القرص بدلاً من تجميع 5GB في الذاكرة.</p></div><div class="qd-results hidden" id="qdResults"><div class="qd-results-head"><div><b>الملفات المستلمة</b><small id="qdReceivedCount">0 ملفات</small></div><button class="primary-btn qd-download-all" id="qdDownloadAll" disabled>تنزيل الكل</button></div><div id="qdDownloads" class="qd-downloads"></div></div></section><div class="progress-wrap hidden" id="qdProgress"><div class="progress-track"><span id="qdProgressBar"></span></div><small id="qdProgressText">جارٍ النقل...</small></div><p class="compression-note">النقل مباشر بين الجهازين عبر WebRTC. أرسل البيانات على دفعات صغيرة مع تأكيد كل مجموعة. لا تغلق الصفحتين أو الجهازين أثناء النقل؛ اختيار مجلد الحفظ يسمح باستقبال ملفات متعددة الجيجابايت دون تجميعها في الذاكرة.</p></div></div>';
let files=[],peer=null,conn=null,role="send",ackWaiter=null,receiveFile=null,receivedUrls=[],receivedFiles=[],saveDirectory=null;
const status=(message,kind="")=>{const el=$("qdStatus");el.className="qd-status "+kind;el.querySelector("span").textContent=message};
const setProgress=(n,label)=>{$("qdProgress").classList.remove("hidden");$("qdProgressBar").style.width=Math.max(0,Math.min(100,n))+"%";$("qdProgressText").textContent=label};
const cleanup=()=>{if(conn){try{conn.close()}catch(_){}}if(peer){try{peer.destroy()}catch(_){}}conn=null;peer=null;ackWaiter=null};
const parseData=d=>{if(typeof d==="string"){try{return JSON.parse(d)}catch(_){return null}}return null};
function bindConnection(c){
conn=c;
c.on("data",data=>{
const msg=parseData(data);
if(msg&&(msg.type==="ack"||msg.type==="error")&&ackWaiter){const w=ackWaiter;ackWaiter=null;w(msg);}
else if(role==="receive")receiveData(data).catch(e=>{status("تعذر حفظ الملف: "+(e.message||"خطأ في التخزين"),"error");try{sendMessage({type:"error",message:e.message||"تعذر الحفظ"})}catch(_){}});
});
c.on("close",()=>status("انقطع الاتصال","error"));
c.on("error",e=>status("خطأ في الاتصال: "+(e.message||"تعذر الاتصال"),"error"));
}
function waitAck(label){return new Promise((resolve,reject)=>{const timer=setTimeout(()=>{if(ackWaiter===done)ackWaiter=null;reject(new Error("انتهت مهلة انتظار تأكيد الطرف الآخر؛ تحقق من الاتصال ثم أعد المحاولة"))},120000);function done(msg){clearTimeout(timer);if(msg&&msg.type==="error")reject(new Error(msg.message||"رفض الطرف الآخر متابعة النقل"));else if(msg.label!==label)reject(new Error("تأكيد غير متوقع"));else resolve(msg)}ackWaiter=done})}
function sendMessage(obj){if(!conn||!conn.open)throw new Error("الاتصال غير جاهز");conn.send(JSON.stringify(obj))}
async function sendAll(){
try{
status("متصل — جارٍ إرسال الملفات","working");$("qdProgress").classList.remove("hidden");
let total=files.reduce((n,f)=>n+f.size,0),sent=0;
for(let fi=0;fi<files.length;fi++){
const file=files[fi],fileAck=waitAck("file");sendMessage({type:"file",name:file.name,size:file.size,mime:file.type||"application/octet-stream",index:fi,count:files.length});await fileAck;
const chunkSize=48*1024,batchSize=8;
for(let offset=0,batch=0;offset<file.size;batch++){
const batchAck=waitAck("batch:"+fi+":"+batch);
for(let n=0;n<batchSize&&offset<file.size;n++){
const buffer=await file.slice(offset,Math.min(offset+chunkSize,file.size)).arrayBuffer();conn.send(buffer);offset+=buffer.byteLength;sent+=buffer.byteLength;
}
await batchAck;setProgress(total?sent/total*100:100,"إرسال "+file.name+" — "+Math.round(total?sent/total*100:100)+"%");
}
const endAck=waitAck("end:"+fi);sendMessage({type:"end",index:fi});await endAck;
}
sendMessage({type:"complete",count:files.length});status("اكتمل الإرسال","success");setProgress(100,"تم إرسال "+files.length+" ملف");await Promise.all(files.filter(f=>f.size<=50*1024*1024).map(f=>saveActivityFile(f.name,"QuickDrop sent",f.name,f).catch(()=>null)));recordActivity(files.length+" ملف","QuickDrop sent");
}catch(e){status(e.message||"تعذر إكمال النقل","error");toast(e.message||"تعذر إكمال النقل")}
}
function addReceivedFile(f,blob){
const url=URL.createObjectURL(blob);receivedUrls.push(url);receivedFiles.push({name:f.name,size:f.size,mime:f.mime,blob,url});
saveActivityFile(f.name,"QuickDrop received",f.name,blob).catch(e=>toast("استُلم الملف لكن تعذر حفظه في السجل: "+e.message));
$("qdResults").classList.remove("hidden");
const row=document.createElement("article");row.className="qd-download-card";
if((f.mime||"").startsWith("image/")){const img=document.createElement("img");img.className="qd-thumb";img.src=url;img.alt=f.name;row.append(img)}
const info=document.createElement("div");info.className="qd-download-info";
const name=document.createElement("b"),size=document.createElement("small"),link=document.createElement("a");
name.textContent=f.name;size.textContent=formatBytes(f.size);info.append(name,size);
link.href=url;link.download=f.name;link.className="qd-single-download";link.textContent="تنزيل";
row.append(info,link);$("qdDownloads").append(row);
$("qdReceivedCount").textContent=receivedFiles.length+" ملف";$("qdDownloadAll").disabled=false;
}
async function receiveData(data){
if(typeof data==="string"){
const m=parseData(data);if(!m)return;
if(m.type==="ready"){status("تم الاتصال — بانتظار الملفات","success");$("qdConnect").disabled=true;return}
if(m.type==="error"){status(m.message||"أوقف المرسل النقل","error");return}
if(m.type==="file"){
const safeName=String(m.name||"SYNEX-file").split(/[\\/]/).pop().replace(/[<>:"|?*]/g,"_").replace(/[\u0000-\u001f]/g,"_");
receiveFile={name:safeName,size:m.size,mime:m.mime||"application/octet-stream",chunks:[],received:0,index:m.index,chunkCount:0,writer:null,streamed:false};
if(saveDirectory){const handle=await saveDirectory.getFileHandle(safeName,{create:true});receiveFile.writer=await handle.createWritable();receiveFile.streamed=true}
else if(m.size>1024*1024*1024){receiveFile=null;sendMessage({type:"error",message:"هذا الملف أكبر من 1GB. اختر مجلد حفظ أولاً لاستقباله مباشرة على القرص."});throw new Error("اختر مجلد حفظ لاستقبال الملفات الأكبر من 1GB")}
sendMessage({type:"ack",label:"file"});status("استقبال "+safeName,"working");setProgress(0,"استقبال "+safeName+" — 0%");return
}
if(m.type==="end"&&receiveFile){const f=receiveFile;if(f.writer)await f.writer.close();else addReceivedFile(f,new Blob(f.chunks,{type:f.mime}));receiveFile=null;sendMessage({type:"ack",label:"end:"+m.index});status("استُلم "+f.name+" وحُفظ"+(f.streamed?" في المجلد المختار":""),"success");return}
if(m.type==="complete"){status("اكتمل استقبال جميع الملفات","success");setProgress(100,"اكتمل استقبال الملفات");recordActivity("اكتمل استقبال الملفات","QuickDrop");return}
}
if(data instanceof ArrayBuffer||ArrayBuffer.isView(data)){
if(!receiveFile)return;const chunk=data instanceof ArrayBuffer?data:data.buffer.slice(data.byteOffset,data.byteOffset+data.byteLength);
if(receiveFile.writer)await receiveFile.writer.write(chunk);else receiveFile.chunks.push(chunk);
receiveFile.received+=chunk.byteLength;receiveFile.chunkCount++;
setProgress(receiveFile.size?receiveFile.received/receiveFile.size*100:100,"استقبال "+receiveFile.name+" — "+formatBytes(receiveFile.received)+" / "+formatBytes(receiveFile.size));
if(receiveFile.chunkCount%8===0||receiveFile.received===receiveFile.size)sendMessage({type:"ack",label:"batch:"+receiveFile.index+":"+Math.floor((receiveFile.chunkCount-1)/8)});
}
}
function initPeer(){
if(!window.Peer){status("تعذر تحميل PeerJS. تحقق من الإنترنت وأعد تحميل الصفحة.","error");return null}
try{peer=new Peer();peer.on("error",e=>status("تعذر إنشاء الاتصال: "+(e.type||e.message||"خطأ PeerJS"),"error"));return peer}catch(e){status("تعذر بدء خدمة الاتصال","error");return null}
}
function setTab(which){role=which;$("qdSendPane").classList.toggle("hidden",which!=="send");$("qdReceivePane").classList.toggle("hidden",which!=="receive");$("qdSendTab").classList.toggle("active",which==="send");$("qdReceiveTab").classList.toggle("active",which==="receive")}
$("qdSendTab").onclick=()=>setTab("send");$("qdReceiveTab").onclick=()=>setTab("receive");
$("qdChooseFolder").onclick=async()=>{try{if(!window.showDirectoryPicker){toast("اختيار مجلد مباشر غير مدعوم في هذا المتصفح؛ الملفات حتى 1GB فقط في وضع الذاكرة.");return}saveDirectory=await window.showDirectoryPicker({mode:"readwrite"});$("qdFolderStatus").textContent="تم اختيار مجلد الحفظ. يمكنك الآن الاتصال واستقبال ملفات كبيرة.";status("مجلد الحفظ جاهز","success")}catch(e){if(e.name!=="AbortError")toast("تعذر اختيار المجلد: "+(e.message||"خطأ"))}};
$("qdFiles").onchange=()=>{files=Array.from($("qdFiles").files||[]);$("qdFileList").innerHTML="";files.forEach(f=>{const row=document.createElement("div");row.className="qd-file";const n=document.createElement("span"),s=document.createElement("small");n.textContent=f.name;s.textContent=formatBytes(f.size);row.append(n,s);$("qdFileList").append(row)});$("qdCreate").disabled=!files.length};
$("qdCreate").onclick=()=>{
if(!files.length)return;cleanup();const p=initPeer();if(!p)return;$("qdCreate").disabled=true;status("جارٍ إنشاء رابط المشاركة...");
p.on("open",async id=>{const u=new URL(location.href);u.searchParams.set("quickdrop",id);$("qdLink").value=u.href;$("qdShare").classList.remove("hidden");$("qdQr").innerHTML="جارٍ إنشاء رمز المشاركة...";if(await loadQrLibrary("generator")){ $("qdQr").innerHTML="";new window.QRCode($("qdQr"),{text:u.href,width:220,height:220,correctLevel:window.QRCode.CorrectLevel.H});}else $("qdQr").textContent="تعذر إنشاء QR؛ استخدم زر نسخ الرابط.";status("الرابط جاهز — بانتظار المستلم","success")});
p.on("connection",incoming=>{if(conn){incoming.close();return}bindConnection(incoming);incoming.on("open",()=>{status("تم اتصال المستلم — جارٍ الإرسال","working");sendMessage({type:"ready"});sendAll()})});
};
$("qdCopy").onclick=async()=>{try{await navigator.clipboard.writeText($("qdLink").value);toast("تم نسخ الرابط")}catch(_){$("qdLink").select();document.execCommand("copy");toast("انسخ الرابط الآن")}};
$("qdNew").onclick=()=>{cleanup();$("qdShare").classList.add("hidden");$("qdCreate").disabled=!files.length;status("جاهز لإنشاء رابط جديد")};
function connectToSender(id){
if(!id){toast("افتح رابط المشاركة أو أدخل معرّف المرسل");return}
if(!saveDirectory&&window.showDirectoryPicker){toast("اختر مجلد الحفظ أولاً لاستقبال الملفات الكبيرة.");return}
cleanup();const p=initPeer();if(!p)return;$("qdConnect").disabled=true;status("جارٍ الاتصال بالمرسل...");
p.on("open",()=>{const c=p.connect(id,{reliable:true});bindConnection(c);c.on("open",()=>status("تم الاتصال — جارٍ انتظار الملفات","working"));c.on("error",e=>{status("تعذر الاتصال: "+(e.message||"خطأ"),"error");$("qdConnect").disabled=false})});
}
$("qdConnect").onclick=()=>connectToSender($("qdPeerId").value.trim());
$("qdDownloadAll").onclick=async()=>{
if(!receivedFiles.length)return;
if(receivedFiles.length===1){const f=receivedFiles[0],a=document.createElement("a");a.href=f.url;a.download=f.name;a.click();return}
if(!window.fflate||!window.fflate.zipSync){toast("تعذر إنشاء ZIP؛ نزّل الملفات واحداً واحداً");return}
try{const entries={};for(const f of receivedFiles){const bytes=new Uint8Array(await f.blob.arrayBuffer());entries[f.name]=bytes}const zipped=window.fflate.zipSync(entries,{level:0}),blob=new Blob([zipped],{type:"application/zip"}),url=URL.createObjectURL(blob);receivedUrls.push(url);const a=document.createElement("a");a.href=url;a.download="SYNEX-files.zip";a.click();}catch(e){toast("تعذر تجهيز الملفات للتنزيل")}
};
if(target){setTab("receive");$("qdPeerId").value=target;status("تم فتح رابط المشاركة — اختر مجلد الحفظ ثم اضغط اتصال","working")}
window.addEventListener("beforeunload",()=>{receivedUrls.forEach(URL.revokeObjectURL);cleanup()},{once:true});
}
function renderScreenText(){
$("toolContent").innerHTML='<div class="tool-workspace"><span class="section-kicker">SCREEN TEXT / OCR</span><h2>استخراج النص من الصور</h2><p class="muted-note">يدعم العربية والإنجليزية والفرنسية، ويمكن قراءة العربية مع الإنجليزية في الصورة نفسها.</p><div class="compress-panel"><label class="file-drop" for="ocrFile"><span class="drop-symbol">▧</span><strong>اختر صورة</strong><small>PNG / JPG / WEBP</small></label><input id="ocrFile" type="file" accept="image/*" class="hidden"><div id="ocrPreview" class="qr-preview hidden"><img id="ocrImage" alt="الصورة المختارة"></div><label for="ocrLang">لغة النص في الصورة</label><select id="ocrLang"><option value="ara">العربية</option><option value="ara+eng">العربية + English</option><option value="eng">English</option><option value="fra">Français</option><option value="ara+fra">العربية + Français</option></select><button class="primary-btn action-wide" id="runOcr" disabled>استخراج النص</button><div class="progress-wrap hidden" id="ocrProgress"><div class="progress-track"><span id="ocrBar"></span></div><small id="ocrStatus">جارٍ التحضير</small></div><textarea id="ocrText" dir="auto" rows="9" placeholder="سيظهر النص المستخرج هنا"></textarea><div class="qr-actions"><button class="ghost-btn" id="copyOcr">نسخ</button><button class="ghost-btn" id="saveOcr">تنزيل TXT</button></div></div></div>';
let file=null,url="";
$("ocrFile").onchange=()=>{file=$("ocrFile").files[0];if(!file)return;if(url)URL.revokeObjectURL(url);url=URL.createObjectURL(file);$("ocrImage").src=url;$("ocrPreview").classList.remove("hidden");$("runOcr").disabled=false};
$("ocrLang").onchange=()=>{$("ocrText").dir=$("ocrLang").value.includes("ara")?"rtl":"ltr";$("ocrText").style.textAlign=$("ocrLang").value.includes("ara")?"right":"left"};
$("runOcr").onclick=async()=>{if(!file)return;if(!window.Tesseract){toast("تعذر تحميل محرك OCR؛ تحقق من الاتصال");return}$("runOcr").disabled=true;$("ocrProgress").classList.remove("hidden");$("ocrBar").style.width="0%";$("ocrStatus").textContent="جارٍ تحميل بيانات اللغة...";try{const lang=$("ocrLang").value;const result=await Tesseract.recognize(file,lang,{langPath:"https://tessdata.projectnaptha.com/4.0.0",logger:m=>{if(m.progress!==undefined){$("ocrBar").style.width=Math.round(m.progress*100)+"%";$("ocrStatus").textContent=m.status==="recognizing text"?"جارٍ قراءة النص...":m.status||"جارٍ التعرف"}}});const extracted=result.data.text||"";$("ocrText").value=extracted;$("ocrText").dir=lang.includes("ara")?"rtl":"ltr";$("ocrText").style.textAlign=lang.includes("ara")?"right":"left";saveActivityFile(file.name,"OCR result","SYNEX-OCR.txt",new Blob([extracted],{type:"text/plain;charset=utf-8"})).catch(e=>recordActivity(file.name,"OCR"));toast(extracted.trim()?"اكتمل استخراج النص":"لم يتم العثور على نص واضح في الصورة")}catch(e){console.error("OCR error",e);toast("تعذر OCR: "+(e.message||"تحقق من الاتصال وحاول مجدداً"))}finally{$("runOcr").disabled=false}};
$("copyOcr").onclick=async()=>{try{await navigator.clipboard.writeText($("ocrText").value);toast("تم النسخ")}catch(_){$("ocrText").select();document.execCommand("copy")}};
$("saveOcr").onclick=()=>{const value=$("ocrText").value;saveActivityFile("OCR text","TXT export","SYNEX-OCR.txt",new Blob([value],{type:"text/plain;charset=utf-8"})).catch(()=>{});downloadText(value,"SYNEX-OCR.txt")};
}
function downloadText(value,name){const a=document.createElement("a"),u=URL.createObjectURL(new Blob([value],{type:"text/plain;charset=utf-8"}));a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),10000)}
function renderVoiceType(){
$("toolContent").innerHTML='<div class="tool-workspace"><span class="section-kicker">SYNEX VOICE FX</span><h2>تأثيرات على صوتك</h2><p>سجّل صوتك من الميكروفون، ثم غيّر سرعته ونبرته واستمع إلى النتيجة أو نزّلها كملف صوتي.</p><div class="compress-panel voice-panel"><div class="voice-live-status" id="fxStatus"><i></i><span>جاهز — اضغط بدء التسجيل واسمح باستخدام الميكروفون</span></div><div class="voice-toolbar"><button class="primary-btn" id="fxRecord">● بدء التسجيل</button><button class="ghost-btn" id="fxStop" disabled>■ إيقاف التسجيل</button></div><div class="fx-meter"><span id="fxTimer">00:00</span><span id="fxFileInfo">لم يتم تسجيل صوت بعد</span></div><label for="fxEffect">اختر تأثير الصوت</label><select id="fxEffect"><option value="normal">طبيعي</option><option value="fast">سريع</option><option value="veryfast">سريع جداً</option><option value="slow">بطيء</option><option value="veryslow">بطيء جداً</option><option value="robot">روبوت</option><option value="alien">فضائي</option><option value="deep">صوت عميق</option><option value="monster">وحش مخيف</option><option value="chipmunk">صوت سنجاب / رفيع</option><option value="cartoon">كرتوني</option><option value="telephone">هاتف قديم</option><option value="radio">مذيع راديو</option><option value="underwater">تحت الماء</option><option value="echo">صدى واسع</option><option value="cave">كهف</option><option value="ghost">شبح</option><option value="helium">هيليوم</option><option value="vocoder">آلي إلكتروني</option><option value="megaphone">مكبر صوت</option></select><p class="compression-note">20 تأثيراً صوتياً، منها الروبوت والفضائي والوحش والشبح والهاتف القديم والصدى. اختر التأثير ثم اضغط استمع بالتأثير.</p><audio id="fxAudio" class="fx-audio" controls></audio><div class="voice-toolbar"><button class="primary-btn" id="fxPlay" disabled>▶ استمع بالتأثير</button><button class="ghost-btn" id="fxDownload" disabled>تنزيل الصوت بالتأثير WAV</button></div><div class="qr-actions"><button class="ghost-btn" id="fxOriginal" disabled>تنزيل التسجيل الأصلي</button><button class="ghost-btn" id="fxClear" disabled>مسح التسجيل</button></div><p class="compression-note" id="fxResult">سيتم تجهيز نسخة WAV بالتأثير المختار عند التنزيل.</p></div></div>';
const status=(message,active=false)=>{$("fxStatus").querySelector("span").textContent=message;$("fxStatus").classList.toggle("recording",active)};
let recorder=null,chunks=[],originalBlob=null,originalUrl=null,timer=null,startedAt=0,processedBlob=null,processedUrl=null,processedKey="";
const recordBtn=$("fxRecord"),stopBtn=$("fxStop"),audio=$("fxAudio"),effect=$("fxEffect");
const presets={
normal:{rate:1},fast:{rate:1.45},veryfast:{rate:1.8},slow:{rate:.75},veryslow:{rate:.55},
robot:{rate:1,robot:32,dist:18,band:1500},alien:{rate:1.3,robot:48,echo:.12,high:2600},deep:{rate:.78,low:850},monster:{rate:.72,dist:35,low:650,echo:.16},chipmunk:{rate:1.55,high:3400},
cartoon:{rate:1.22,dist:8,high:2600},telephone:{rate:1,band:1250,dist:4},radio:{rate:1,band:2200,dist:10},underwater:{rate:.9,low:650,echo:.22},echo:{rate:1,echo:.42},cave:{rate:.92,echo:.58,low:1800},ghost:{rate:.82,echo:.5,robot:8,high:2100},helium:{rate:1.65,high:3800},vocoder:{rate:1,robot:65,band:1900,dist:22},megaphone:{rate:1,band:1700,dist:28}
};
function setReady(ready){$("fxPlay").disabled=!ready;$("fxDownload").disabled=!ready;$("fxOriginal").disabled=!ready;$("fxClear").disabled=!ready}
function elapsed(){const seconds=Math.floor((Date.now()-startedAt)/1000);$("fxTimer").textContent=String(Math.floor(seconds/60)).padStart(2,"0")+":"+String(seconds%60).padStart(2,"0")}
function clearProcessed(){if(processedUrl)URL.revokeObjectURL(processedUrl);processedUrl=null;processedBlob=null;processedKey="";audio.removeAttribute("src");audio.load()}
function clearRecording(){if(originalUrl)URL.revokeObjectURL(originalUrl);originalUrl=null;originalBlob=null;chunks=[];clearProcessed();$("fxTimer").textContent="00:00";$("fxFileInfo").textContent="لم يتم تسجيل صوت بعد";$("fxResult").textContent="اختر تأثيراً ثم اضغط استمع بالتأثير.";setReady(false);status("جاهز — اضغط بدء التسجيل واسمح باستخدام الميكروفون")}
recordBtn.onclick=async()=>{
if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia||!window.MediaRecorder){status("تسجيل الميكروفون غير مدعوم في هذا المتصفح. افتح الموقع عبر HTTPS واستخدم Chrome.");return}
try{recordBtn.disabled=true;status("بانتظار إذن الميكروفون...");const stream=await navigator.mediaDevices.getUserMedia({audio:true});chunks=[];
const mime=MediaRecorder.isTypeSupported("audio/webm;codecs=opus")?"audio/webm;codecs=opus":(MediaRecorder.isTypeSupported("audio/webm")?"audio/webm":"");
recorder=new MediaRecorder(stream,mime?{mimeType:mime}:{});recorder.ondataavailable=e=>{if(e.data&&e.data.size)chunks.push(e.data)};
recorder.onerror=()=>{stream.getTracks().forEach(t=>t.stop());recordBtn.disabled=false;stopBtn.disabled=true;clearInterval(timer);status("حدث خطأ أثناء التسجيل.")};
recorder.onstop=()=>{stream.getTracks().forEach(t=>t.stop());clearInterval(timer);recordBtn.disabled=false;stopBtn.disabled=true;if(originalUrl)URL.revokeObjectURL(originalUrl);clearProcessed();originalBlob=new Blob(chunks,{type:recorder.mimeType||"audio/webm"});originalUrl=URL.createObjectURL(originalBlob);$("fxFileInfo").textContent="تم التسجيل — "+(originalBlob.size/1024).toFixed(1)+" KB";setReady(true);status("اكتمل التسجيل — اختر واحداً من التأثيرات العشرين")};
recorder.start();startedAt=Date.now();elapsed();timer=setInterval(elapsed,500);stopBtn.disabled=false;status("يتم تسجيل صوتك الآن...",true)
}catch(error){recordBtn.disabled=false;status("تعذر فتح الميكروفون: "+(error.message||"تحقق من الإذن والاتصال الآمن HTTPS"))}
};
stopBtn.onclick=()=>{if(recorder&&recorder.state!=="inactive")recorder.stop()};
effect.onchange=()=>{clearProcessed();$("fxResult").textContent="التأثير المحدد: "+effect.options[effect.selectedIndex].text+" — اضغط استمع بالتأثير."};
async function renderSelectedEffect(){
if(!originalBlob)throw new Error("سجّل صوتك أولاً");
const key=effect.value;if(processedBlob&&processedKey===key)return processedBlob;
const AudioCtx=window.AudioContext||window.webkitAudioContext,Offline=window.OfflineAudioContext||window.webkitOfflineAudioContext;
if(!AudioCtx||!Offline)throw new Error("معالجة التأثيرات غير مدعومة في هذا المتصفح");
const decodeCtx=new AudioCtx();let decoded;
try{decoded=await decodeCtx.decodeAudioData(await originalBlob.arrayBuffer())}finally{await decodeCtx.close()}
const p=presets[key]||presets.normal,rate=p.rate||1,tail=Math.max(p.echo?2.8:0,0.15),duration=decoded.duration/rate+tail;
const offline=new Offline(decoded.numberOfChannels,Math.ceil(duration*decoded.sampleRate),decoded.sampleRate);
const source=offline.createBufferSource();source.buffer=decoded;source.playbackRate.value=rate;
let node=source;
if(p.band){const filter=offline.createBiquadFilter();filter.type="bandpass";filter.frequency.value=p.band;filter.Q.value=0.8;node.connect(filter);node=filter}
else if(p.low||p.high){const filter=offline.createBiquadFilter();filter.type=p.low?"lowpass":"highpass";filter.frequency.value=p.low||p.high;node.connect(filter);node=filter}
if(p.dist){const shaper=offline.createWaveShaper();const curve=new Float32Array(44100);const amount=p.dist;for(let i=0;i<curve.length;i++){const x=i*2/(curve.length-1)-1;curve[i]=(1+amount/30)*x/(1+(amount/30)*Math.abs(x))}shaper.curve=curve;shaper.oversample="2x";node.connect(shaper);node=shaper}
const output=offline.createGain();output.gain.value=p.echo?0.82:1;node.connect(output);output.connect(offline.destination);
if(p.echo){const delay=offline.createDelay(2);delay.delayTime.value=.24;const feedback=offline.createGain();feedback.gain.value=Math.min(.68,p.echo*.85);const wet=offline.createGain();wet.gain.value=Math.min(.85,p.echo);node.connect(delay);delay.connect(feedback);feedback.connect(delay);delay.connect(wet);wet.connect(offline.destination)}
if(p.robot){const osc=offline.createOscillator(),mod=offline.createGain(),ring=offline.createGain();osc.type="square";osc.frequency.value=p.robot;mod.gain.value=.48;osc.connect(mod);mod.connect(ring.gain);ring.gain.value=.52;node.connect(ring);ring.connect(offline.destination);osc.start(0);osc.stop(duration)}
source.start(0);
const rendered=await offline.startRendering();processedBlob=encodeWav(rendered);processedKey=key;processedUrl=URL.createObjectURL(processedBlob);return processedBlob
}
$("fxPlay").onclick=async()=>{if(!originalBlob)return;const button=$("fxPlay");button.disabled=true;$("fxResult").textContent="جارٍ تطبيق التأثير...";try{await renderSelectedEffect();audio.src=processedUrl;audio.playbackRate=1;await audio.play();status("يتم تشغيل: "+effect.options[effect.selectedIndex].text,true);$("fxResult").textContent="تم تطبيق التأثير. يمكنك الاستماع أو تنزيل النسخة."}catch(error){$("fxResult").textContent="تعذر تطبيق التأثير: "+(error.message||"خطأ غير معروف");status("تعذر تجهيز التأثير")}finally{button.disabled=false}};
audio.onended=()=>status("انتهى تشغيل الصوت بالتأثير.");
function encodeWav(buffer){
const channels=buffer.numberOfChannels,samples=buffer.length,bytes=44+samples*channels*2,array=new ArrayBuffer(bytes),view=new DataView(array);
function writeString(offset,value){for(let i=0;i<value.length;i++)view.setUint8(offset+i,value.charCodeAt(i))}
writeString(0,"RIFF");view.setUint32(4,bytes-8,true);writeString(8,"WAVE");writeString(12,"fmt ");view.setUint32(16,16,true);view.setUint16(20,1,true);view.setUint16(22,channels,true);view.setUint32(24,buffer.sampleRate,true);view.setUint32(28,buffer.sampleRate*channels*2,true);view.setUint16(32,channels*2,true);view.setUint16(34,16,true);writeString(36,"data");view.setUint32(40,bytes-44,true);
const data=[];for(let c=0;c<channels;c++)data.push(buffer.getChannelData(c));let offset=44;
for(let i=0;i<samples;i++)for(let c=0;c<channels;c++){let sample=Math.max(-1,Math.min(1,data[c][i]));view.setInt16(offset,sample<0?sample*32768:sample*32767,true);offset+=2}
return new Blob([array],{type:"audio/wav"});
}
$("fxDownload").onclick=async()=>{if(!originalBlob)return;const button=$("fxDownload");button.disabled=true;$("fxResult").textContent="جارٍ تجهيز ملف WAV بالتأثير...";try{const wav=await renderSelectedEffect(),name="SYNEX-Voice-"+effect.value+"-"+Date.now()+".wav";saveActivityFile(name,"Voice effect",name,wav).catch(()=>{});downloadBlob(wav,name);$("fxResult").textContent="تم تنزيل الصوت بالتأثير بصيغة WAV وحفظه في سجل الملفات."}catch(error){$("fxResult").textContent="تعذر تجهيز WAV: "+(error.message||"خطأ غير معروف")}finally{button.disabled=false}};
$("fxOriginal").onclick=()=>{if(originalBlob)downloadBlob(originalBlob,"SYNEX-Voice-Original.webm")};
$("fxClear").onclick=()=>{if(recorder&&recorder.state!=="inactive")recorder.stop();clearRecording()};
setReady(false);
}
const HISTORY_KEY="synex-compression-history-v1";
function retentionCleanup(){/* لا نحذف السجل تلقائياً؛ يبقى حتى يختار المستخدم مسحه. */}
function getHistory(){try{return JSON.parse(localStorage.getItem(HISTORY_KEY)||"[]")}catch(_){return[]}}
function saveHistory(item){const h=getHistory();h.unshift({...item,ts:Date.now()});localStorage.setItem(HISTORY_KEY,JSON.stringify(h.slice(0,25)))}
function renderHistory(){const h=getHistory(),el=$("historyList");if(!el)return;if(!h.length){el.innerHTML='<p class="compression-note">لا توجد عمليات سابقة بعد.</p>';return}el.innerHTML=h.map(x=>'<div class="history-row"><div><b></b><small></small></div><strong></strong></div>').join("");[...el.children].forEach((node,i)=>{node.children[0].children[0].textContent=h[i].name;node.children[0].children[1].textContent=h[i].date+" • "+h[i].kind;node.children[1].textContent=h[i].result})}
function addHistory(name,kind,result,blob){saveHistory({name,kind,result,date:new Date().toLocaleString()});if(blob)saveActivityFile(name,kind,name,blob).catch(e=>{recordActivity(name,kind);toast("حُفظ السجل دون الملف: "+e.message)});else recordActivity(name,kind);renderHistory()}
function formatBytes(n){if(!Number.isFinite(n))return"—";const u=["B","KB","MB","GB","TB"];let i=0;while(n>=1024&&i<u.length-1){n/=1024;i++}return n.toFixed(i?1:0)+" "+u[i]}
function suggestion(files){const f=files[0],ext=(f.name.split(".").pop()||"").toLowerCase(),already=["jpg","jpeg","png","webp","gif","mp4","mp3","zip","gz","pdf","7z","rar","avif"].includes(ext);if(already)return{level:1,label:"ضغط خفيف",reason:"هذا النوع مضغوط مسبقاً غالباً؛ الضغط القوي قد يستهلك وقتاً دون توفير واضح."};if(["txt","csv","json","xml","html","js","css","svg","log"].includes(ext))return{level:9,label:"أقصى ضغط",reason:"الملفات النصية غالباً تستفيد من الضغط الأقوى."};if(["docx","xlsx","pptx"].includes(ext))return{level:3,label:"ضغط خفيف",reason:"هذه الصيغ تحتوي ضغطاً داخلياً بالفعل."};return{level:6,label:"متوازن",reason:"اقتراح عام؛ يمكنك تغيير المستوى وتجربة النتيجة."}}
function renderConverter(){
$("toolContent").innerHTML='<div class="tool-workspace"><span class="section-kicker">SYNEX UNIVERSAL CONVERTER</span><h2>محوّل الملفات الشامل</h2><p class="muted-note">تحويل الفيديو والصور والصوت والمستندات والملفات المضغوطة، مع استخراج الصوت من الفيديو.</p><div class="compress-panel"><label>نوع الملفات</label><select id="cvType"><option value="video">فيديو</option><option value="image">صور</option><option value="audio">صوت</option><option value="document">مستندات نصية</option><option value="archive">ملفات مضغوطة</option></select><label class="file-drop" for="cvFile"><span class="drop-symbol">⇧</span><strong>اختر ملفاً</strong><small id="cvAccept">MP4 · WEBM · MKV · AVI · MOV</small></label><input id="cvFile" type="file" class="hidden"><p id="cvInfo" class="compression-note"></p><label>صيغة الإخراج</label><select id="cvFormat"></select><p id="cvNote" class="compression-note"></p><button class="primary-btn action-wide" id="cvGo" disabled>ابدأ التحويل</button><div class="progress-wrap hidden" id="cvProgress"><div class="progress-track"><span id="cvBar"></span></div><small id="cvStatus">جارٍ التحضير...</small></div><p id="cvResult" class="compression-note"></p></div></div>';
const $c=id=>$(id),types={
video:{accept:".mp4,.webm,.mkv,.avi,.mov,.wmv,.flv,.3gp,.mpeg,.mpg,.m4v,video/*",formats:["mp4","webm","mkv","avi","mov","wmv","flv","3gp","mpeg","m4v","mp3","wav","ogg"],note:"يمكنك تحويل الفيديو أو استخراج الصوت منه بصيغة MP3 أو WAV أو OGG."},
image:{accept:"image/*,.heic,.heif,.tif,.tiff,.svg,.avif",formats:["png","jpg","jpeg","webp","avif"],note:"دعم HEIC وTIFF وAVIF يعتمد على المتصفح. تحويل GIF المتحرك قد ينتج صورة ثابتة."},
audio:{accept:"audio/*,.mp3,.wav,.ogg,.aac,.flac,.m4a,.wma,.opus,.aiff",formats:["mp3","wav","ogg","aac","flac","m4a","wma","opus","aiff"],note:"يعتمد التحويل على محرك FFmpeg الذي يتم تحميله عند أول استخدام."},
document:{accept:".txt,.html,.htm,.csv,.md",formats:["pdf","txt","html"],note:"يدعم تحويل ملفات TXT وHTML إلى PDF أو TXT أو HTML. ملفات Word غير مدعومة بعد."},
archive:{accept:".zip,.gz,.tar",formats:["zip","gz"],note:"إنشاء ZIP أو GZIP للملف المختار. لا يدعم فك RAR أو 7Z في هذه النسخة."}};
let file=null;
function changeType(){const t=types[$c("cvType").value];file=null;$c("cvFile").value="";$c("cvInfo").textContent="";$c("cvGo").disabled=true;$c("cvFile").accept=t.accept;$c("cvAccept").textContent=t.accept;$c("cvFormat").innerHTML=t.formats.map(x=>'<option value="'+x+'">'+x.toUpperCase()+'</option>').join("");$c("cvNote").textContent=t.note;$c("cvResult").textContent=""}
$c("cvType").onchange=changeType;changeType();
$c("cvFile").onchange=()=>{file=$c("cvFile").files[0]||null;if(file){$c("cvInfo").textContent=file.name+" — "+(file.size/1048576).toFixed(2)+" MB";$c("cvGo").disabled=false}};
function saveBlob(blob,name){const u=URL.createObjectURL(blob),a=document.createElement("a");a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),20000)}
async function imageConvert(f,ext){const u=URL.createObjectURL(f),im=new Image();try{await new Promise((r,j)=>{im.onload=r;im.onerror=()=>j(Error("الصورة غير مدعومة في المتصفح"));im.src=u});const c=document.createElement("canvas");c.width=im.naturalWidth;c.height=im.naturalHeight;const x=c.getContext("2d");if(ext==="jpg"||ext==="bmp"){x.fillStyle="#fff";x.fillRect(0,0,c.width,c.height)}x.drawImage(im,0,0);const mime={jpg:"image/jpeg",jpeg:"image/jpeg",png:"image/png",webp:"image/webp",avif:"image/avif"}[ext];const b=await new Promise(r=>c.toBlob(r,mime,.92));if(!b||b.type!==mime)throw Error("المتصفح لا يدعم إنشاء هذه الصيغة؛ اختر PNG أو JPG أو WEBP");return b}finally{URL.revokeObjectURL(u)}}
async function textConvert(f,ext){let t=await f.text();if(f.name.toLowerCase().endsWith(".html"))t=new DOMParser().parseFromString(t,"text/html").body.innerText;if(ext==="txt")return new Blob([t],{type:"text/plain;charset=utf-8"});if(ext==="html")return new Blob(["<!doctype html><meta charset=utf-8><pre>"+t.replace(/[&<>]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;"}[c]))+"</pre>"],{type:"text/html;charset=utf-8"});if(!window.jspdf)throw Error("مكتبة PDF لم تُحمّل");const d=new window.jspdf.jsPDF(),lines=d.splitTextToSize(t,175);let y=15;lines.forEach(line=>{if(y>280){d.addPage();y=15}d.text(line,15,y);y+=7});return d.output("blob")}
async function ffmpeg(){if(!window.FFmpeg)throw Error("محرك الفيديو والصوت غير متاح؛ تحقق من الإنترنت");if(!window.synexFF){window.synexFF=window.FFmpeg.createFFmpeg({log:false,corePath:"https://unpkg.com/@ffmpeg/core@0.11.0/dist/ffmpeg-core.js",progress:p=>{const bar=document.getElementById("vsBar")||document.getElementById("cvBar");if(bar)bar.style.width=Math.round((p.ratio||0)*100)+"%";const status=document.getElementById("vsStatus")||document.getElementById("cvStatus");if(status)status.textContent="جارٍ تنفيذ FFmpeg..."}})}if(!window.synexFF.isLoaded())await window.synexFF.load();return window.synexFF}
$c("cvGo").onclick=async()=>{if(!file)return;const type=$c("cvType").value,ext=$c("cvFormat").value,base=file.name.replace(/\.[^.]+$/,"");$c("cvGo").disabled=true;$c("cvProgress").classList.remove("hidden");$c("cvStatus").textContent="جارٍ التحويل...";$c("cvBar").style.width="2%";try{let blob,name=base+"."+ext;
if(type==="image"){blob=await imageConvert(file,ext)}
else if(type==="document"){blob=await textConvert(file,ext)}
else if(type==="archive"){if(!window.fflate)throw Error("مكتبة الضغط غير متاحة");const bytes=new Uint8Array(await file.arrayBuffer());if(ext==="gz"){blob=new Blob([window.fflate.gzipSync(bytes)],{type:"application/gzip"});name=file.name+".gz"}else{blob=new Blob([window.fflate.zipSync({[file.name]:bytes})],{type:"application/zip"})}}
else{const f=await ffmpeg(),input="input."+((file.name.split(".").pop()||"dat").replace(/[^a-z0-9]/gi,"")),output="output."+ext;f.FS("writeFile",input,await window.FFmpeg.fetchFile(file));let args=["-i",input,"-y"];if(type==="video"&&["mp3","wav","ogg"].includes(ext)){args.push("-vn");if(ext==="mp3")args.push("-c:a","libmp3lame","-q:a","2");if(ext==="wav")args.push("-c:a","pcm_s16le");if(ext==="ogg")args.push("-c:a","libvorbis")}else if(type==="audio"){const enc={mp3:["-c:a","libmp3lame"],wav:["-c:a","pcm_s16le"],ogg:["-c:a","libvorbis"],aac:["-c:a","aac"],flac:["-c:a","flac"],m4a:["-c:a","aac"],wma:["-c:a","wmav2"],opus:["-c:a","libopus"],aiff:["-c:a","pcm_s16be"]};args.push(...(enc[ext]||[]))}else{const enc={mp4:["-c:v","libx264","-c:a","aac"],m4v:["-c:v","libx264","-c:a","aac"],mov:["-c:v","mpeg4","-c:a","aac"],webm:["-c:v","libvpx","-c:a","libvorbis"],mkv:["-c:v","libx264","-c:a","aac"],avi:["-c:v","mpeg4","-c:a","libmp3lame"],wmv:["-c:v","msmpeg4","-c:a","wmav2"],flv:["-c:v","flv","-c:a","libmp3lame"],"3gp":["-c:v","h263","-c:a","aac"],mpeg:["-c:v","mpeg2video","-c:a","mp2"]};args.push(...(enc[ext]||[]))}args.push(output);await f.run(...args);const data=f.FS("readFile",output);blob=new Blob([data.buffer]);try{f.FS("unlink",input);f.FS("unlink",output)}catch(_){}}
if(!blob||!blob.size)throw Error("لم ينتج ملف؛ قد تكون الصيغة أو الترميز غير مدعوم");saveBlob(blob,name);saveActivityFile(file.name,"Converter",name,blob).catch(()=>recordActivity(file.name,"Conversion"));$c("cvBar").style.width="100%";$c("cvStatus").textContent="اكتمل التحويل";$c("cvResult").textContent="تم إنشاء "+name+" ("+(blob.size/1048576).toFixed(2)+" MB)";toast("اكتمل التحويل")}
catch(e){console.error(e);$c("cvStatus").textContent="تعذر التحويل";toast("فشل التحويل: "+e.message)}finally{$c("cvGo").disabled=false}};
}

function renderVideoStudio(){
$("toolContent").innerHTML=[
'<div class="tool-workspace vs-workspace"><span class="section-kicker">SYNEX VIDEO STUDIO</span><h2>استوديو تحرير الفيديو</h2><p>قص ودمج وتحويل الفيديو، إضافة التأثيرات والكتابة والصوت، ثم معاينة النتيجة وتنزيلها. تتم المعالجة داخل المتصفح باستخدام FFmpeg.</p>',
'<div class="vs-layout"><section class="vs-preview-card"><div class="vs-preview-head"><b>معاينة الفيديو</b><span id="vsMeta">لم يتم اختيار فيديو</span></div><video id="vsPreview" controls playsinline></video><div class="vs-preview-tools"><button class="ghost-btn" id="vsSnapshot" disabled>التقاط صورة من الإطار</button><button class="ghost-btn" id="vsSeekStart" disabled>تحديد البداية من المشغل</button><button class="ghost-btn" id="vsSeekEnd" disabled>تحديد النهاية من المشغل</button></div><div class="vs-output hidden" id="vsOutput"><b>النتيجة الجاهزة</b><video id="vsResultPreview" controls playsinline></video><a id="vsDownload" class="primary-btn" download>تنزيل النتيجة</a></div></section>',
'<section class="compress-panel vs-panel"><div class="vs-section-title"><b>1 — ملف الفيديو</b><small>اختر ملفاً واحداً للتحرير</small></div><label class="file-drop" for="vsFile"><span class="drop-symbol">▶</span><strong>اختر فيديو من جهازك</strong><small>MP4 · WEBM · MOV · MKV · AVI وغيرها</small></label><input id="vsFile" type="file" accept="video/*,.mp4,.webm,.mov,.mkv,.avi,.m4v" class="hidden"><div class="picked-file hidden" id="vsPicked"></div>',
'<div class="vs-section-title"><b>2 — القص والتصدير</b><small>حدد المقطع والصيغة والجودة</small></div><div class="vs-fields"><label>من الثانية<input id="vsStart" type="number" min="0" step="0.1" value="0"></label><label>إلى الثانية<input id="vsEnd" type="number" min="0" step="0.1" placeholder="نهاية الفيديو"></label><label>صيغة الإخراج<select id="vsFormat"><option value="mp4">MP4</option><option value="webm">WEBM</option><option value="gif">GIF متحرك</option><option value="mp3">MP3 صوت فقط</option><option value="wav">WAV صوت فقط</option></select></label><label>الدقة<select id="vsResolution"><option value="original">الأصلية</option><option value="360">360p</option><option value="480">480p</option><option value="720" selected>720p</option><option value="1080">1080p</option></select></label><label>الجودة<select id="vsQuality"><option value="18">عالية جداً</option><option value="23" selected>متوازنة</option><option value="28">حجم أصغر</option><option value="32">ضغط قوي</option></select></label><label>سرعة الفيديو<select id="vsSpeed"><option value="0.5">0.5× بطيء</option><option value="0.75">0.75×</option><option value="1" selected>1× طبيعي</option><option value="1.25">1.25×</option><option value="1.5">1.5×</option><option value="2">2× سريع</option></select></label></div>',
'<div class="vs-section-title"><b>3 — الصورة والحركة</b><small>تأثيرات لونية وتحكم بالإطار</small></div><div class="vs-fields"><label>التأثير<select id="vsEffect"><option value="none">بدون تأثير</option><option value="cinema">سينمائي</option><option value="mono">أبيض وأسود</option><option value="sepia">سيبيا قديم</option><option value="vivid">ألوان قوية</option><option value="neon">Neon Glow</option><option value="blur">تمويه Blur</option><option value="denoise">تقليل التشويش</option><option value="sharp">زيادة الحدة Sharpen</option></select></label><label>التدوير<select id="vsRotate"><option value="0">0°</option><option value="90">90°</option><option value="180">180°</option><option value="270">270°</option></select></label><label>القلب<select id="vsFlip"><option value="none">بدون</option><option value="h">أفقي</option><option value="v">عمودي</option><option value="both">أفقي وعمودي</option></select></label><label>التقريب / التبعيد<select id="vsZoom"><option value="0.8">0.8× تبعيد</option><option value="0.9">0.9×</option><option value="1" selected>1× طبيعي</option><option value="1.1">1.1×</option><option value="1.25">1.25×</option><option value="1.5">1.5× تقريب</option></select></label><label>السطوع<input id="vsBrightness" type="range" min="-0.2" max="0.2" value="0" step="0.02"></label><label>التباين<input id="vsContrast" type="range" min="0.5" max="1.8" value="1" step="0.05"></label><label>تشبع الألوان<input id="vsSaturation" type="range" min="0" max="2" value="1" step="0.05"></label></div><div class="vs-checks"><label><input id="vsMute" type="checkbox"> كتم صوت الفيديو الأصلي</label><label><input id="vsMixAudio" type="checkbox"> مزج الصوت الخارجي مع صوت الفيديو الأصلي (يتطلب وجود صوت أصلي)</label><label><input id="vsFade" type="checkbox"> تدرّج دخول وخروج الصورة</label></div>',
'<div class="vs-section-title"><b>4 — الكتابة والعلامة المائية</b><small>نص ملوّن يظهر في الوقت الذي تحدده</small></div><label>الكلام الذي تريد وضعه على الفيديو<textarea id="vsText" rows="2" placeholder="اكتب عنواناً أو تعليقاً أو اسمك..."></textarea></label><div class="vs-fields"><label>لون الكلام<input id="vsTextColor" type="color" value="#ffffff"></label><label>لون الحدود<input id="vsTextStroke" type="color" value="#111111"></label><label>حجم الخط<input id="vsTextSize" type="range" min="18" max="100" value="44"></label><label>نوع الخط<select id="vsFont"><option value="Arial">Arial</option><option value="Tahoma">Tahoma</option><option value="Georgia">Georgia</option><option value="Courier New">Courier New</option></select></label><label>اللون الثاني للتدرّج<input id="vsTextColor2" type="color" value="#00eaff"></label><label>مكان النص<select id="vsTextPosition"><option value="bottom">أسفل</option><option value="center">الوسط</option><option value="top">أعلى</option></select></label><label>ظهور النص من<input id="vsTextStart" type="number" min="0" step="0.1" value="0"></label><label>اختفاء النص عند<input id="vsTextEnd" type="number" min="0" step="0.1" placeholder="نهاية المقطع"></label></div><div class="vs-checks"><label><input id="vsTextOutline" type="checkbox" checked> حدود وظل للنص</label><label><input id="vsTextBox" type="checkbox"> خلفية شفافة داكنة خلف الكلام</label><label><input id="vsTextGradient" type="checkbox"> تدرّج لوني بين اللونين</label></div><label>نصوص إضافية بألوان وأوقات مختلفة<textarea id="vsCaptions" rows="4" placeholder="كل سطر بهذا الشكل: البداية | النهاية | #00eaff | النص\n0 | 3 | #ffffff | أهلاً بكم\n3 | 6 | #00eaff | SYNEX"></textarea></label><label class="file-drop" for="vsSrtFile"><span class="drop-symbol">CC</span><strong>أو أضف ملف ترجمة SRT</strong><small>تُقرأ أوقات الترجمة وتُرسم داخل الفيديو</small></label><input id="vsSrtFile" type="file" accept=".srt,text/plain" class="hidden">',
'<div class="vs-section-title"><b>5 — الموسيقى والتعليق الصوتي</b><small>اختر صوتاً خارجياً أو سجّل صوتك</small></div><label class="file-drop vs-audio-drop" for="vsAudio"><span class="drop-symbol">♫</span><strong>إضافة موسيقى أو تعليق صوتي</strong><small>استبدال الصوت الأصلي أو مزجه معه باستخدام خيار المزج</small></label><input id="vsAudio" type="file" accept="audio/*,.mp3,.wav,.m4a,.ogg,.webm" class="hidden"><div class="picked-file hidden" id="vsAudioInfo"></div><label class="vs-volume">مستوى الصوت الخارجي <input id="vsVolume" type="range" min="0" max="1.5" step="0.05" value="1"></label><div class="vs-recorder"><button class="ghost-btn" id="vsRecord">● تسجيل تعليق صوتي</button><button class="ghost-btn" id="vsStopRecord" disabled>■ إيقاف التسجيل</button><span id="vsRecordStatus">لم يبدأ التسجيل</span></div>',
'<div class="vs-section-title"><b>6 — دمج عدة مقاطع</b><small>ادمج مقطعين أو أكثر في فيديو واحد</small></div><label class="file-drop" for="vsMergeFiles"><span class="drop-symbol">＋</span><strong>اختر عدة فيديوهات بالترتيب</strong><small>اخترها بالترتيب الذي تريد دمجها به</small></label><input id="vsMergeFiles" type="file" accept="video/*" multiple class="hidden"><div class="picked-file hidden" id="vsMergeInfo"></div><button class="ghost-btn action-wide" id="vsMerge" disabled>دمج المقاطع وتنزيل MP4</button>',
'<div class="vs-actions"><button class="primary-btn action-wide" id="vsExport" disabled>تطبيق التعديلات وتصدير الفيديو</button><div class="vs-quick-actions"><button class="ghost-btn" id="vsMp3" disabled>استخراج MP3</button><button class="ghost-btn" id="vsWav" disabled>استخراج WAV</button><button class="ghost-btn" id="vsGif" disabled>تحويل إلى GIF</button></div></div><div class="progress-wrap hidden" id="vsProgress"><div class="progress-track"><span id="vsBar"></span></div><small id="vsStatus">جاهز</small></div><p class="compression-note">المعالجة تتم على جهازك. ملفات الفيديو الكبيرة قد تستهلك ذاكرة ووقتاً كبيرين. لا يمكن ضمان أن كل الترميزات تعمل على كل الملفات؛ بعض الحاويات أو المؤثرات قد لا تكون متاحة في نسخة FFmpeg المستخدمة.</p></section></div></div>'
].join("");
const el=id=>$(id);
let sourceFile=null,sourceUrl="",resultUrl="",mergeFiles=[],recordedVoice=null,recorder=null,recordChunks=[],busy=false,engine=null;
const video=el("vsPreview");
function showError(message){toast(message);el("vsStatus").textContent=message}
function safeName(name){return (name||"file").replace(/\.[^.]+$/,"").replace(/[^a-z0-9_-]+/gi,"-").slice(0,40)||"video"}
function setBusy(value){busy=value;["vsExport","vsMp3","vsWav","vsGif","vsMerge"].forEach(id=>{const b=el(id);if(b)b.disabled=value||(id==="vsMerge"?!mergeFiles.length:!sourceFile)})}
function updateProgress(ratio,label){el("vsProgress").classList.remove("hidden");el("vsBar").style.width=Math.max(1,Math.min(100,Math.round((ratio||0)*100)))+"%";el("vsStatus").textContent=label||"جارٍ المعالجة..."}
async function getEngine(){
if(!window.FFmpeg)throw Error("مكتبة FFmpeg لم تُحمّل. أعد تحميل الصفحة مع اتصال بالإنترنت.");
if(!window.synexFF)window.synexFF=window.FFmpeg.createFFmpeg({log:false,corePath:"https://unpkg.com/@ffmpeg/core@0.11.0/dist/ffmpeg-core.js",progress:p=>{const bar=document.getElementById("vsBar")||document.getElementById("cvBar");if(bar)bar.style.width=Math.max(1,Math.min(100,Math.round((p.ratio||0)*100)))+"%";const status=document.getElementById("vsStatus")||document.getElementById("cvStatus");if(status)status.textContent="جارٍ تنفيذ FFmpeg..."}});
if(!window.synexFF.isLoaded()){updateProgress(.03,"تحميل محرك الفيديو لأول مرة...");await window.synexFF.load()}
engine=window.synexFF;return engine;
}
function videoExt(file){return ((file.name.split(".").pop()||"mp4").toLowerCase().replace(/[^a-z0-9]/g,"")||"mp4")}
function setSource(file){
if(sourceUrl)URL.revokeObjectURL(sourceUrl);
sourceFile=file;sourceUrl=URL.createObjectURL(file);video.src=sourceUrl;el("vsPicked").textContent=file.name+" — "+formatBytes(file.size);el("vsPicked").classList.remove("hidden");
["vsExport","vsMp3","vsWav","vsGif","vsSnapshot","vsSeekStart","vsSeekEnd"].forEach(id=>el(id).disabled=false);
el("vsMeta").textContent=file.name+" — "+formatBytes(file.size);
video.onloadedmetadata=()=>{el("vsEnd").value=Number.isFinite(video.duration)?video.duration.toFixed(1):"";el("vsStart").max=video.duration||"";el("vsEnd").max=video.duration||"";el("vsMeta").textContent=file.name+" • "+video.videoWidth+"×"+video.videoHeight+" • "+(Number.isFinite(video.duration)?video.duration.toFixed(1)+" ثانية":"مدة غير معروفة")};
}
el("vsFile").onchange=()=>{const file=el("vsFile").files[0];if(file)setSource(file)};
el("vsMergeFiles").onchange=()=>{mergeFiles=Array.from(el("vsMergeFiles").files||[]);el("vsMergeInfo").textContent=mergeFiles.length+" مقاطع • "+formatBytes(mergeFiles.reduce((n,f)=>n+f.size,0));el("vsMergeInfo").classList.toggle("hidden",!mergeFiles.length);el("vsMerge").disabled=mergeFiles.length<2||busy};
el("vsAudio").onchange=()=>{const f=el("vsAudio").files[0];if(f){recordedVoice=null;el("vsAudioInfo").textContent=f.name+" — "+formatBytes(f.size);el("vsAudioInfo").classList.remove("hidden")}else el("vsAudioInfo").classList.add("hidden")};
el("vsSeekStart").onclick=()=>{el("vsStart").value=video.currentTime.toFixed(1)};
el("vsSeekEnd").onclick=()=>{el("vsEnd").value=video.currentTime.toFixed(1)};
function downloadBlob(blob,name,type){
const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),60000);
saveActivityFile(name,"Video Studio",name,blob).catch(()=>recordActivity(name,"Video Studio"));
if(type==="video"){if(resultUrl)URL.revokeObjectURL(resultUrl);resultUrl=URL.createObjectURL(blob);el("vsResultPreview").src=resultUrl;el("vsDownload").href=resultUrl;el("vsDownload").download=name;el("vsOutput").classList.remove("hidden")}
}
function snapshot(){
if(!video.videoWidth||!video.videoHeight){showError("اختر فيديو وانتظر ظهور المعاينة أولاً.");return}
const c=document.createElement("canvas");c.width=video.videoWidth;c.height=video.videoHeight;c.getContext("2d").drawImage(video,0,0,c.width,c.height);
c.toBlob(b=>{if(!b){showError("تعذر التقاط الإطار الحالي.");return}downloadBlob(b,safeName(sourceFile.name)+"-frame.png","image") },"image/png");
}
el("vsSnapshot").onclick=snapshot;
async function makeTextOverlay(textValue,colorValue,width,height){
if(!textValue)return null;
const c=document.createElement("canvas");c.width=width;c.height=height;const ctx=c.getContext("2d");
const px=Number(el("vsTextSize").value),color=colorValue||el("vsTextColor").value,stroke=el("vsTextStroke").value,maxWidth=width*.86;
ctx.font="bold "+px+"px "+el("vsFont").value+", Arial, sans-serif";ctx.textAlign="center";ctx.textBaseline="middle";ctx.direction=/[\u0600-\u06ff]/.test(textValue)?"rtl":"ltr";
const lines=[];
textValue.split(/\r?\n/).slice(0,5).forEach(raw=>{let line="";raw.split(/\s+/).forEach(word=>{const candidate=line?line+" "+word:word;if(line&&ctx.measureText(candidate).width>maxWidth){lines.push(line);line=word}else line=candidate});if(line)lines.push(line)});
const lineHeight=px*1.35,total=lineHeight*lines.length;let y=el("vsTextPosition").value==="top"?total/2+24:el("vsTextPosition").value==="center"?height/2:height-total/2-35;
if(el("vsTextBox").checked){const widest=Math.min(maxWidth,Math.max.apply(null,lines.map(t=>ctx.measureText(t).width))+38);ctx.fillStyle="rgba(0,0,0,.48)";ctx.fillRect((width-widest)/2,y-total/2-8,widest,total+16)}
lines.forEach((line,i)=>{const yy=y-total/2+lineHeight*(i+.5);if(el("vsTextOutline").checked){ctx.lineWidth=Math.max(2,px*.09);ctx.strokeStyle=stroke;ctx.shadowColor="rgba(0,0,0,.55)";ctx.shadowBlur=8;ctx.strokeText(line,width/2,yy)}ctx.shadowBlur=0;if(el("vsTextGradient").checked){const g=ctx.createLinearGradient(width*.1,0,width*.9,0);g.addColorStop(0,color);g.addColorStop(1,el("vsTextColor2").value);ctx.fillStyle=g}else ctx.fillStyle=color;ctx.fillText(line,width/2,yy)});
return new Promise((resolve,reject)=>c.toBlob(b=>b?resolve(b):reject(Error("تعذر إنشاء طبقة النص")),"image/png"));
}
function srtSeconds(value){const p=value.replace(",",".").split(":");return Number(p[0])*3600+Number(p[1])*60+Number(p[2])}
async function collectTextEntries(clipStart,clipDuration){
const entries=[],baseText=el("vsText").value.trim();
if(baseText)entries.push({text:baseText,color:el("vsTextColor").value,start:Math.max(0,Number(el("vsTextStart").value)||0),end:Number(el("vsTextEnd").value)||clipDuration||99999});
el("vsCaptions").value.split(/\r?\n/).forEach(line=>{
if(entries.length>=20||!line.trim())return;const p=line.split("|");if(p.length<4)return;
const start=Number(p[0].trim()),end=Number(p[1].trim()),color=p[2].trim(),text=p.slice(3).join("|").trim();
if(text&&Number.isFinite(start)&&Number.isFinite(end)&&end>start)entries.push({text,color:/^#[0-9a-f]{6}$/i.test(color)?color:el("vsTextColor").value,start,end});
});
const srtFile=el("vsSrtFile").files[0];
if(srtFile&&entries.length<20){
const raw=(await srtFile.text()).replace(/\r/g,""),blocks=raw.split(/\n{2,}/);
blocks.forEach(block=>{
if(entries.length>=20)return;const lines=block.split("\n"),timeLine=lines.find(x=>x.indexOf("-->")>=0);if(!timeLine)return;
const match=timeLine.match(/(\d{2}:\d{2}:\d{2}[,.]\d+)\s*-->\s*(\d{2}:\d{2}:\d{2}[,.]\d+)/);if(!match)return;
const start=Math.max(0,srtSeconds(match[1])-clipStart),end=Math.max(0,srtSeconds(match[2])-clipStart),text=lines.slice(lines.indexOf(timeLine)+1).join("\n").replace(/<[^>]*>/g,"").replace(/\{[^}]*\}/g,"").trim();
if(text&&end>start)entries.push({text,color:el("vsTextColor").value,start,end});
});
}
return entries.slice(0,20).filter(x=>x.end>x.start&&(!clipDuration||x.start<clipDuration));
}
function getVideoFilters(duration,speed){
const filters=[],rotate=el("vsRotate").value,flip=el("vsFlip").value,zoom=Number(el("vsZoom").value),resolution=el("vsResolution").value,effect=el("vsEffect").value;
if(rotate==="90")filters.push("transpose=1");if(rotate==="270")filters.push("transpose=2");if(rotate==="180")filters.push("hflip","vflip");
if(flip==="h"||flip==="both")filters.push("hflip");if(flip==="v"||flip==="both")filters.push("vflip");
if(zoom>1){filters.push("scale=iw*"+zoom+":ih*"+zoom+",crop=iw/"+zoom+":ih/"+zoom)}
else if(zoom<1){filters.push("scale=iw*"+zoom+":ih*"+zoom+",pad=ceil(iw/"+zoom+"/2)*2:ceil(ih/"+zoom+"/2)*2:(ow-iw)/2:(oh-ih)/2")}
if(resolution!=="original")filters.push("scale=-2:"+resolution);
if(effect==="mono")filters.push("hue=s=0");
if(effect==="sepia")filters.push("colorchannelmixer=.393:.769:.189:0:.349:.686:.168:0:.272:.534:.131");
if(effect==="cinema")filters.push("eq=contrast=1.15:saturation=1.18:brightness=0.02");
if(effect==="vivid")filters.push("eq=contrast=1.12:saturation=1.55");
if(effect==="neon")filters.push("eq=contrast=1.25:saturation=1.8:brightness=0.02","unsharp=5:5:0.8");
if(effect==="blur")filters.push("boxblur=2:1");
if(effect==="denoise")filters.push("hqdn3d=1.5:1.5:6:6");
if(effect==="sharp")filters.push("unsharp=5:5:0.8:3:3:0.4");
const brightness=Number(el("vsBrightness").value),contrast=Number(el("vsContrast").value),saturation=Number(el("vsSaturation").value);
if(brightness!==0||contrast!==1||saturation!==1)filters.push("eq=brightness="+brightness+":contrast="+contrast+":saturation="+saturation);
if(speed!==1)filters.push("setpts=PTS/"+speed);
if(el("vsFade").checked&&duration>1){filters.push("fade=t=in:st=0:d=0.5","fade=t=out:st="+Math.max(0,duration/speed-.5)+":d=0.5")}
return filters;
}
async function exportVideo(forced){
if(!sourceFile||busy)return;
const format=forced||el("vsFormat").value;
if(!["mp4","webm","gif","mp3","wav"].includes(format)){showError("صيغة الإخراج غير مدعومة.");return}
let start=Math.max(0,Number(el("vsStart").value)||0),end=Number(el("vsEnd").value)||Number(video.duration)||0;
if(end>0&&end<=start){showError("وقت النهاية يجب أن يكون أكبر من وقت البداية.");return}
if(end>0&&Number.isFinite(video.duration)&&end>video.duration+.1){showError("وقت النهاية يتجاوز مدة الفيديو.");return}
const duration=end>0?end-start:Math.max(0,(video.duration||0)-start),speed=Number(el("vsSpeed").value)||1;
setBusy(true);el("vsExport").disabled=true;
let f=null,names=[];
try{
f=await getEngine();
const input="vs-source."+videoExt(sourceFile),output="vs-result."+format;
f.FS("writeFile",input,await window.FFmpeg.fetchFile(sourceFile));names.push(input,output);
let args=[];if(start>0)args.push("-ss",String(start));if(duration>0)args.push("-t",String(duration));args.push("-i",input);
if(format==="mp3"||format==="wav"){
args.push("-vn","-map","0:a:0");if(format==="mp3")args.push("-c:a","libmp3lame","-q:a","2");else args.push("-c:a","pcm_s16le");
args.push("-y",output);
}else{
const filters=getVideoFilters(duration,speed),w=video.videoWidth||1280,h=video.videoHeight||720;
let audioIndex=-1,overlayEntries=[];
if(format!=="gif")overlayEntries=await collectTextEntries(start,duration);
else overlayEntries=await collectTextEntries(start,duration);
for(let i=0;i<overlayEntries.length;i++){
const item=overlayEntries[i],overlay=await makeTextOverlay(item.text,item.color,w,h),overlayName="vs-text-"+i+".png";
f.FS("writeFile",overlayName,new Uint8Array(await overlay.arrayBuffer()));names.push(overlayName);args.push("-loop","1","-i",overlayName);item.inputIndex=i+1;
}
const audioFile=format==="gif"?null:(el("vsAudio").files[0]||recordedVoice);
if(audioFile){const audioName="vs-extra-audio."+((audioFile.name&&audioFile.name.split(".").pop())||"webm").replace(/[^a-z0-9]/gi,"");f.FS("writeFile",audioName,await window.FFmpeg.fetchFile(audioFile));names.push(audioName);args.push("-i",audioName);audioIndex=overlayEntries.length+1}
let graph="[0:v]"+(filters.length?filters.join(","):"null")+"[v0]",current="[v0]";
overlayEntries.forEach((item,i)=>{const next="[v"+(i+1)+"]";graph+=";"+current+"["+item.inputIndex+":v]overlay=0:0:shortest=1:enable='between(t,"+item.start+","+item.end+")'"+next;current=next});
if(format==="gif"){
graph+=";"+current+"fps=12,scale=480:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse[vout]";
args.push("-filter_complex",graph,"-map","[vout]","-loop","0","-an","-y",output);
}else{
if(audioIndex>=0&&el("vsMixAudio").checked&&!el("vsMute").checked){
graph+=";["+audioIndex+":a:0]volume="+Number(el("vsVolume").value)+"[extra];[0:a:0]"+(speed!==1?"atempo="+speed+",":"")+"volume=1[original];[original][extra]amix=inputs=2:duration=first:dropout_transition=2[aout]";
args.push("-filter_complex",graph,"-map",current,"-map","[aout]","-c:a","aac","-b:a","160k","-shortest");
}else if(audioIndex>=0){if(filters.length||overlayEntries.length)args.push("-filter_complex",graph,"-map",current);else args.push("-map","0:v:0");args.push("-map",audioIndex+":a:0","-af","volume="+Number(el("vsVolume").value),"-c:a","aac","-b:a","160k","-shortest")}
else if(el("vsMute").checked){if(filters.length||overlayEntries.length)args.push("-filter_complex",graph,"-map",current);else args.push("-map","0:v:0");args.push("-an")}
else{if(filters.length||overlayEntries.length)args.push("-filter_complex",graph,"-map",current);else args.push("-map","0:v:0");args.push("-map","0:a?");if(speed!==1)args.push("-af","atempo="+speed)}
if(format==="webm")args.push("-c:v","libvpx","-b:v","1M","-c:a","libvorbis");
else args.push("-c:v","libx264","-preset","ultrafast","-crf",el("vsQuality").value,"-pix_fmt","yuv420p","-c:a","aac","-b:a","128k","-movflags","+faststart");
args.push("-y",output);
}
}
updateProgress(.08,"جارٍ تطبيق التعديلات...");await f.run(...args);
const data=f.FS("readFile",output),mime=format==="mp3"?"audio/mpeg":format==="wav"?"audio/wav":format==="gif"?"image/gif":format==="webm"?"video/webm":"video/mp4",blob=new Blob([data],{type:mime});
if(!blob.size)throw Error("لم ينتج FFmpeg ملفاً. ربما لا يحتوي الفيديو على صوت أو أن الترميز غير مدعوم.");
const name=safeName(sourceFile.name)+"-SYNEX."+format;downloadBlob(blob,name,format==="mp4"||format==="webm"?"video":"other");updateProgress(1,"اكتمل التصدير: "+name);toast("اكتمل التصدير");
}catch(e){console.error(e);showError("تعذر التصدير: "+(e.message||"خطأ FFmpeg"))}
finally{if(f)names.forEach(n=>{try{f.FS("unlink",n)}catch(_){}});setBusy(false)}
}
el("vsExport").onclick=()=>exportVideo();
el("vsMp3").onclick=()=>exportVideo("mp3");
el("vsWav").onclick=()=>exportVideo("wav");
el("vsGif").onclick=()=>exportVideo("gif");
el("vsMerge").onclick=async()=>{
if(mergeFiles.length<2||busy)return;
const total=mergeFiles.reduce((n,f)=>n+f.size,0);if(total>450*1024*1024&&!confirm("حجم المقاطع كبير وقد يستهلك ذاكرة كبيرة. هل تريد المتابعة؟"))return;
setBusy(true);let f=null,names=[];
try{
f=await getEngine();const list=[];
for(let i=0;i<mergeFiles.length;i++){const name="vs-merge-"+i+"."+videoExt(mergeFiles[i]);f.FS("writeFile",name,await window.FFmpeg.fetchFile(mergeFiles[i]));names.push(name);list.push("file '"+name+"'")}
const listName="vs-concat.txt",output="vs-merged.mp4";f.FS("writeFile",listName,new TextEncoder().encode(list.join("\n")));names.push(listName);
updateProgress(.05,"جارٍ دمج "+mergeFiles.length+" مقاطع...");
await f.run("-f","concat","-safe","0","-i",listName,"-c:v","libx264","-preset","ultrafast","-crf","23","-pix_fmt","yuv420p","-c:a","aac","-movflags","+faststart","-y",output);
const data=f.FS("readFile",output),blob=new Blob([data],{type:"video/mp4"});if(!blob.size)throw Error("لم ينتج ملف الدمج");
downloadBlob(blob,"SYNEX-Merged.mp4","video");updateProgress(1,"اكتمل دمج المقاطع");toast("تم تجهيز الفيديو المدمج");
}catch(e){console.error(e);showError("تعذر الدمج. جرّب مقاطع لها نفس الدقة ومعدل الإطارات والمسارات الصوتية. "+(e.message||""))}
finally{if(f)names.forEach(n=>{try{f.FS("unlink",n)}catch(_){}});setBusy(false)}
};
el("vsRecord").onclick=async()=>{
if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia||!window.MediaRecorder){showError("تسجيل الصوت غير مدعوم في هذا المتصفح.");return}
try{const stream=await navigator.mediaDevices.getUserMedia({audio:true});recordChunks=[];recorder=new MediaRecorder(stream);recorder.ondataavailable=e=>{if(e.data&&e.data.size)recordChunks.push(e.data)};recorder.onstop=()=>{recordedVoice=new Blob(recordChunks,{type:recorder.mimeType||"audio/webm"});stream.getTracks().forEach(t=>t.stop());el("vsRecordStatus").textContent="تم تسجيل التعليق الصوتي — "+formatBytes(recordedVoice.size);el("vsAudioInfo").textContent="تسجيل ميكروفون — "+formatBytes(recordedVoice.size);el("vsAudioInfo").classList.remove("hidden");el("vsAudio").value="";el("vsStopRecord").disabled=true;el("vsRecord").disabled=false};recorder.start();el("vsRecord").disabled=true;el("vsStopRecord").disabled=false;el("vsRecordStatus").textContent="جارٍ التسجيل... اسمح للمتصفح باستخدام الميكروفون"}
catch(e){showError("تعذر الوصول إلى الميكروفون: "+e.message)}
};
el("vsStopRecord").onclick=()=>{if(recorder&&recorder.state!=="inactive")recorder.stop()};
video.addEventListener("loadedmetadata",()=>{const ready=!!sourceFile;el("vsSnapshot").disabled=!ready;el("vsSeekStart").disabled=!ready;el("vsSeekEnd").disabled=!ready});
window.addEventListener("beforeunload",()=>{if(sourceUrl)URL.revokeObjectURL(sourceUrl);if(resultUrl)URL.revokeObjectURL(resultUrl)},{once:true});
}
function renderTextLab(){
$("toolContent").innerHTML=[
'<div class="tool-workspace textlab-workspace"><span class="section-kicker">SYNEX TEXT LAB</span><h2>مختبر النصوص</h2><p>أدوات مجانية للنصوص وكلمات المرور. كل العمليات تتم محلياً في متصفحك.</p>',
'<div class="compress-panel"><div class="vs-section-title"><b>1 — مولّد كلمات المرور</b><small>أنشئ كلمة مرور عشوائية قابلة للتخصيص</small></div><div class="vs-fields"><label>عدد الأحرف<input id="tlLength" type="number" min="8" max="64" value="20"></label><label>النمط<select id="tlPreset"><option value="all">قوية — أحرف وأرقام ورموز</option><option value="letters">أحرف وأرقام</option><option value="simple">أحرف وأرقام سهلة القراءة</option></select></label></div><div class="vs-checks"><label><input id="tlUpper" type="checkbox" checked> أحرف كبيرة</label><label><input id="tlLower" type="checkbox" checked> أحرف صغيرة</label><label><input id="tlNumbers" type="checkbox" checked> أرقام</label><label><input id="tlSymbols" type="checkbox" checked> رموز خاصة</label></div><div class="tl-password-row"><input id="tlPassword" readonly value="" placeholder="كلمة المرور ستظهر هنا"><button class="primary-btn" id="tlGenerate">إنشاء كلمة مرور</button><button class="ghost-btn" id="tlCopyPassword">نسخ</button></div><small id="tlStrength" class="compression-note">اختر الخيارات ثم أنشئ كلمة مرور.</small>',
'<div class="vs-section-title"><b>2 — عدّاد الكلمات والأحرف</b><small>يتحدث تلقائياً أثناء الكتابة</small></div><textarea id="tlCounterText" rows="7" placeholder="اكتب أو الصق النص هنا..."></textarea><div class="tl-stats"><div><small>الكلمات</small><b id="tlWords">0</b></div><div><small>الأحرف</small><b id="tlChars">0</b></div><div><small>بدون مسافات</small><b id="tlNoSpaces">0</b></div><div><small>الأسطر</small><b id="tlLines">0</b></div><div><small>الفقرات</small><b id="tlParagraphs">0</b></div><div><small>وقت القراءة</small><b id="tlReadTime">0 دقيقة</b></div></div><div class="tl-buttons"><button class="ghost-btn" id="tlClearCount">مسح النص</button><button class="ghost-btn" id="tlCopyCount">نسخ النص</button></div>',
'<div class="vs-section-title"><b>3 — مقارنة نصّين</b><small>يعرض الأسطر المضافة والمحذوفة والمشتركة</small></div><div class="vs-fields tl-compare"><label>النص الأول<textarea id="tlCompareA" rows="7" placeholder="ضع النص الأول هنا"></textarea></label><label>النص الثاني<textarea id="tlCompareB" rows="7" placeholder="ضع النص الثاني هنا"></textarea></label></div><button class="primary-btn action-wide" id="tlCompare">قارن النصين</button><div id="tlDiff" class="tl-diff hidden"></div>',
'<div class="vs-section-title"><b>4 — تنسيق وتنظيف النصوص</b><small>عدّل النص ثم انسخ النتيجة</small></div><textarea id="tlFormatText" rows="8" placeholder="ضع النص المراد تنسيقه هنا..."></textarea><div class="tl-buttons"><button class="ghost-btn" data-format="trim">إزالة الفراغات الزائدة</button><button class="ghost-btn" data-format="blank">حذف الأسطر الفارغة</button><button class="ghost-btn" data-format="duplicates">حذف الأسطر المكررة</button><button class="ghost-btn" data-format="sort">ترتيب أبجدي</button><button class="ghost-btn" data-format="upper">UPPERCASE</button><button class="ghost-btn" data-format="lower">lowercase</button><button class="ghost-btn" data-format="title">أول حرف كبير</button><button class="ghost-btn" data-format="reverse">عكس ترتيب الكلمات</button><button class="ghost-btn" data-format="number">ترقيم الأسطر</button><button class="ghost-btn" data-format="reverseChars">عكس الأحرف</button><button class="ghost-btn" data-format="collapse">دمج المسافات</button><button class="ghost-btn" data-format="copy">نسخ النتيجة</button></div><p class="compression-note" id="tlFormatStatus">اختر عملية من الأزرار أعلاه.</p></div></div>'
].join("");
const el=id=>$(id);
function copyText(value){if(navigator.clipboard&&navigator.clipboard.writeText)return navigator.clipboard.writeText(value).then(()=>toast("تم النسخ")).catch(()=>fallbackCopy(value));fallbackCopy(value)}
function fallbackCopy(value){const area=document.createElement("textarea");area.value=value;area.style.position="fixed";area.style.opacity="0";document.body.append(area);area.select();try{document.execCommand("copy");toast("تم النسخ")}catch(_){toast("حدد النص وانسخه يدوياً")}area.remove()}
function updateCount(){
const t=el("tlCounterText").value,words=t.trim()?t.trim().split(/\s+/).length:0,lines=t.length?t.split(/\r?\n/).length:0,paragraphs=t.trim()?t.trim().split(/\n\s*\n/).filter(Boolean).length:0;
el("tlWords").textContent=words.toLocaleString();el("tlChars").textContent=Array.from(t).length.toLocaleString();el("tlNoSpaces").textContent=Array.from(t).filter(ch=>!/\s/.test(ch)).length.toLocaleString();el("tlLines").textContent=lines.toLocaleString();el("tlParagraphs").textContent=paragraphs.toLocaleString();el("tlReadTime").textContent=words?Math.max(1,Math.ceil(words/200))+" دقيقة":"0 دقيقة";
}
el("tlCounterText").addEventListener("input",updateCount);el("tlClearCount").onclick=()=>{el("tlCounterText").value="";updateCount()};el("tlCopyCount").onclick=()=>copyText(el("tlCounterText").value);
el("tlGenerate").onclick=()=>{
const length=Math.max(8,Math.min(64,Number(el("tlLength").value)||20)),preset=el("tlPreset").value;
let pool="";if(el("tlUpper").checked)pool+="ABCDEFGHJKLMNPQRSTUVWXYZ";if(el("tlLower").checked)pool+="abcdefghijkmnopqrstuvwxyz";if(el("tlNumbers").checked)pool+=preset==="simple"?"23456789":"234567890";if(el("tlSymbols").checked&&preset==="all")pool+="!@#$%^&*()-_=+[]{}?";
if(!pool){toast("اختر نوعاً واحداً على الأقل من الأحرف");return}
const bytes=new Uint32Array(length);if(window.crypto&&crypto.getRandomValues)crypto.getRandomValues(bytes);else for(let i=0;i<length;i++)bytes[i]=Math.floor(Math.random()*4294967295);
let result="";for(let i=0;i<length;i++)result+=pool[bytes[i]%pool.length];
el("tlPassword").value=result;const variety=[el("tlUpper").checked,el("tlLower").checked,el("tlNumbers").checked,el("tlSymbols").checked&&preset==="all"].filter(Boolean).length;el("tlStrength").textContent="طول "+length+" حرفاً • "+(length>=16&&variety>=3?"قوية جداً":length>=12&&variety>=2?"قوية":"متوسطة");
};
el("tlCopyPassword").onclick=()=>copyText(el("tlPassword").value);
function esc(s){return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}
el("tlCompare").onclick=()=>{
const a=el("tlCompareA").value.split(/\r?\n/),b=el("tlCompareB").value.split(/\r?\n/);
if(a.length>350||b.length>350){toast("للمقارنة الدقيقة، قلّل النص إلى 350 سطراً أو أقل في كل جهة.");return}
const dp=Array.from({length:a.length+1},()=>new Uint16Array(b.length+1));
for(let i=a.length-1;i>=0;i--)for(let j=b.length-1;j>=0;j--)dp[i][j]=a[i]===b[j]?dp[i+1][j+1]+1:Math.max(dp[i+1][j],dp[i][j+1]);
let i=0,j=0,out=[];while(i<a.length||j<b.length){
if(i<a.length&&j<b.length&&a[i]===b[j]){out.push('<div class="tl-same"><span> </span>'+esc(a[i])+'</div>');i++;j++}
else if(j<b.length&&(i===a.length||dp[i][j+1]>=dp[i+1][j])){out.push('<div class="tl-added"><span>+</span>'+esc(b[j])+'</div>');j++}
else{out.push('<div class="tl-removed"><span>−</span>'+esc(a[i])+'</div>');i++}
}
el("tlDiff").innerHTML=out.join("")||"لا يوجد اختلاف";el("tlDiff").classList.remove("hidden");
};
el("toolContent").querySelectorAll("[data-format]").forEach(button=>button.onclick=()=>{
let t=el("tlFormatText").value,lines=t.split(/\r?\n/);
switch(button.dataset.format){
case "trim":t=lines.map(x=>x.trim()).join("\n");break;
case "blank":t=lines.filter(x=>x.trim()).join("\n");break;
case "duplicates":t=Array.from(new Set(lines)).join("\n");break;
case "sort":t=lines.sort((a,b)=>a.localeCompare(b,"ar")).join("\n");break;
case "upper":t=t.toUpperCase();break;
case "lower":t=t.toLowerCase();break;
case "title":t=t.replace(/\b([a-z])/gi,m=>m.toUpperCase());break;
case "reverse":t=lines.map(x=>x.split(/\s+/).reverse().join(" ")).join("\n");break;
case "number":t=lines.map((x,i)=>(i+1)+". "+x).join("\n");break;
case "reverseChars":t=Array.from(t).reverse().join("");break;
case "collapse":t=t.replace(/[ \t]+/g," ").replace(/\n{3,}/g,"\n\n");break;
case "copy":copyText(t);return;
}
el("tlFormatText").value=t;el("tlFormatStatus").textContent="تم تطبيق العملية على النص.";
});
}
function renderCompressor(){
$("toolContent").innerHTML=`
<div class="tool-workspace"><span class="section-kicker">SYNEX FILE LAB</span><h2>مختبر ضغط الملفات</h2>
<p>اضغط ملفاً واحداً بصيغة GZIP، أو اجمع ملفات ومجلدات في أرشيف ZIP. كل الملفات داخل ZIP تبقى كما هي دون تغيير جودة الصور أو محتوياتها.</p>
<div class="compress-panel">
<div class="mode-switch"><button class="mode-btn active" id="singleMode">ملف واحد GZIP</button><button class="mode-btn" id="zipMode">ZIP متعدد الملفات</button><button class="mode-btn" id="batchMode">ضغط دفعات</button></div>
<div id="singlePane">
<label class="file-drop" for="singleFile"><span class="drop-symbol">＋</span><strong>اختر ملفاً واحداً</strong><small>ينتج ملف GZIP مستقل</small></label><input id="singleFile" type="file" class="hidden">
<div id="singlePicked" class="picked-file hidden"></div>
<div class="level-box"><div class="level-head"><label for="compressionLevel">مستوى الضغط</label><strong id="levelValue">6 / 9 — متوازن</strong></div><input id="compressionLevel" class="compression-slider" type="range" min="1" max="9" value="6"><div class="level-ends"><span>أسرع</span><span>ضغط أقوى</span></div><p id="smartTip" class="compression-note">اختر ملفاً للحصول على اقتراح ذكي.</p></div>
</div>
<div id="multiPane" class="hidden">
<div class="mode-switch"><button class="mode-btn active" id="filesPickMode">اختيار ملفات</button><button class="mode-btn" id="folderPickMode">اختيار مجلد</button></div>
<label class="file-drop" for="multiFiles"><span class="drop-symbol">▣</span><strong id="multiPrompt">اختر عدة ملفات</strong><small>سيتم جمعها في ملف ZIP واحد</small></label>
<input id="multiFiles" type="file" multiple class="hidden">
<input id="folderFiles" type="file" webkitdirectory directory multiple class="hidden">
<div id="multiPicked" class="picked-file hidden"></div>
<div class="level-box"><div class="level-head"><label for="zipLevel">مستوى ضغط ZIP</label><strong id="zipLevelValue">6 / 9</strong></div><input id="zipLevel" class="compression-slider" type="range" min="0" max="9" value="6"><div class="level-ends"><span>تخزين أسرع</span><span>ضغط أعلى</span></div></div>
</div>
<div id="batchPane" class="hidden">
<label class="file-drop" for="batchFiles"><span class="drop-symbol">⇣</span><strong>اختر مجموعة ملفات</strong><small>ستتم معالجتها تباعاً داخل ZIP واحد</small></label><input id="batchFiles" type="file" multiple class="hidden"><div id="batchPicked" class="picked-file hidden"></div>
<p class="compression-note">الدفعات تُجمع في أرشيف واحد لتسهيل التنزيل بدلاً من ظهور نوافذ تنزيل كثيرة.</p>
</div>
<div id="imagePreviewPanel" class="image-preview-panel hidden"><div class="preview-heading"><b>معرض الصور</b><small>معاينة جميع الصور المختارة قبل التنزيل • اضغط الصورة لعرضها مكبّرة</small></div><div id="imageGallery" class="image-gallery"></div><div class="image-export-bar"><label for="imageExportFormat">صيغة الصور</label><select id="imageExportFormat"><option value="image/png">PNG</option><option value="image/jpeg">JPEG</option></select><button class="ghost-btn" id="downloadAllImages">تنزيل الصور كلها ZIP</button></div><div class="preview-stage hidden" id="previewStage"><img id="previewImage" alt="معاينة الصورة المحددة"></div><div class="preview-controls hidden" id="previewControls"><button class="ghost-btn" id="zoomOut">−</button><span id="zoomLabel">100%</span><button class="ghost-btn" id="zoomIn">＋</button><button class="ghost-btn" id="zoomReset">إعادة</button></div><p class="compression-note">PNG يحافظ على الجودة دون فقدان. JPEG قد يقلل الحجم مع فقدان بسيط في الجودة، والخلفية الشفافة تصبح بيضاء.</p></div>
<div id="resultStats" class="result-stats hidden"><div><small>الحجم قبل الضغط</small><b id="originalSize">—</b></div><div><small>حجم الأرشيف</small><b id="compressedSize">—</b></div><div><small>التوفير</small><b id="savedPercent">—</b></div></div>
<div class="progress-wrap hidden" id="progressWrap"><div class="progress-track"><span id="progressBar"></span></div><small id="progressStatus">جارٍ التحضير...</small></div>
<button class="primary-btn action-wide" id="runCompress" disabled>ابدأ الضغط</button><button class="primary-btn action-wide hidden" id="downloadResult">تنزيل الملف الآن</button>
<p class="compression-note">ملاحظة: GZIP وZIP ضغط دون فقدان. الصور والفيديوهات المضغوطة مسبقاً قد لا ينخفض حجمها كثيراً. الأرشيف الكبير قد يحتاج ذاكرة إضافية أثناء إنشائه.</p>
</div>
<div class="history-panel"><div class="history-title"><b>سجل آخر العمليات</b><button class="ghost-btn" id="clearHistory">مسح السجل</button></div><div id="historyList"></div></div>
</div>`;
let mode="single",selected=[],resultBlob=null,resultName="",zoom=1,drag=null;
const $id=id=>$(id);
function switchMode(m){mode=m;["singleMode","zipMode","batchMode"].forEach((id,i)=>$id(id).classList.toggle("active",["single","zip","batch"][i]===m));$("singlePane").classList.toggle("hidden",m!=="single");$("multiPane").classList.toggle("hidden",m!=="zip");$("batchPane").classList.toggle("hidden",m!=="batch");$("runCompress").classList.remove("hidden");$("downloadResult").classList.add("hidden");$("resultStats").classList.add("hidden");$("imagePreviewPanel").classList.add("hidden");resultBlob=null;selected=[];$("runCompress").disabled=true}
$("singleMode").onclick=()=>switchMode("single");$("zipMode").onclick=()=>switchMode("zip");$("batchMode").onclick=()=>switchMode("batch");
function updateLevel(){let n=+$("compressionLevel").value,names=["","سريع","سريع","خفيف","خفيف","متوازن","متوازن","قوي","قوي","أقصى ضغط"];$("levelValue").textContent=n+" / 9 — "+names[n]}
$("compressionLevel").oninput=updateLevel;
$("singleFile").onchange=()=>{const f=$("singleFile").files[0];if(!f)return;selected=[f];$("singlePicked").textContent=f.name+" • "+formatBytes(f.size);$("singlePicked").classList.remove("hidden");const s=suggestion(selected);$("compressionLevel").value=s.level;updateLevel();$("smartTip").textContent="اقتراح SYNEX: "+s.label+". "+s.reason;$("runCompress").disabled=false};
$("zipLevel").oninput=()=>$("zipLevelValue").textContent=$("zipLevel").value+" / 9";
$("filesPickMode").onclick=()=>{$("multiFiles").click()};
$("folderPickMode").onclick=()=>{$("folderFiles").click()};
function setMulti(files,target){selected=[...files];if(!selected.length)return;const total=selected.reduce((a,f)=>a+f.size,0);$(target).textContent=selected.length+" ملف • "+formatBytes(total);$(target).classList.remove("hidden");$("runCompress").disabled=false;showImagePreview(selected)}
$("multiFiles").onchange=()=>setMulti($("multiFiles").files,"multiPicked");
$("folderFiles").onchange=()=>setMulti($("folderFiles").files,"multiPicked");
$("batchFiles").onchange=()=>setMulti($("batchFiles").files,"batchPicked");
let previewUrls=[];
function showImagePreview(files){
previewUrls.forEach(u=>URL.revokeObjectURL(u));previewUrls=[];
const images=files.filter(f=>f.type.startsWith("image/"));
if(!images.length){$("imagePreviewPanel").classList.add("hidden");return}
const gallery=$("imageGallery");gallery.innerHTML="";
images.forEach((file,index)=>{
const url=URL.createObjectURL(file);previewUrls.push(url);
const card=document.createElement("article");card.className="image-thumb";
const img=document.createElement("img");img.src=url;img.alt=file.name;img.loading="lazy";
const meta=document.createElement("div");meta.className="image-thumb-meta";
const name=document.createElement("span");name.textContent=file.name;
const size=document.createElement("small");size.textContent=formatBytes(file.size);
const actions=document.createElement("div");actions.className="image-thumb-actions";
const view=document.createElement("button");view.className="ghost-btn";view.type="button";view.textContent="عرض";view.title="عرض الصورة";
const save=document.createElement("button");save.className="ghost-btn";save.type="button";save.textContent="↓";save.title="تنزيل هذه الصورة";
view.onclick=()=>{const stage=$("previewStage");stage.classList.remove("hidden");$("previewControls").classList.remove("hidden");$("previewImage").src=url;zoom=1;applyZoom();stage.scrollTop=0;stage.scrollLeft=0};
save.onclick=async()=>{try{const blob=await convertImage(file,$("imageExportFormat").value),name=outputImageName(file,$("imageExportFormat").value);saveActivityFile(file.name,"Image export",name,blob).catch(()=>recordActivity(file.name,"Image export"));downloadBlob(blob,name);toast("تم تجهيز الصورة")}catch(e){toast("تعذر تحويل الصورة: "+e.message)}};
actions.append(view,save);meta.append(name,size,actions);card.append(img,meta);gallery.append(card);
});
$("imagePreviewPanel").classList.remove("hidden");
$("previewStage").classList.add("hidden");$("previewControls").classList.add("hidden");
$("downloadAllImages").onclick=async()=>{
const button=$("downloadAllImages");button.disabled=true;
try{if(!window.fflate)throw Error("مكتبة ZIP غير متاحة");const fmt=$("imageExportFormat").value,ext=fmt==="image/png"?"png":"jpg",entries={};
for(let i=0;i<images.length;i++){const blob=await convertImage(images[i],fmt);entries[outputImageName(images[i],fmt)]=new Uint8Array(await blob.arrayBuffer());}
const zipped=fflate.zipSync(entries,{level:0});const zipName="SYNEX-Images-"+Date.now()+".zip",zipBlob=new Blob([zipped],{type:"application/zip"});saveActivityFile(images.length+" images","ZIP image export",zipName,zipBlob).catch(()=>recordActivity(images.length+" images","ZIP image export"));downloadBlob(zipBlob,zipName);toast("تم تجهيز أرشيف الصور")}
catch(e){toast("تعذر إنشاء ZIP: "+e.message)}finally{button.disabled=false}
};
}
async function convertImage(file,mime){
const bitmap=await createImageBitmap(file),canvas=document.createElement("canvas");canvas.width=bitmap.width;canvas.height=bitmap.height;
const ctx=canvas.getContext("2d");if(mime==="image/jpeg"){ctx.fillStyle="#ffffff";ctx.fillRect(0,0,canvas.width,canvas.height)}ctx.drawImage(bitmap,0,0);bitmap.close();
return await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(Error("فشل تحويل الصورة")),mime,mime==="image/jpeg"?.92:undefined));
}
function outputImageName(file,mime){const base=file.name.replace(/\.[^.]+$/,"");return base+"."+(mime==="image/png"?"png":"jpg")}
function downloadBlob(blob,name){const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),30000)}
function applyZoom(){$("previewImage").style.transform="scale("+zoom+")";$("zoomLabel").textContent=Math.round(zoom*100)+"%"}
function changeZoom(v){zoom=Math.min(8,Math.max(.2,zoom*v));applyZoom()}
$("previewStage").addEventListener("wheel",e=>{e.preventDefault();changeZoom(e.deltaY<0?1.15:1/1.15)},{passive:false});
$("zoomIn").onclick=()=>changeZoom(1.25);$("zoomOut").onclick=()=>changeZoom(.8);$("zoomReset").onclick=()=>{zoom=1;applyZoom()};
$("previewImage").addEventListener("pointerdown",e=>{drag={x:e.clientX,y:e.clientY,left:$("previewStage").scrollLeft,top:$("previewStage").scrollTop};$("previewImage").setPointerCapture(e.pointerId)});
$("previewImage").addEventListener("pointermove",e=>{if(!drag)return;$("previewStage").scrollLeft=drag.left-(e.clientX-drag.x);$("previewStage").scrollTop=drag.top-(e.clientY-drag.y)});
$("previewImage").addEventListener("pointerup",()=>drag=null);$("previewImage").addEventListener("pointercancel",()=>drag=null);
$("runCompress").onclick=async()=>{if(!selected.length)return;$("runCompress").disabled=true;$("progressWrap").classList.remove("hidden");$("progressBar").style.width="0%";$("progressStatus").textContent="جارٍ تجهيز الملفات...";
try{
if(mode==="single"){const f=selected[0];if(!window.fflate)throw Error("مكتبة الضغط لم تُحمّل.");if(f.size>180*1024*1024)throw Error("لملف أكبر من 180MB استخدم ZIP/خدمة تدعم الحفظ المتدفق لاحقاً؛ هذا الإصدار يقيّد الملف لحماية الذاكرة.");const data=new Uint8Array(await f.arrayBuffer());const compressed=fflate.gzipSync(data,{level:+$("compressionLevel").value});resultBlob=new Blob([compressed],{type:"application/gzip"});resultName=f.name+".gz";$("progressBar").style.width="100%";$("progressStatus").textContent="اكتمل ضغط الملف."}
else {if(!window.fflate)throw Error("مكتبة ZIP لم تُحمّل.");const total=selected.reduce((a,f)=>a+f.size,0);if(total>350*1024*1024)throw Error("إجمالي الملفات يتجاوز 350MB في هذا الإصدار التجريبي لحماية ذاكرة المتصفح.");const files={};let done=0;for(let i=0;i<selected.length;i++){const f=selected[i];const path=(f.webkitRelativePath||f.name).replace(/^\/+/, "");files[path]=new Uint8Array(await f.arrayBuffer());done+=f.size;$("progressBar").style.width=Math.round(done/Math.max(total,1)*90)+"%";$("progressStatus").textContent="تجهيز "+(i+1)+" من "+selected.length+" • "+f.name}const zipped=fflate.zipSync(files,{level:+$("zipLevel").value});resultBlob=new Blob([zipped],{type:"application/zip"});resultName="SYNEX-Archive-"+Date.now()+".zip";$("progressBar").style.width="100%";$("progressStatus").textContent="اكتمل إنشاء ZIP."}
const before=selected.reduce((a,f)=>a+f.size,0),after=resultBlob.size,ratio=(1-after/Math.max(before,1))*100;$("originalSize").textContent=formatBytes(before);$("compressedSize").textContent=formatBytes(after);$("savedPercent").textContent=(ratio>=0?ratio.toFixed(1)+"% توفير":Math.abs(ratio).toFixed(1)+"% زيادة");$("resultStats").classList.remove("hidden");$("downloadResult").classList.remove("hidden");$("runCompress").classList.add("hidden");$("progressStatus").textContent+=" الملف جاهز، راجع معاينة الصورة ثم اضغط تنزيل.";addHistory(resultName,mode==="single"?"GZIP":"ZIP",formatBytes(before)+" ← "+formatBytes(after),resultBlob);toast("تم تجهيز الملف. التنزيل بانتظار ضغط الزر.");
}catch(e){$("progressStatus").textContent="تعذر إكمال الضغط: "+e.message;toast(e.message);$("runCompress").disabled=false}
};
$("downloadResult").onclick=()=>{if(!resultBlob)return;const url=URL.createObjectURL(resultBlob),a=document.createElement("a");a.href=url;a.download=resultName;a.click();setTimeout(()=>URL.revokeObjectURL(url),60000);toast("بدأ تنزيل "+resultName)};
$("clearHistory").onclick=()=>{if(confirm("مسح سجل العمليات المحفوظ على هذا الجهاز؟")){localStorage.removeItem(HISTORY_KEY);renderHistory()}};
renderHistory();updateLevel();
}
function renderQrGenerator(){
$("toolContent").innerHTML=`<div class="tool-workspace"><span class="section-kicker">QR CODE CREATOR</span><h2>إنشاء رمز QR</h2><p>اكتب رابطاً أو نصاً لإنشاء رمز قابل للمسح بكاميرا الهاتف. اختيار ملف يضيف اسمه وحجمه فقط ولا يرفع الملف.</p><div class="compress-panel"><label>النص أو الرابط</label><textarea id="qrInput" rows="4" placeholder="https://example.com أو اكتب نصك هنا"></textarea><label class="file-drop" for="qrFile"><span class="drop-symbol">＋</span><strong>أو اختر ملفاً لإضافة اسمه إلى QR</strong><small>لا يتم تضمين الملف نفسه داخل الرمز</small></label><input id="qrFile" type="file" class="hidden"><button class="primary-btn action-wide" id="makeQr">إنشاء QR</button><div id="qrOutput" class="qr-output hidden"><div id="qrCanvas"></div><button class="primary-btn" id="downloadQr">تنزيل صورة QR</button></div><p id="qrMakeStatus" class="compression-note" aria-live="polite"></p></div></div>`;
$("qrFile").onchange=()=>{const f=$("qrFile").files[0];if(f)$("qrInput").value="اسم الملف: "+f.name+" | الحجم: "+formatBytes(f.size)};
$("makeQr").onclick=async()=>{
 const value=$("qrInput").value.trim();if(!value){toast("اكتب نصاً أو رابطاً أولاً");return}
 $("makeQr").disabled=true;$("qrMakeStatus").textContent="جارٍ تجهيز مكتبة QR...";
 try{
  if(!await loadQrLibrary("generator"))throw new Error("تعذر تحميل مكتبة إنشاء QR. تحقق من اتصال الإنترنت ثم أعد المحاولة.");
  $("qrCanvas").innerHTML="";$("qrOutput").classList.remove("hidden");
  new window.QRCode($("qrCanvas"),{text:value,width:300,height:300,colorDark:"#10152b",colorLight:"#ffffff",correctLevel:window.QRCode.CorrectLevel.H});
  $("qrMakeStatus").textContent="تم إنشاء الرمز. امسحه بكاميرا الهاتف للتأكد من محتواه.";
 }catch(e){$("qrMakeStatus").textContent=e.message;toast(e.message)}
 finally{$("makeQr").disabled=false}
};
$("downloadQr").onclick=()=>{
 const canvas=$("qrCanvas").querySelector("canvas"),img=$("qrCanvas").querySelector("img");
 let url="";if(canvas){try{url=canvas.toDataURL("image/png")}catch(_){}}else if(img&&img.complete)url=img.src;
 if(!url){toast("انتظر ظهور صورة QR ثم حاول التنزيل");return}
 const a=document.createElement("a");a.href=url;a.download="SYNEX-QR.png";document.body.appendChild(a);a.click();a.remove();
};
}
function renderQrReader(){
$("toolContent").innerHTML=`<div class="tool-workspace"><span class="section-kicker">QR IMAGE SCANNER</span><h2>قراءة رمز QR</h2><p>اختر صورة تحتوي على QR لقراءة الرابط أو النص. تتم القراءة على جهازك دون رفع الصورة.</p><div class="compress-panel"><label class="file-drop" for="qrImage"><span class="drop-symbol">▦</span><strong>اختر صورة QR من جهازك</strong><small>PNG أو JPG أو WebP</small></label><input id="qrImage" type="file" accept="image/*" class="hidden"><div class="qr-preview hidden" id="qrPreview"><img id="qrImagePreview" alt="معاينة الصورة"></div><div class="qr-result hidden" id="qrResult"><b>محتوى رمز QR</b><textarea id="qrText" readonly rows="4"></textarea><div class="qr-actions"><button class="primary-btn" id="copyQr">نسخ المحتوى</button><a class="ghost-btn hidden" id="openQr" target="_blank" rel="noopener">فتح الرابط</a></div></div><p class="compression-note" id="qrStatus" aria-live="polite">اختر صورة واضحة يظهر فيها الرمز كاملاً.</p></div></div>`;
$("qrImage").onchange=async()=>{
 const f=$("qrImage").files[0];if(!f)return;
 $("qrStatus").textContent="جارٍ قراءة الصورة...";
 $("qrResult").classList.add("hidden");
 const url=URL.createObjectURL(f),im=new Image();
 im.onload=async()=>{
  try{
   $("qrPreview").classList.remove("hidden");$("qrImagePreview").src=url;
   const c=document.createElement("canvas"),ctx=c.getContext("2d",{willReadFrequently:true});
   const scale=Math.min(1,2400/Math.max(im.naturalWidth,im.naturalHeight));
   c.width=Math.max(1,Math.round(im.naturalWidth*scale));c.height=Math.max(1,Math.round(im.naturalHeight*scale));
   ctx.drawImage(im,0,0,c.width,c.height);
   let decoded=null;
   if("BarcodeDetector"in window){
    try{const detector=new BarcodeDetector({formats:["qr_code"]});const found=await detector.detect(c);if(found.length)decoded=found[0].rawValue}catch(_){}
   }
   if(!decoded&&await loadQrLibrary("reader")){
    const pixels=ctx.getImageData(0,0,c.width,c.height);
    const result=window.jsQR(pixels.data,pixels.width,pixels.height,{inversionAttempts:"attemptBoth"});
    if(result)decoded=result.data;
   }
   if(!decoded){$("qrStatus").textContent="لم يتم العثور على رمز QR. جرّب صورة أوضح، واجعل الرمز كاملاً وغير مقصوص.";return}
   $("qrResult").classList.remove("hidden");$("qrText").value=decoded;
   const link=$("openQr");if(/^https?:\/\//i.test(decoded)){link.href=decoded;link.classList.remove("hidden")}else link.classList.add("hidden");
   $("qrStatus").textContent="تمت قراءة الرمز بنجاح.";
  }catch(e){$("qrStatus").textContent="تعذرت قراءة الصورة: "+e.message}
  finally{URL.revokeObjectURL(url)}
 };
 im.onerror=()=>{URL.revokeObjectURL(url);$("qrStatus").textContent="تعذر فتح الصورة. جرّب ملف صورة آخر."};
 im.src=url;
};
$("copyQr").onclick=async()=>{try{await navigator.clipboard.writeText($("qrText").value);toast("تم النسخ")}catch(_){$("qrText").select();document.execCommand("copy");toast("تم النسخ")}}
}
$("backHome").onclick=showHome;
$("accountButton").onclick=async()=>{if(supabaseClient&&confirm("هل تريد تسجيل الخروج؟")){const{error}=await supabaseClient.auth.signOut();if(!error)location.reload()}};
window.addEventListener("online",()=>toast("عاد الاتصال بالإنترنت"));window.addEventListener("offline",()=>toast("أنت غير متصل بالإنترنت"));

let deferredInstallPrompt=null;
window.addEventListener("beforeinstallprompt",event=>{
 event.preventDefault();deferredInstallPrompt=event;
 const b=$("installButton");if(b){b.textContent="تثبيت SYNEX الآن";$("installStatus").textContent="جهازك يدعم التثبيت المباشر."}
});
window.addEventListener("appinstalled",()=>{
 deferredInstallPrompt=null;$("installStatus").textContent="تم تثبيت SYNEX بنجاح.";
 $("installButton").textContent="تم التثبيت";$("installButton").disabled=true;
});
function isAppleMobile(){return /iphone|ipad|ipod/i.test(navigator.userAgent)||(navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1)}
$("installNav").addEventListener("click",()=>{$("installApp").scrollIntoView({behavior:"smooth",block:"start"})});
$("installButton").addEventListener("click",async()=>{
 if(deferredInstallPrompt){
  deferredInstallPrompt.prompt();
  const choice=await deferredInstallPrompt.userChoice;
  $("installStatus").textContent=choice&&choice.outcome==="accepted"?"جارٍ تثبيت SYNEX...":"يمكنك تثبيته لاحقاً من قائمة المتصفح.";
  deferredInstallPrompt=null;return;
 }
 if(isAppleMobile()){
  $("installStatus").textContent="على iPhone/iPad: افتح الموقع في Safari ثم مشاركة ← إضافة إلى الشاشة الرئيسية.";
 }else if(window.matchMedia&&window.matchMedia("(display-mode: standalone)").matches){
  $("installStatus").textContent="SYNEX مثبت ويعمل كتطبيق بالفعل.";
 }else{
  $("installStatus").textContent="إذا لم يظهر زر التثبيت: افتح قائمة Chrome أو Edge وابحث عن «تثبيت SYNEX» أو «إنشاء اختصار».";
 }
});

if("serviceWorker"in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
const launchParams=new URLSearchParams(location.search);if(launchParams.has("quickdrop"))openTool("quickdrop");else if(launchParams.get("tool")==="voicetype")openTool("voicetype");
})();
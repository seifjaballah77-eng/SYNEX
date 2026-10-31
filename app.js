(() => {
const $=id=>document.getElementById(id), dialog=$("loginDialog"), toastEl=$("toast");
let toastTimer,isGuest=false,isSignedIn=false,supabaseClient=null;
function toast(m){toastEl.textContent=m;toastEl.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>toastEl.classList.remove("show"),3000)}
const cfg=window.SYNEX_CONFIG||{};
if(window.supabase&&cfg.supabaseUrl&&cfg.supabaseAnonKey){supabaseClient=window.supabase.createClient(cfg.supabaseUrl,cfg.supabaseAnonKey);supabaseClient.auth.getSession().then(({data})=>{if(data.session)showSignedIn(data.session.user)})}
function showSignedIn(user){isSignedIn=true;isGuest=false;retentionCleanup();dialog.close();$("openLogin").classList.add("hidden");$("accountButton").classList.remove("hidden");$("accountButton").textContent=(user.email||"S").slice(0,1).toUpperCase();toast("تم تسجيل الدخول بنجاح")}
function openLogin(){$("authHint").classList.toggle("hidden",!!supabaseClient);dialog.showModal()}
$("openLogin").addEventListener("click",openLogin);
$("startNow").addEventListener("click",()=>{if(!isGuest&&!isSignedIn)openLogin();else openTool("compressor")});
function continueAsGuest(){isGuest=true;retentionCleanup();$("guestWarning").classList.remove("hidden");dialog.close();openTool("compressor");toast("وضع الزائر — تُحفظ بيانات النشاط محلياً لمدة 48 ساعة") }
$("guestSkip").addEventListener("click",continueAsGuest);$("dialogSkip").addEventListener("click",continueAsGuest);
$("googleSignIn").addEventListener("click",async()=>{if(!supabaseClient){$("authHint").classList.remove("hidden");toast("تسجيل Google يحتاج إعداد Supabase OAuth أولاً");return}const {error}=await supabaseClient.auth.signInWithOAuth({provider:"google",options:{redirectTo:location.origin+location.pathname}});if(error)toast("تعذر بدء تسجيل الدخول: "+error.message)});
$("themeToggle").addEventListener("click",()=>{document.body.classList.toggle("light");localStorage.setItem("synex-theme",document.body.classList.contains("light")?"light":"dark")});
if(localStorage.getItem("synex-theme")==="light")document.body.classList.add("light");
const info={quickdrop:["QuickDrop","نقل الملفات","نقل الملفات بين الأجهزة يحتاج إلى خدمة نقل واتصال مخصصة."],screentext:["ScreenText","استخراج النصوص والتصميم","استخراج النصوص من الصور وتحريرها قيد التطوير."],voicetype:["VoiceType","تحويل الصوت إلى نص","تحويل الكلام والتسجيلات إلى نص قيد التطوير."]};
function openTool(name){
if(!isGuest&&!isSignedIn){openLogin();return}
$("tools").classList.add("hidden");document.querySelector(".hero").classList.add("hidden");$("workspace").classList.remove("hidden");
document.querySelectorAll(".side-tool").forEach(b=>b.classList.toggle("active",b.dataset.tool===name));
if(name==="compressor")renderCompressor();
else if(name==="qrreader")renderQrReader();
else if(name==="qrgenerator")renderQrGenerator();
else if(name==="screentext")renderScreenText();
else if(name==="voicetype")renderVoiceType();
else renderQuickDrop();
window.scrollTo({top:0,behavior:"smooth"});
}
document.querySelectorAll("[data-tool]").forEach(btn=>btn.addEventListener("click",()=>openTool(btn.dataset.tool)));
document.querySelectorAll(".side-tool").forEach(btn=>btn.addEventListener("click",()=>openTool(btn.dataset.tool)));
function showHome(){$("workspace").classList.add("hidden");$("tools").classList.remove("hidden");document.querySelector(".hero").classList.remove("hidden");document.querySelectorAll(".side-tool").forEach(b=>b.classList.remove("active"));window.scrollTo({top:0,behavior:"smooth"})}
function showHelp(){
$("tools").classList.add("hidden");document.querySelector(".hero").classList.add("hidden");$("workspace").classList.remove("hidden");
$("toolContent").innerHTML='<div class="tool-workspace"><span class="section-kicker">SYNEX GUIDE</span><h2>مركز المساعدة</h2><div class="help-grid"><article><b>File Lab</b><p>ضغط GZIP لملف واحد أو ZIP لعدة ملفات ومجلدات. اختر الصور لمعاينتها وتصديرها بصيغ مختلفة.</p></article><article><b>QR Generator</b><p>أنشئ رمز QR من رابط أو نص ثم نزّله كصورة PNG.</p></article><article><b>QR Reader</b><p>ارفع صورة QR لقراءة محتواها ونسخه أو فتح الرابط.</p></article><article><b>ScreenText</b><p>استخرج النص من صورة باستخدام OCR داخل المتصفح، ثم انسخه أو نزّله TXT.</p></article><article><b>VoiceType</b><p>حوّل الكلام المباشر إلى نص باستخدام خدمة التعرف على الكلام في المتصفح؛ يتطلب متصفحاً يدعمها وميكروفوناً.</p></article><article><b>QuickDrop</b><p>نقل الملفات بين جهازين يحتاج خادم اتصال وإشارة WebRTC؛ هذه الوظيفة لم تُفعّل بعد ولا ندّعي أن النقل يعمل.</p></article><article><b>السجل والخصوصية</b><p>السجل الحالي محفوظ محلياً على هذا الجهاز. الزائر يحتفظ به 48 ساعة، والمستخدم المسجل 120 يوماً محلياً. المزامنة السحابية بين الأجهزة تحتاج إعداد قاعدة بيانات وتخزين.</p></article><article><b>تسجيل الدخول</b><p>يتطلب إعداد مفاتيح Supabase وتفعيل Google OAuth. بيانات الاتصال غير مضبوطة في نسخة الإعداد الحالية.</p></article></div></div>';
}
function showGlobalHistory(){
$("tools").classList.add("hidden");document.querySelector(".hero").classList.add("hidden");$("workspace").classList.remove("hidden");
const items=JSON.parse(localStorage.getItem("synex-global-history")||"[]");
$("toolContent").innerHTML='<div class="tool-workspace"><span class="section-kicker">ACTIVITY</span><h2>سجل النشاط</h2><div class="history-panel" id="globalHistory"></div></div>';
const box=$("globalHistory");if(!items.length){box.textContent="لا توجد عمليات مسجلة بعد.";return}
items.forEach(x=>{const row=document.createElement("div");row.className="history-row";const left=document.createElement("div"),b=document.createElement("b"),s=document.createElement("small");b.textContent=x.title;s.textContent=x.date+" • "+x.type;left.append(b,s);row.append(left);box.append(row)});
}
function recordActivity(title,type){const key="synex-global-history";let list=[];try{list=JSON.parse(localStorage.getItem(key)||"[]")}catch(_){}list.unshift({title,type,date:new Date().toLocaleString()});localStorage.setItem(key,JSON.stringify(list.slice(0,100)))}
$("sideHome").addEventListener("click",showHome);$("sideHelp").addEventListener("click",showHelp);$("sideHistory").addEventListener("click",showGlobalHistory);
function renderQuickDrop(){
$("toolContent").innerHTML='<div class="tool-workspace"><span class="section-kicker">QUICKDROP</span><h2>نقل الملفات</h2><div class="compress-panel"><div class="placeholder-panel"><b>النقل المباشر بين الأجهزة غير مفعّل بعد</b><p>لإنجازه بشكل حقيقي نحتاج خدمة signaling واتصال WebRTC، وقد نحتاج TURN حتى يعمل عبر شبكات مختلفة. لن أعرض زر إرسال وهمياً قبل إعداد هذه الخدمة.</p></div></div></div>';
}
function renderScreenText(){
$("toolContent").innerHTML='<div class="tool-workspace"><span class="section-kicker">SCREEN TEXT / OCR</span><h2>استخراج النص من الصور</h2><div class="compress-panel"><label class="file-drop" for="ocrFile"><span class="drop-symbol">▧</span><strong>اختر صورة</strong><small>PNG / JPG / WEBP</small></label><input id="ocrFile" type="file" accept="image/*" class="hidden"><div id="ocrPreview" class="qr-preview hidden"><img id="ocrImage" alt="الصورة المختارة"></div><select id="ocrLang"><option value="eng">English</option><option value="ara">العربية</option><option value="fra">Français</option></select><button class="primary-btn action-wide" id="runOcr" disabled>استخراج النص</button><div class="progress-wrap hidden" id="ocrProgress"><div class="progress-track"><span id="ocrBar"></span></div><small id="ocrStatus">جارٍ التحضير</small></div><textarea id="ocrText" rows="9" placeholder="سيظهر النص المستخرج هنا"></textarea><div class="qr-actions"><button class="ghost-btn" id="copyOcr">نسخ</button><button class="ghost-btn" id="saveOcr">تنزيل TXT</button></div></div></div>';
let file=null,url="";
$("ocrFile").onchange=()=>{file=$("ocrFile").files[0];if(!file)return;if(url)URL.revokeObjectURL(url);url=URL.createObjectURL(file);$("ocrImage").src=url;$("ocrPreview").classList.remove("hidden");$("runOcr").disabled=false};
$("runOcr").onclick=async()=>{if(!file)return;if(!window.Tesseract){toast("تعذر تحميل محرك OCR؛ تحقق من الاتصال");return}$("runOcr").disabled=true;$("ocrProgress").classList.remove("hidden");try{const lang=$("ocrLang").value;const result=await Tesseract.recognize(file,lang,{logger:m=>{if(m.progress!==undefined){$("ocrBar").style.width=Math.round(m.progress*100)+"%";$("ocrStatus").textContent=m.status||"جارٍ التعرف"}}});$("ocrText").value=result.data.text||"";recordActivity(file.name,"OCR");toast("اكتمل استخراج النص")}catch(e){toast("تعذر OCR: "+e.message)}finally{$("runOcr").disabled=false}};
$("copyOcr").onclick=async()=>{try{await navigator.clipboard.writeText($("ocrText").value);toast("تم النسخ")}catch(_){$("ocrText").select();document.execCommand("copy")}};
$("saveOcr").onclick=()=>downloadText($("ocrText").value,"SYNEX-OCR.txt");
}
function downloadText(value,name){const a=document.createElement("a"),u=URL.createObjectURL(new Blob([value],{type:"text/plain;charset=utf-8"}));a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),10000)}
function renderVoiceType(){
$("toolContent").innerHTML='<div class="tool-workspace"><span class="section-kicker">VOICE TYPE</span><h2>تحويل الكلام إلى نص</h2><div class="compress-panel"><div class="mode-switch"><button class="mode-btn active" id="voiceStart">● بدء التسجيل</button><button class="mode-btn" id="voiceStop" disabled>■ إيقاف</button></div><select id="voiceLang"><option value="ar-TN">العربية (تونس)</option><option value="ar-SA">العربية</option><option value="fr-FR">Français</option><option value="en-US">English</option></select><textarea id="voiceText" rows="10" placeholder="سيظهر الكلام هنا..."></textarea><div class="qr-actions"><button class="ghost-btn" id="copyVoice">نسخ</button><button class="ghost-btn" id="saveVoice">تنزيل TXT</button></div><p class="compression-note" id="voiceStatus">يتطلب متصفحاً يدعم Speech Recognition وإذن الميكروفون. قد تتم معالجة الصوت عبر خدمة المتصفح.</p></div></div>';
const SR=window.SpeechRecognition||window.webkitSpeechRecognition;let rec=null;
if(!SR){$("voiceStart").disabled=true;$("voiceStatus").textContent="هذا المتصفح لا يدعم التعرف على الكلام. جرّب Chrome أو Edge بإصدار حديث."}
else{rec=new SR();rec.continuous=true;rec.interimResults=true;rec.onresult=e=>{let final="";for(let i=e.resultIndex;i<e.results.length;i++)final+=e.results[i][0].transcript+(e.results[i].isFinal?" ":"");$("voiceText").value+=final};rec.onerror=e=>{$("voiceStatus").textContent="تعذر التسجيل: "+e.error};rec.onend=()=>{$("voiceStart").disabled=false;$("voiceStop").disabled=true};$("voiceStart").onclick=()=>{rec.lang=$("voiceLang").value;try{rec.start();$("voiceStart").disabled=true;$("voiceStop").disabled=false;$("voiceStatus").textContent="الميكروفون يعمل..."}catch(e){toast("تعذر بدء التسجيل")}};$("voiceStop").onclick=()=>rec.stop()}
$("copyVoice").onclick=async()=>{try{await navigator.clipboard.writeText($("voiceText").value);toast("تم النسخ")}catch(_){$("voiceText").select();document.execCommand("copy")}};
$("saveVoice").onclick=()=>downloadText($("voiceText").value,"SYNEX-Voice.txt");
}
const HISTORY_KEY="synex-compression-history-v1";
function retentionCleanup(){const keys=["synex-compression-history-v1","synex-global-history"];const age=(isSignedIn?120:2)*86400000;keys.forEach(k=>{try{const a=JSON.parse(localStorage.getItem(k)||"[]"),now=Date.now();const keep=a.filter(x=>{const t=Date.parse(x.date||"");return !Number.isFinite(t)||now-t<age});localStorage.setItem(k,JSON.stringify(keep))}catch(_){}})}
retentionCleanup();
function getHistory(){try{return JSON.parse(localStorage.getItem(HISTORY_KEY)||"[]")}catch(_){return[]}}
function saveHistory(item){const h=getHistory();h.unshift(item);localStorage.setItem(HISTORY_KEY,JSON.stringify(h.slice(0,25)))}
function renderHistory(){const h=getHistory(),el=$("historyList");if(!el)return;if(!h.length){el.innerHTML='<p class="compression-note">لا توجد عمليات سابقة بعد.</p>';return}el.innerHTML=h.map(x=>'<div class="history-row"><div><b></b><small></small></div><strong></strong></div>').join("");[...el.children].forEach((node,i)=>{node.children[0].children[0].textContent=h[i].name;node.children[0].children[1].textContent=h[i].date+" • "+h[i].kind;node.children[1].textContent=h[i].result})}
function addHistory(name,kind,result){saveHistory({name,kind,result,date:new Date().toLocaleString()});recordActivity(name,kind);renderHistory()}
function formatBytes(n){if(!Number.isFinite(n))return"—";const u=["B","KB","MB","GB","TB"];let i=0;while(n>=1024&&i<u.length-1){n/=1024;i++}return n.toFixed(i?1:0)+" "+u[i]}
function suggestion(files){const f=files[0],ext=(f.name.split(".").pop()||"").toLowerCase(),already=["jpg","jpeg","png","webp","gif","mp4","mp3","zip","gz","pdf","7z","rar","avif"].includes(ext);if(already)return{level:1,label:"ضغط خفيف",reason:"هذا النوع مضغوط مسبقاً غالباً؛ الضغط القوي قد يستهلك وقتاً دون توفير واضح."};if(["txt","csv","json","xml","html","js","css","svg","log"].includes(ext))return{level:9,label:"أقصى ضغط",reason:"الملفات النصية غالباً تستفيد من الضغط الأقوى."};if(["docx","xlsx","pptx"].includes(ext))return{level:3,label:"ضغط خفيف",reason:"هذه الصيغ تحتوي ضغطاً داخلياً بالفعل."};return{level:6,label:"متوازن",reason:"اقتراح عام؛ يمكنك تغيير المستوى وتجربة النتيجة."}}
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
save.onclick=async()=>{try{const blob=await convertImage(file,$("imageExportFormat").value);downloadBlob(blob,outputImageName(file,$("imageExportFormat").value));recordActivity(file.name,"Image export");toast("تم تجهيز الصورة")}catch(e){toast("تعذر تحويل الصورة: "+e.message)}};
actions.append(view,save);meta.append(name,size,actions);card.append(img,meta);gallery.append(card);
});
$("imagePreviewPanel").classList.remove("hidden");
$("previewStage").classList.add("hidden");$("previewControls").classList.add("hidden");
$("downloadAllImages").onclick=async()=>{
const button=$("downloadAllImages");button.disabled=true;
try{if(!window.fflate)throw Error("مكتبة ZIP غير متاحة");const fmt=$("imageExportFormat").value,ext=fmt==="image/png"?"png":"jpg",entries={};
for(let i=0;i<images.length;i++){const blob=await convertImage(images[i],fmt);entries[outputImageName(images[i],fmt)]=new Uint8Array(await blob.arrayBuffer());}
const zipped=fflate.zipSync(entries,{level:0});downloadBlob(new Blob([zipped],{type:"application/zip"}),"SYNEX-Images-"+Date.now()+".zip");recordActivity(images.length+" images","ZIP image export");toast("تم تجهيز أرشيف الصور")}
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
const before=selected.reduce((a,f)=>a+f.size,0),after=resultBlob.size,ratio=(1-after/Math.max(before,1))*100;$("originalSize").textContent=formatBytes(before);$("compressedSize").textContent=formatBytes(after);$("savedPercent").textContent=(ratio>=0?ratio.toFixed(1)+"% توفير":Math.abs(ratio).toFixed(1)+"% زيادة");$("resultStats").classList.remove("hidden");$("downloadResult").classList.remove("hidden");$("runCompress").classList.add("hidden");$("progressStatus").textContent+=" الملف جاهز، راجع معاينة الصورة ثم اضغط تنزيل.";addHistory(resultName,mode==="single"?"GZIP":"ZIP",formatBytes(before)+" ← "+formatBytes(after));toast("تم تجهيز الملف. التنزيل بانتظار ضغط الزر.");
}catch(e){$("progressStatus").textContent="تعذر إكمال الضغط: "+e.message;toast(e.message);$("runCompress").disabled=false}
};
$("downloadResult").onclick=()=>{if(!resultBlob)return;const url=URL.createObjectURL(resultBlob),a=document.createElement("a");a.href=url;a.download=resultName;a.click();setTimeout(()=>URL.revokeObjectURL(url),60000);toast("بدأ تنزيل "+resultName)};
$("clearHistory").onclick=()=>{if(confirm("مسح سجل العمليات المحفوظ على هذا الجهاز؟")){localStorage.removeItem(HISTORY_KEY);renderHistory()}};
renderHistory();updateLevel();
}
function renderQrGenerator(){
$("toolContent").innerHTML=`<div class="tool-workspace"><span class="section-kicker">QR CODE CREATOR</span><h2>إنشاء رمز QR</h2><p>اكتب رابطاً أو نصاً، أو اختر ملفاً لإنشاء QR يحمل اسمه ومعلوماته. لإنشاء QR يفتح ملفاً للآخرين، يجب أن يكون الملف مرفوعاً على رابط يمكنهم الوصول إليه.</p><div class="compress-panel"><label>النص أو الرابط</label><textarea id="qrInput" rows="4" placeholder="https://example.com أو اكتب نصك هنا"></textarea><label class="file-drop" for="qrFile"><span class="drop-symbol">＋</span><strong>أو اختر ملفاً لإنشاء QR باسمه</strong><small>ملاحظة: QR لا يضمّن الملف نفسه؛ سيحمل اسمه فقط</small></label><input id="qrFile" type="file" class="hidden"><button class="primary-btn action-wide" id="makeQr">إنشاء QR</button><div id="qrOutput" class="qr-output hidden"><div id="qrCanvas"></div><button class="primary-btn" id="downloadQr">تنزيل صورة QR</button></div></div></div>`;
let qrText="";$("qrFile").onchange=()=>{const f=$("qrFile").files[0];if(f)$("qrInput").value="اسم الملف: "+f.name+" | الحجم: "+formatBytes(f.size)};
$("makeQr").onclick=()=>{qrText=$("qrInput").value.trim();if(!qrText){toast("اكتب نصاً أو رابطاً أولاً");return}if(!window.QRCode){toast("مكتبة QR لم تُحمّل؛ تحقق من الاتصال");return}$("qrCanvas").innerHTML="";$("qrOutput").classList.remove("hidden");new QRCode($("qrCanvas"),{text:qrText,width:280,height:280,colorDark:"#10152b",colorLight:"#ffffff",correctLevel:QRCode.CorrectLevel.H});};
$("downloadQr").onclick=()=>{const canvas=$("qrCanvas").querySelector("canvas"),img=$("qrCanvas").querySelector("img");const url=canvas?canvas.toDataURL("image/png"):img&&img.src;if(!url)return;const a=document.createElement("a");a.href=url;a.download="SYNEX-QR.png";a.click()};
}
function renderQrReader(){
$("toolContent").innerHTML=`<div class="tool-workspace"><span class="section-kicker">QR IMAGE SCANNER</span><h2>افتح QR من صورة</h2><p>ارفع صورة محفوظة في هاتفك أو الكمبيوتر. سيقرأ SYNEX رمز QR ويعرض النص أو الرابط.</p><div class="compress-panel"><label class="file-drop" for="qrImage"><span class="drop-symbol">▦</span><strong>اختر صورة تحتوي على QR</strong><small>PNG أو JPG أو WebP</small></label><input id="qrImage" type="file" accept="image/*" class="hidden"><div class="qr-preview hidden" id="qrPreview"><img id="qrImagePreview" alt="معاينة الصورة"></div><div class="qr-result hidden" id="qrResult"><b>محتوى رمز QR</b><textarea id="qrText" readonly rows="4"></textarea><div class="qr-actions"><button class="primary-btn" id="copyQr">نسخ المحتوى</button><a class="ghost-btn hidden" id="openQr" target="_blank" rel="noopener">فتح الرابط</a></div></div><p class="compression-note" id="qrStatus">إذا كان QR يحتوي رابط تنزيل، افتح الرابط للوصول إلى الملف. لا يمكن استرجاع ملف لا يحتوي الرمز على رابط له.</p></div></div>`;
$("qrImage").onchange=()=>{const f=$("qrImage").files[0];if(!f)return;const im=new Image(),url=URL.createObjectURL(f);im.onload=()=>{$("qrPreview").classList.remove("hidden");$("qrImagePreview").src=url;const c=document.createElement("canvas"),ctx=c.getContext("2d",{willReadFrequently:true}),s=Math.min(1,1800/Math.max(im.naturalWidth,im.naturalHeight));c.width=Math.round(im.naturalWidth*s);c.height=Math.round(im.naturalHeight*s);ctx.drawImage(im,0,0,c.width,c.height);const d=ctx.getImageData(0,0,c.width,c.height),code=window.jsQR&&jsQR(d.data,d.width,d.height,{inversionAttempts:"attemptBoth"});if(!code){$("qrStatus").textContent="لم نعثر على QR واضح. جرّب صورة أوضح.";return}$("qrResult").classList.remove("hidden");$("qrText").value=code.data;const link=$("openQr");if(/^https?:\/\//i.test(code.data)){link.href=code.data;link.classList.remove("hidden")}else link.classList.add("hidden");$("qrStatus").textContent="تمت قراءة الرمز بنجاح.";URL.revokeObjectURL(url)};im.onerror=()=>{$("qrStatus").textContent="تعذر فتح الصورة"};im.src=url};
$("copyQr").onclick=async()=>{try{await navigator.clipboard.writeText($("qrText").value);toast("تم النسخ")}catch(_){$("qrText").select();document.execCommand("copy")}}
}
$("backHome").onclick=showHome;
$("accountButton").onclick=async()=>{if(supabaseClient&&confirm("هل تريد تسجيل الخروج؟")){const{error}=await supabaseClient.auth.signOut();if(!error)location.reload()}};
window.addEventListener("online",()=>toast("عاد الاتصال بالإنترنت"));window.addEventListener("offline",()=>toast("أنت غير متصل بالإنترنت"));
if("serviceWorker"in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
})();
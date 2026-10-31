(() => {
const $=id=>document.getElementById(id), dialog=$("loginDialog"), toastEl=$("toast");
let toastTimer,isGuest=false,isSignedIn=false,supabaseClient=null;
function toast(m){toastEl.textContent=m;toastEl.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>toastEl.classList.remove("show"),3000)}
const cfg=window.SYNEX_CONFIG||{};
if(window.supabase&&cfg.supabaseUrl&&cfg.supabaseAnonKey){supabaseClient=window.supabase.createClient(cfg.supabaseUrl,cfg.supabaseAnonKey);supabaseClient.auth.getSession().then(({data})=>{if(data.session)showSignedIn(data.session.user)})}
function showSignedIn(user){isSignedIn=true;isGuest=false;dialog.close();$("openLogin").classList.add("hidden");$("accountButton").classList.remove("hidden");$("accountButton").textContent=(user.email||"S").slice(0,1).toUpperCase();toast("تم تسجيل الدخول بنجاح")}
function openLogin(){$("authHint").classList.toggle("hidden",!!supabaseClient);dialog.showModal()}
$("openLogin").addEventListener("click",openLogin);
$("startNow").addEventListener("click",()=>{if(!isGuest&&!isSignedIn)openLogin();else $("tools").scrollIntoView({behavior:"smooth"})});
function continueAsGuest(){isGuest=true;$("guestWarning").classList.remove("hidden");dialog.close();$("tools").scrollIntoView({behavior:"smooth"});toast("تتابع كزائر — لن تُحفظ ملفاتك ومعلوماتك")}
$("guestSkip").addEventListener("click",continueAsGuest);$("dialogSkip").addEventListener("click",continueAsGuest);
$("googleSignIn").addEventListener("click",async()=>{if(!supabaseClient){$("authHint").classList.remove("hidden");toast("تسجيل Google يحتاج إعداد Supabase OAuth أولاً");return}const {error}=await supabaseClient.auth.signInWithOAuth({provider:"google",options:{redirectTo:location.origin+location.pathname}});if(error)toast("تعذر بدء تسجيل الدخول: "+error.message)});
$("themeToggle").addEventListener("click",()=>{document.body.classList.toggle("light");localStorage.setItem("synex-theme",document.body.classList.contains("light")?"light":"dark")});
if(localStorage.getItem("synex-theme")==="light")document.body.classList.add("light");
const info={quickdrop:["QuickDrop","نقل الملفات","نقل الملفات بين الأجهزة يحتاج إلى خدمة نقل واتصال مخصصة."],screentext:["ScreenText","استخراج النصوص والتصميم","استخراج النصوص من الصور وتحريرها قيد التطوير."],voicetype:["VoiceType","تحويل الصوت إلى نص","تحويل الكلام والتسجيلات إلى نص قيد التطوير."]};
document.querySelectorAll("[data-tool]").forEach(btn=>btn.addEventListener("click",()=>{
if(!isGuest&&!isSignedIn){openLogin();return}
$("tools").classList.add("hidden");document.querySelector(".hero").classList.add("hidden");$("workspace").classList.remove("hidden");
if(btn.dataset.tool==="compressor")renderCompressor();else if(btn.dataset.tool==="qrreader")renderQrReader();else if(btn.dataset.tool==="qrgenerator")renderQrGenerator();else{$("toolContent").innerHTML='<div class="placeholder-panel"><span class="section-kicker">SYNEX WORKSPACE</span><h2></h2><p></p><p class="section-hint">هذه الأداة قيد التطوير.</p></div>';$("toolContent").querySelector("h2").textContent=info[btn.dataset.tool][0]+" — "+info[btn.dataset.tool][1];$("toolContent").querySelector("p").textContent=info[btn.dataset.tool][2]}
window.scrollTo({top:0,behavior:"smooth"})
}));
const HISTORY_KEY="synex-compression-history-v1";
function getHistory(){try{return JSON.parse(localStorage.getItem(HISTORY_KEY)||"[]")}catch(_){return[]}}
function saveHistory(item){const h=getHistory();h.unshift(item);localStorage.setItem(HISTORY_KEY,JSON.stringify(h.slice(0,25)))}
function renderHistory(){const h=getHistory(),el=$("historyList");if(!el)return;if(!h.length){el.innerHTML='<p class="compression-note">لا توجد عمليات سابقة بعد.</p>';return}el.innerHTML=h.map(x=>'<div class="history-row"><div><b></b><small></small></div><strong></strong></div>').join("");[...el.children].forEach((node,i)=>{node.children[0].children[0].textContent=h[i].name;node.children[0].children[1].textContent=h[i].date+" • "+h[i].kind;node.children[1].textContent=h[i].result})}
function addHistory(name,kind,result){saveHistory({name,kind,result,date:new Date().toLocaleString()});renderHistory()}
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
<div id="imagePreviewPanel" class="image-preview-panel hidden"><div class="preview-heading"><b>معاينة الصورة قبل التنزيل</b><small>حرّك عجلة الفأرة للتكبير والتصغير • اسحب الصورة للتحريك</small></div><div class="preview-stage" id="previewStage"><img id="previewImage" alt="معاينة الصورة الأصلية داخل الأرشيف"></div><div class="preview-controls"><button class="ghost-btn" id="zoomOut">−</button><span id="zoomLabel">100%</span><button class="ghost-btn" id="zoomIn">＋</button><button class="ghost-btn" id="zoomReset">إعادة</button></div><p class="compression-note">هذه معاينة للصورة الأصلية التي ستوضع داخل ZIP؛ لم يتم تعديل أبعادها أو جودتها.</p></div>
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
function showImagePreview(files){const img=files.find(f=>f.type.startsWith("image/"));if(!img){$("imagePreviewPanel").classList.add("hidden");return}const url=URL.createObjectURL(img);$("previewImage").src=url;$("imagePreviewPanel").classList.remove("hidden");zoom=1;applyZoom()}
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
$("backHome").onclick=()=>{$("workspace").classList.add("hidden");$("tools").classList.remove("hidden");document.querySelector(".hero").classList.remove("hidden");window.scrollTo({top:0,behavior:"smooth"})};
$("accountButton").onclick=async()=>{if(supabaseClient&&confirm("هل تريد تسجيل الخروج؟")){const{error}=await supabaseClient.auth.signOut();if(!error)location.reload()}};
window.addEventListener("online",()=>toast("عاد الاتصال بالإنترنت"));window.addEventListener("offline",()=>toast("أنت غير متصل بالإنترنت"));
if("serviceWorker"in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
})();
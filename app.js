(() => {
  const $ = (id) => document.getElementById(id);
  const dialog = $("loginDialog"), toastEl = $("toast");
  let toastTimer, isGuest = false, isSignedIn = false, supabaseClient = null;
  function toast(message) {
    toastEl.textContent = message; toastEl.classList.add("show");
    clearTimeout(toastTimer); toastTimer = setTimeout(() => toastEl.classList.remove("show"), 3000);
  }
  const config = window.SYNEX_CONFIG || {};
  if (window.supabase && config.supabaseUrl && config.supabaseAnonKey) {
    supabaseClient = window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey);
    supabaseClient.auth.getSession().then(({data}) => { if (data.session) showSignedIn(data.session.user); });
  }
  function showSignedIn(user) {
    isSignedIn = true; isGuest = false; dialog.close();
    $("openLogin").classList.add("hidden"); $("accountButton").classList.remove("hidden");
    $("accountButton").textContent = (user.email || "S").slice(0,1).toUpperCase(); toast("تم تسجيل الدخول بنجاح");
  }
  function openLogin() { $("authHint").classList.toggle("hidden", !!supabaseClient); dialog.showModal(); }
  $("openLogin").addEventListener("click", openLogin);
  $("startNow").addEventListener("click", () => {
    if (!isGuest && !isSignedIn) openLogin(); else $("tools").scrollIntoView({behavior:"smooth"});
  });
  function continueAsGuest() {
    isGuest = true; $("guestWarning").classList.remove("hidden"); dialog.close();
    $("tools").scrollIntoView({behavior:"smooth"}); toast("تتابع كزائر — لن تُحفظ ملفاتك ومعلوماتك");
  }
  $("guestSkip").addEventListener("click", continueAsGuest);
  $("dialogSkip").addEventListener("click", continueAsGuest);
  $("googleSignIn").addEventListener("click", async () => {
    if (!supabaseClient) { $("authHint").classList.remove("hidden"); toast("تسجيل Google يحتاج إعداد Supabase OAuth أولاً"); return; }
    const {error} = await supabaseClient.auth.signInWithOAuth({provider:"google",options:{redirectTo:location.origin + location.pathname}});
    if (error) toast("تعذر بدء تسجيل الدخول: " + error.message);
  });
  $("themeToggle").addEventListener("click", () => {
    document.body.classList.toggle("light");
    localStorage.setItem("synex-theme", document.body.classList.contains("light") ? "light" : "dark");
  });
  if (localStorage.getItem("synex-theme") === "light") document.body.classList.add("light");

  const toolInfo = {
    quickdrop:["QuickDrop","نقل الملفات","نقل الملفات بين الأجهزة يحتاج إلى خدمة نقل واتصال مخصصة؛ واجهة النقل ما زالت قيد التطوير."],
    screentext:["ScreenText","استخراج النصوص والتصميم","ستتمكن هنا من رفع صورة واستخراج النص منها ثم تحريره وتصميمه وتصديره."],
    voicetype:["VoiceType","تحويل الصوت إلى نص","ستتمكن هنا من استخدام الميكروفون أو رفع ملف صوتي وتحويله إلى نص."],
    compressor:["File Compressor","ضغط وفك ضغط الملفات","ضغط GZIP بمستويات قابلة للاختيار وفك الضغط دون فقدان البيانات."],
    qrreader:["QR Image Reader","قراءة QR من صورة","اختر صورة من جهازك ليقرأ SYNEX رمز QR الموجود فيها."]
  };
  document.querySelectorAll("[data-tool]").forEach(button => button.addEventListener("click", () => {
    if (!isGuest && !isSignedIn) { openLogin(); return; }
    $("tools").classList.add("hidden"); document.querySelector(".hero").classList.add("hidden");
    $("workspace").classList.remove("hidden");
    if (button.dataset.tool === "compressor") renderCompressor();
    else if (button.dataset.tool === "qrreader") renderQrReader();
    else {
      const info = toolInfo[button.dataset.tool];
      $("toolContent").innerHTML = '<div class="placeholder-panel"><span class="section-kicker">SYNEX WORKSPACE</span><h2></h2><p></p><p class="section-hint">هذه واجهة أولية؛ وظائف هذه الأداة قيد التطوير.</p></div>';
      $("toolContent").querySelector("h2").textContent = info[0] + " — " + info[1];
      $("toolContent").querySelector("p").textContent = info[2];
    }
    window.scrollTo({top:0,behavior:"smooth"});
  }));

  function renderCompressor() {
    $("toolContent").innerHTML = `
      <div class="tool-workspace">
        <span class="section-kicker">LOSSLESS FILE TOOLS</span><h2>ضغط الملفات والتحكم بالمستوى</h2>
        <p>اختر مستوى الضغط المناسب. المستوى الأعلى قد ينتج ملفاً أصغر لكنه يحتاج وقتاً أطول. لا يوجد ضمان لنصف الحجم؛ النتيجة تعتمد على نوع الملف.</p>
        <div class="compress-panel">
          <div class="mode-switch"><button class="mode-btn active" id="compressMode">ضغط ملف</button><button class="mode-btn" id="decompressMode">فك الضغط</button></div>
          <label class="file-drop" for="compressFile"><span class="drop-symbol">＋</span><strong id="filePrompt">اختر الملف من جهازك</strong><small id="fileSub">يتم إنشاء نسخة GZIP ولا يتغير الأصل</small></label>
          <input id="compressFile" type="file" class="hidden">
          <div class="picked-file hidden" id="pickedFile"></div>
          <div id="levelBox" class="level-box">
            <div class="level-head"><label for="compressionLevel">مستوى الضغط</label><strong id="levelValue">6 / 9 — متوازن</strong></div>
            <input id="compressionLevel" class="compression-slider" type="range" min="1" max="9" step="1" value="6">
            <div class="level-ends"><span>أسرع وأخف على الجهاز</span><span>ضغط أقوى وأبطأ</span></div>
          </div>
          <div class="result-stats hidden" id="resultStats"><div><small>الحجم الأصلي</small><b id="originalSize">—</b></div><div><small>بعد الضغط</small><b id="compressedSize">—</b></div><div><small>التوفير</small><b id="savedPercent">—</b></div></div>
          <button class="primary-btn action-wide" id="runCompression" disabled>ابدأ الضغط</button>
          <div class="progress-wrap hidden" id="compressionProgress"><div class="progress-track"><span id="compressionBar"></span></div><small id="compressionStatus">جارٍ التحضير...</small></div>
          <p class="compression-note">الضغط GZIP دون فقدان الجودة أو البيانات. الصور JPG والفيديو MP4 والملفات المضغوطة قد لا تصغر كثيراً. اختر تنزيل الملف بعد انتهاء المعالجة.</p>
        </div>
        <div class="info-grid"><div><b>خصوصية</b><span>المعالجة تتم محلياً على جهازك.</span></div><div><b>الأصل محفوظ</b><span>يتم إنشاء ملف جديد دون تعديل الأصل.</span></div><div><b>ملفات كبيرة</b><span>الحفظ المتدفق يتطلب متصفحاً يدعم اختيار مكان الحفظ.</span></div></div>
      </div>`;
    let mode="compress", selected=null, busy=false;
    const input=$("compressFile"), action=$("runCompression"), picker=$("pickedFile"), slider=$("compressionLevel");
    function updateLevel() {
      const n=Number(slider.value), names={1:"سريع",2:"سريع",3:"خفيف",4:"خفيف",5:"متوازن",6:"متوازن",7:"قوي",8:"قوي",9:"أقصى ضغط"};
      $("levelValue").textContent=n+" / 9 — "+names[n];
    }
    slider.addEventListener("input",updateLevel);
    function setMode(next) {
      mode=next; $("compressMode").classList.toggle("active",mode==="compress");
      $("decompressMode").classList.toggle("active",mode==="decompress");
      $("filePrompt").textContent=mode==="compress"?"اختر الملف من جهازك":"اختر ملف GZIP";
      $("fileSub").textContent=mode==="compress"?"سيتم إنشاء نسخة .gz دون تغيير الأصل":"سيتم فك ضغط نسخة .gz إلى ملفها";
      $("levelBox").classList.toggle("hidden",mode!=="compress");
      action.textContent=mode==="compress"?"ابدأ الضغط":"ابدأ فك الضغط";
      input.value=""; selected=null; picker.classList.add("hidden"); action.disabled=true;
      $("resultStats").classList.add("hidden");
    }
    $("compressMode").addEventListener("click",()=>setMode("compress"));
    $("decompressMode").addEventListener("click",()=>setMode("decompress"));
    input.addEventListener("change",()=>{
      selected=input.files&&input.files[0]||null; if(!selected)return;
      picker.textContent=selected.name+" • "+formatBytes(selected.size); picker.classList.remove("hidden");
      action.disabled=false; $("resultStats").classList.add("hidden");
    });
    action.addEventListener("click",async()=>{
      if(!selected||busy)return;
      if(mode==="compress"&&!window.fflate){toast("تعذر تحميل مكتبة الضغط. تحقق من الاتصال ثم أعد المحاولة.");return;}
      if(mode==="decompress"&&!("DecompressionStream" in window)){toast("متصفحك لا يدعم فك الضغط. جرّب Chrome أو Edge حديثاً.");return;}
      busy=true; action.disabled=true; $("compressionProgress").classList.remove("hidden");
      $("compressionBar").style.width="0%"; $("compressionStatus").textContent="جارٍ تجهيز الملف...";
      try {
        if(mode==="compress") {
          const result=await gzipFile(selected,Number(slider.value),(done,total)=> {
            const pct=total?Math.min(99,Math.round(done/total*100)):0;
            $("compressionBar").style.width=pct+"%"; $("compressionStatus").textContent="تمت قراءة "+formatBytes(done)+" من "+formatBytes(total);
          });
          $("originalSize").textContent=formatBytes(selected.size);
          $("compressedSize").textContent=formatBytes(result.size);
          const saved=selected.size?((1-result.size/selected.size)*100):0;
          $("savedPercent").textContent=(saved>0?saved.toFixed(1)+"% توفير":Math.abs(saved).toFixed(1)+"% زيادة");
          $("resultStats").classList.remove("hidden");
          await downloadBlobOrSave(result.blob,selected.name+".gz");
        } else {
          const stream=selected.stream().pipeThrough(new DecompressionStream("gzip"));
          const name=selected.name.replace(/\.gz$/i,"")||"decompressed-file";
          const blob=await streamToBlob(stream,selected.size,(done)=> {
            $("compressionBar").style.width="50%"; $("compressionStatus").textContent="تم فك "+formatBytes(done);
          });
          await downloadBlobOrSave(blob,name);
        }
        $("compressionBar").style.width="100%"; $("compressionStatus").textContent="اكتملت العملية. تم تجهيز التنزيل.";
        toast("اكتملت العملية — تم تنزيل الملف");
      } catch(error) {
        $("compressionStatus").textContent="لم تكتمل العملية: "+(error&&error.message||"خطأ غير معروف");
        toast("تعذرت المعالجة أو حفظ الملف");
      } finally {busy=false;action.disabled=!selected;}
    });
    updateLevel();
  }

  async function gzipFile(file,level,onProgress) {
    let handle=null, writable=null, chunks=[], outputSize=0, chain=Promise.resolve();
    if("showSaveFilePicker" in window) {
      handle=await window.showSaveFilePicker({suggestedName:file.name+".gz"});
      writable=await handle.createWritable();
    } else if(file.size>80*1024*1024) {
      throw new Error("لحماية ذاكرة الجهاز، ضغط الملفات الأكبر من 80MB يحتاج Chrome أو Edge على الكمبيوتر مع اختيار مكان الحفظ.");
    }
    const gzip=new fflate.Gzip({level},(err,data,final)=>{
      if(err) throw err;
      if(data&&data.length) {
        outputSize+=data.length;
        if(writable) chain=chain.then(()=>writable.write(data));
        else chunks.push(data);
      }
    });
    const reader=file.stream().getReader(); let read=0;
    try {
      while(true) {
        const part=await reader.read(); if(part.done)break;
        read+=part.value.byteLength; gzip.push(part.value,false); onProgress(read,file.size);
      }
      gzip.push(new Uint8Array(0),true);
      if(writable) {await chain; await writable.close();}
    } catch(error) {
      try {if(writable)await writable.abort();}catch(_){}
      throw error;
    }
    const blob=writable?null:new Blob(chunks,{type:"application/gzip"});
    if(writable) return {size:outputSize,blob:null};
    return {size:blob.size,blob};
  }
  async function streamToBlob(stream,sourceSize,onProgress) {
    if(sourceSize>80*1024*1024) throw new Error("فك ضغط الملفات الكبيرة يحتاج حالياً إلى حفظ متدفق في متصفح يدعم ذلك.");
    const reader=stream.getReader(), chunks=[]; let total=0;
    while(true){const part=await reader.read();if(part.done)break;chunks.push(part.value);total+=part.value.byteLength;onProgress(total);}
    return new Blob(chunks);
  }
  async function downloadBlobOrSave(blob,filename) {
    if(!blob) return;
    const url=URL.createObjectURL(blob), a=document.createElement("a");
    a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),60000);
  }
  function renderQrReader() {
    $("toolContent").innerHTML=`
      <div class="tool-workspace"><span class="section-kicker">QR IMAGE SCANNER</span><h2>افتح QR من صورة</h2>
      <p>ارفع صورة محفوظة في هاتفك أو الكمبيوتر. سيقرأ SYNEX رمز QR ويعرض النص أو الرابط أو بياناته.</p>
      <div class="compress-panel">
        <label class="file-drop" for="qrImage"><span class="drop-symbol">▦</span><strong>اختر صورة تحتوي على QR</strong><small>PNG أو JPG أو WebP</small></label>
        <input id="qrImage" type="file" accept="image/*" class="hidden">
        <div class="qr-preview hidden" id="qrPreview"><img id="qrImagePreview" alt="معاينة الصورة المختارة"></div>
        <div class="qr-result hidden" id="qrResult"><b>محتوى رمز QR</b><textarea id="qrText" readonly rows="4"></textarea><div class="qr-actions"><button class="primary-btn" id="copyQr">نسخ المحتوى</button><a class="ghost-btn hidden" id="openQr" target="_blank" rel="noopener">فتح الرابط</a></div></div>
        <p class="compression-note" id="qrStatus">إذا كان QR يحتوي رابط تنزيل، افتح الرابط للوصول إلى الملف. لا يمكن استخراج ملف غير موجود داخل بيانات الرمز أو رابطه.</p>
      </div></div>`;
    $("qrImage").addEventListener("change",async()=>{
      const file=$("qrImage").files&&$("qrImage").files[0];if(!file)return;
      const image=new Image(), url=URL.createObjectURL(file);
      image.onload=()=>{
        $("qrPreview").classList.remove("hidden");$("qrImagePreview").src=url;
        const canvas=document.createElement("canvas"),ctx=canvas.getContext("2d",{willReadFrequently:true});
        const scale=Math.min(1,1600/Math.max(image.naturalWidth,image.naturalHeight));
        canvas.width=Math.max(1,Math.round(image.naturalWidth*scale));canvas.height=Math.max(1,Math.round(image.naturalHeight*scale));
        ctx.drawImage(image,0,0,canvas.width,canvas.height);
        const pixels=ctx.getImageData(0,0,canvas.width,canvas.height);
        const code=window.jsQR?jsQR(pixels.data,pixels.width,pixels.height,{inversionAttempts:"attemptBoth"}):null;
        if(!code){$("qrStatus").textContent="لم نعثر على QR واضح. جرّب صورة أوضح واجعل الرمز كاملاً داخل الصورة.";return;}
        $("qrResult").classList.remove("hidden");$("qrText").value=code.data;
        const link=$("openQr");
        if(/^https?:\/\//i.test(code.data)){link.href=code.data;link.classList.remove("hidden");}
        else link.classList.add("hidden");
        $("qrStatus").textContent="تمت قراءة الرمز بنجاح.";
        URL.revokeObjectURL(url);
      };
      image.onerror=()=>{$("qrStatus").textContent="تعذر فتح الصورة."};
      image.src=url;
    });
    $("copyQr").addEventListener("click",async()=>{
      try{await navigator.clipboard.writeText($("qrText").value);toast("تم نسخ محتوى QR");}
      catch(_){$("qrText").select();document.execCommand("copy");toast("تم نسخ المحتوى");}
    });
  }
  function formatBytes(bytes) {
    if(!Number.isFinite(bytes))return "";
    const units=["B","KB","MB","GB"];let value=bytes,unit=0;
    while(value>=1024&&unit<units.length-1){value/=1024;unit++;}
    return value.toFixed(unit?1:0)+" "+units[unit];
  }
  $("backHome").addEventListener("click",()=>{
    $("workspace").classList.add("hidden");$("tools").classList.remove("hidden");
    document.querySelector(".hero").classList.remove("hidden");window.scrollTo({top:0,behavior:"smooth"});
  });
  $("accountButton").addEventListener("click",async()=>{
    if(supabaseClient&&confirm("هل تريد تسجيل الخروج؟")){const {error}=await supabaseClient.auth.signOut();if(!error)location.reload();}
  });
  window.addEventListener("online",()=>toast("عاد الاتصال بالإنترنت"));
  window.addEventListener("offline",()=>toast("أنت غير متصل بالإنترنت"));
  if("serviceWorker" in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
})();
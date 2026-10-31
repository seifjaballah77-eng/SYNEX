(() => {
  const $ = (id) => document.getElementById(id);
  const dialog = $("loginDialog");
  const toastEl = $("toast");
  let toastTimer;
  let isGuest = false;
  let isSignedIn = false;
  let supabaseClient = null;

  function toast(message) {
    toastEl.textContent = message;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2800);
  }

  const config = window.SYNEX_CONFIG || {};
  if (window.supabase && config.supabaseUrl && config.supabaseAnonKey) {
    supabaseClient = window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey);
    supabaseClient.auth.getSession().then(({ data }) => {
      if (data.session) showSignedIn(data.session.user);
    });
  }

  function showSignedIn(user) {
    isSignedIn = true;
    isGuest = false;
    dialog.close();
    $("openLogin").classList.add("hidden");
    $("accountButton").classList.remove("hidden");
    $("accountButton").textContent = (user.email || "S").slice(0,1).toUpperCase();
    toast("تم تسجيل الدخول بنجاح");
  }

  function openLogin() {
    $("authHint").classList.toggle("hidden", !!supabaseClient);
    dialog.showModal();
  }

  $("openLogin").addEventListener("click", openLogin);
  $("startNow").addEventListener("click", () => {
    if (!isGuest && !isSignedIn) openLogin();
    else $("tools").scrollIntoView({behavior:"smooth"});
  });
  function continueAsGuest() {
    isGuest = true;
    $("guestWarning").classList.remove("hidden");
    dialog.close();
    $("tools").scrollIntoView({behavior:"smooth"});
    toast("تتابع كزائر — لن تُحفظ ملفاتك ومعلوماتك");
  }
  $("guestSkip").addEventListener("click", continueAsGuest);
  $("dialogSkip").addEventListener("click", continueAsGuest);
  $("googleSignIn").addEventListener("click", async () => {
    if (!supabaseClient) {
      $("authHint").classList.remove("hidden");
      toast("تسجيل Google يحتاج إعداد Supabase OAuth أولاً");
      return;
    }
    const { error } = await supabaseClient.auth.signInWithOAuth({
      provider:"google",
      options:{redirectTo:window.location.origin + window.location.pathname}
    });
    if (error) toast("تعذر بدء تسجيل الدخول: " + error.message);
  });
  $("themeToggle").addEventListener("click", () => {
    document.body.classList.toggle("light");
    localStorage.setItem("synex-theme", document.body.classList.contains("light") ? "light" : "dark");
  });
  if (localStorage.getItem("synex-theme") === "light") document.body.classList.add("light");

  const tools = {
    quickdrop: ["QuickDrop","نقل الملفات","ستكون هذه المساحة مخصصة لإرسال واستقبال الملفات مع عرض التقدم والحجم والسرعة. دعم الملفات الكبيرة يحتاج إلى خدمة نقل وتخزين مخصصة."],
    screentext: ["ScreenText","استخراج النصوص والتصميم","ستتمكن هنا من رفع صورة واستخراج النص منها ثم تحريره وتصميمه وتصديره."],
    voicetype: ["VoiceType","تحويل الصوت إلى نص","ستتمكن هنا من استخدام الميكروفون أو رفع ملف صوتي وتحويله إلى نص."],
    compressor: ["File Compressor","ضغط وفك ضغط الملفات","ضغط GZIP وفكّه دون فقدان البيانات أو تغيير الجودة."]
  };
  document.querySelectorAll("[data-tool]").forEach(button => {
    button.addEventListener("click", () => {
      if (!isGuest && !isSignedIn) { openLogin(); return; }
      const tool = tools[button.dataset.tool];
      $("tools").classList.add("hidden");
      document.querySelector(".hero").classList.add("hidden");
      $("workspace").classList.remove("hidden");
      if (button.dataset.tool === "compressor") {
        renderCompressor();
      } else {
        $("toolContent").innerHTML = '<div class="placeholder-panel"><span class="section-kicker">SYNEX WORKSPACE</span><h2></h2><p></p><p class="section-hint">هذه واجهة أولية؛ وظائف هذه الأداة قيد التطوير.</p></div>';
        $("toolContent").querySelector("h2").textContent = tool[0] + " — " + tool[1];
        $("toolContent").querySelector("p").textContent = tool[2];
      }
      window.scrollTo({top:0,behavior:"smooth"});
    });
  });

  function renderCompressor() {
    $("toolContent").innerHTML = `
      <div class="tool-workspace">
        <span class="section-kicker">LOSSLESS FILE TOOLS</span>
        <h2>ضغط الملفات دون فقدان الجودة</h2>
        <p>اختر ملفاً لضغطه بصيغة GZIP أو فك ضغط ملف GZIP. لا يتم تعديل الملف الأصلي.</p>
        <div class="compress-panel">
          <div class="mode-switch">
            <button class="mode-btn active" id="compressMode">ضغط ملف</button>
            <button class="mode-btn" id="decompressMode">فك الضغط</button>
          </div>
          <label class="file-drop" for="compressFile"><span class="drop-symbol">＋</span><strong id="filePrompt">اختر الملف من جهازك</strong><small id="fileSub">يمكنك اختيار ملف واحد في كل مرة</small></label>
          <input id="compressFile" type="file" class="hidden">
          <div class="picked-file hidden" id="pickedFile"></div>
          <button class="primary-btn action-wide" id="runCompression" disabled>ابدأ الضغط</button>
          <div class="progress-wrap hidden" id="compressionProgress"><div class="progress-track"><span id="compressionBar"></span></div><small id="compressionStatus">جارٍ التحضير...</small></div>
          <p class="compression-note">ضغط GZIP لا يفقد البيانات. بعض الصور والفيديوهات والملفات المضغوطة مسبقاً قد لا ينخفض حجمها كثيراً.</p>
        </div>
        <div class="info-grid"><div><b>خصوصية</b><span>تتم المعالجة على جهازك في المتصفح.</span></div><div><b>الأصل محفوظ</b><span>يتم إنشاء نسخة مضغوطة جديدة.</span></div><div><b>ملفات كبيرة</b><span>الحفظ المباشر إلى القرص يعتمد على دعم متصفحك.</span></div></div>
      </div>`;
    let mode = "compress";
    let selected = null;
    const fileInput = $("compressFile");
    const action = $("runCompression");
    const picker = $("pickedFile");
    function setMode(next) {
      mode = next;
      $("compressMode").classList.toggle("active", mode === "compress");
      $("decompressMode").classList.toggle("active", mode === "decompress");
      $("filePrompt").textContent = mode === "compress" ? "اختر الملف من جهازك" : "اختر ملف GZIP";
      $("fileSub").textContent = mode === "compress" ? "سيتم إنشاء نسخة .gz دون تغيير الأصل" : "سيتم فك ضغط نسخة .gz إلى ملفها";
      action.textContent = mode === "compress" ? "ابدأ الضغط" : "ابدأ فك الضغط";
      fileInput.value = "";
      selected = null;
      picker.classList.add("hidden");
      action.disabled = true;
    }
    $("compressMode").addEventListener("click", () => setMode("compress"));
    $("decompressMode").addEventListener("click", () => setMode("decompress"));
    fileInput.addEventListener("change", () => {
      selected = fileInput.files && fileInput.files[0] || null;
      if (!selected) return;
      picker.textContent = selected.name + " • " + formatBytes(selected.size);
      picker.classList.remove("hidden");
      action.disabled = false;
    });
    action.addEventListener("click", async () => {
      if (!selected) return;
      if (!(mode === "compress" ? "CompressionStream" in window : "DecompressionStream" in window)) {
        toast("متصفحك لا يدعم هذه العملية. جرّب Chrome أو Edge حديثاً.");
        return;
      }
      action.disabled = true;
      $("compressionProgress").classList.remove("hidden");
      $("compressionBar").style.width = "0%";
      $("compressionStatus").textContent = "جارٍ المعالجة على جهازك...";
      try {
        const Constructor = mode === "compress" ? CompressionStream : DecompressionStream;
        const stream = selected.stream().pipeThrough(new Constructor("gzip"));
        const outName = mode === "compress"
          ? (selected.name.endsWith(".gz") ? selected.name + ".gz" : selected.name + ".gz")
          : selected.name.replace(/\.gz$/i, "") || "decompressed-file";
        await saveStream(stream, outName, selected.size, (written) => {
          const percent = selected.size ? Math.min(99, Math.round(written / selected.size * 100)) : 0;
          $("compressionBar").style.width = percent + "%";
          $("compressionStatus").textContent = "تمت معالجة " + formatBytes(written);
        });
        $("compressionBar").style.width = "100%";
        $("compressionStatus").textContent = "اكتملت العملية — تم حفظ الملف الجديد.";
        toast("اكتملت العملية بنجاح");
      } catch (error) {
        $("compressionStatus").textContent = "لم تكتمل العملية: " + (error && error.message || "خطأ غير معروف");
        toast("تعذرت المعالجة أو حفظ الملف");
      } finally {
        action.disabled = false;
      }
    });
  }

  async function saveStream(readable, filename, sourceSize, onProgress) {
    if ("showSaveFilePicker" in window) {
      const handle = await window.showSaveFilePicker({ suggestedName: filename });
      const writable = await handle.createWritable();
      const reader = readable.getReader();
      let written = 0;
      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          await writable.write(value);
          written += value.byteLength;
          onProgress(written);
        }
        await writable.close();
      } catch (error) {
        await writable.abort();
        throw error;
      }
      return;
    }
    if (sourceSize > 80 * 1024 * 1024) {
      throw new Error("لحماية ذاكرة الهاتف، استخدم Chrome أو Edge على الكمبيوتر للحفظ المتدفق للملفات الكبيرة.");
    }
    const response = new Response(readable);
    const blob = await response.blob();
    onProgress(blob.size);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  }

  function formatBytes(bytes) {
    if (!Number.isFinite(bytes)) return "";
    const units = ["B","KB","MB","GB"];
    let value = bytes, unit = 0;
    while (value >= 1024 && unit < units.length - 1) { value /= 1024; unit++; }
    return value.toFixed(unit ? 1 : 0) + " " + units[unit];
  }
\n  $("backHome").addEventListener("click", () => {
    $("workspace").classList.add("hidden");
    $("tools").classList.remove("hidden");
    document.querySelector(".hero").classList.remove("hidden");
    window.scrollTo({top:0,behavior:"smooth"});
  });
  $("accountButton").addEventListener("click", async () => {
    if (supabaseClient && confirm("هل تريد تسجيل الخروج؟")) {
      const { error } = await supabaseClient.auth.signOut();
      if (!error) location.reload();
    }
  });
  window.addEventListener("online", () => toast("عاد الاتصال بالإنترنت"));
  window.addEventListener("offline", () => toast("أنت غير متصل بالإنترنت"));
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(() => {}));
  }
})();
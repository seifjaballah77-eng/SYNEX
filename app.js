(() => {
  const $ = (id) => document.getElementById(id);
  const dialog = $("loginDialog");
  const toastEl = $("toast");
  let toastTimer;
  let isGuest = false;
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
    if (!isGuest && !supabaseClient) openLogin();
    else $("tools").scrollIntoView({behavior:"smooth"});
  });
  $("guestSkip").addEventListener("click", () => {
    isGuest = true;
    $("guestWarning").classList.remove("hidden");
    dialog.close();
    $("tools").scrollIntoView({behavior:"smooth"});
    toast("تتابع كزائر — لن تُحفظ ملفاتك ومعلوماتك");
  });
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
    voicetype: ["VoiceType","تحويل الصوت إلى نص","ستتمكن هنا من استخدام الميكروفون أو رفع ملف صوتي وتحويله إلى نص."]
  };
  document.querySelectorAll("[data-tool]").forEach(button => {
    button.addEventListener("click", () => {
      const tool = tools[button.dataset.tool];
      $("tools").classList.add("hidden");
      $("hero")?.classList.add("hidden");
      document.querySelector(".hero").classList.add("hidden");
      $("workspace").classList.remove("hidden");
      $("toolContent").innerHTML = '<div class="placeholder-panel"><span class="section-kicker">SYNEX WORKSPACE</span><h2></h2><p></p><p class="section-hint">هذه واجهة تأسيسية؛ لم يتم تفعيل وظائف المعالجة والنقل بعد.</p></div>';
      $("toolContent").querySelector("h2").textContent = tool[0] + " — " + tool[1];
      $("toolContent").querySelector("p").textContent = tool[2];
      window.scrollTo({top:0,behavior:"smooth"});
    });
  });
  $("backHome").addEventListener("click", () => {
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
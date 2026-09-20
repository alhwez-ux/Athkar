(function () {
  const data = window.HISN_DATA;
  const homeView = document.getElementById("homeView");
  const otherView = document.getElementById("otherView");
  const dhikrView = document.getElementById("dhikrView");
  const otherList = document.getElementById("otherList");
  const dhikrText = document.getElementById("dhikrText");
  const dhikrNote = document.getElementById("dhikrNote");
  const dhikrIndexBadge = document.getElementById("dhikrIndexBadge");
  const remainingCount = document.getElementById("remainingCount");
  const nextBtn = document.getElementById("nextBtn");
  const dhikrTitle = document.getElementById("dhikrTitle");

  let currentList = [];
  let currentIndex = 0;
  let currentRemainingCount = 0;
  let returnTarget = "home";

  function hideAll() {
    [homeView, otherView, dhikrView].forEach((el) => {
      el.classList.add("hidden");
      el.classList.remove("center-active", "center-exit");
    });
  }

  function showView(el) {
    hideAll();
    el.classList.remove("hidden", "center-enter", "center-exit");
    el.classList.add("center-active");
    window.scrollTo(0, 0);
  }

  function animateTo(fromEl, toEl, after) {
    fromEl.classList.remove("center-active");
    fromEl.classList.add("center-exit");
    setTimeout(() => {
      fromEl.classList.add("hidden");
      fromEl.classList.remove("center-exit");
      if (after) after();
      toEl.classList.remove("hidden");
      toEl.classList.remove("center-exit");
      toEl.classList.add("center-enter");
      requestAnimationFrame(() => {
        setTimeout(() => {
          toEl.classList.remove("center-enter");
          toEl.classList.add("center-active");
        }, 30);
      });
      window.scrollTo(0, 0);
    }, 320);
  }

  function loadDhikrData(index) {
    const item = currentList[index];
    dhikrText.textContent = item.text;
    dhikrNote.textContent = item.note;
    dhikrIndexBadge.textContent = `${index + 1} / ${currentList.length}`;
    currentRemainingCount = item.count;
    remainingCount.textContent = currentRemainingCount;
    nextBtn.textContent = index === currentList.length - 1 ? "ختام الأذكار" : "التالي";
  }

  window.selectSection = function (type) {
    const section = data[type];
    if (!section || !section.items.length) return;
    currentList = section.items;
    currentIndex = 0;
    returnTarget = "home";
    dhikrTitle.textContent = section.title;
    animateTo(homeView, dhikrView, () => loadDhikrData(0));
  };

  window.openOthers = function () {
    animateTo(homeView, otherView);
  };

  window.backToHome = function () {
    const from = otherView.classList.contains("hidden") ? dhikrView : otherView;
    animateTo(from, homeView);
  };

  window.backFromDhikr = function () {
    const target = returnTarget === "others" ? otherView : homeView;
    animateTo(dhikrView, target);
  };

  window.openOtherChapter = function (id) {
    const chapter = data.others.find((ch) => ch.id === id);
    if (!chapter || !chapter.items.length) return;
    currentList = chapter.items;
    currentIndex = 0;
    returnTarget = "others";
    dhikrTitle.textContent = chapter.title;
    animateTo(otherView, dhikrView, () => loadDhikrData(0));
  };

  window.registerRepeat = function () {
    if (currentRemainingCount > 1) {
      currentRemainingCount -= 1;
      remainingCount.textContent = currentRemainingCount;
    } else {
      remainingCount.textContent = "0 (تم)";
    }
  };

  window.nextDhikr = function () {
    if (currentIndex < currentList.length - 1) {
      dhikrView.classList.remove("center-active");
      dhikrView.classList.add("center-exit");
      setTimeout(() => {
        currentIndex += 1;
        loadDhikrData(currentIndex);
        dhikrView.classList.remove("center-exit");
        dhikrView.classList.add("center-enter");
        setTimeout(() => {
          dhikrView.classList.remove("center-enter");
          dhikrView.classList.add("center-active");
        }, 40);
      }, 320);
    } else {
      window.backFromDhikr();
    }
  };

  function renderOtherList() {
    otherList.innerHTML = data.others
      .map(
        (ch) => `
      <button type="button" class="menu-btn" onclick="openOtherChapter('${ch.id}')">
        <span class="menu-btn-title">${ch.number}- ${ch.title}</span>
        <span class="menu-btn-count">${ch.items.length}</span>
      </button>`
      )
      .join("");
  }

  const installBtn = document.getElementById("installBtn");
  const installSheet = document.getElementById("installSheet");
  const installSheetText = document.getElementById("installSheetText");
  const toast = document.getElementById("toast");
  let toastTimer = 0;

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.remove("hidden");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.add("hidden"), 2800);
  }

  function refreshInstallButton() {
    const pwa = window.athkarPwa;
    if (!installBtn || !pwa) return;
    installBtn.classList.toggle("hidden", pwa.isInstalled());
  }

  window.installApp = async function () {
    const pwa = window.athkarPwa;
    if (!pwa) return;
    if (pwa.canInstall()) {
      const accepted = await pwa.install();
      refreshInstallButton();
      showToast(accepted ? "تم تثبيت التطبيق على الجهاز" : "يمكنك التثبيت لاحقاً من نفس الزر");
      return;
    }
    if (installSheet && installSheetText) {
      installSheetText.textContent = pwa.isIos()
        ? "في سفاري: اضغط مشاركة ثم «إضافة إلى الشاشة الرئيسية» لتثبيت التطبيق."
        : "من شريط العنوان اختر أيقونة التثبيت أو قائمة المتصفح ثم «تثبيت التطبيق».";
      installSheet.classList.remove("hidden");
    }
  };

  window.closeInstallSheet = function () {
    if (installSheet) installSheet.classList.add("hidden");
  };

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  }

  window.addEventListener("athkar-install-available", refreshInstallButton);
  window.addEventListener("athkar-installed", () => {
    refreshInstallButton();
    showToast("تم تثبيت التطبيق على الجهاز");
  });

  window.addEventListener("DOMContentLoaded", () => {
    renderOtherList();
    applyTheme(getPreferredTheme());
    refreshInstallButton();
    const hour = new Date().getHours();
    const morningBadge = document.getElementById("morningBadge");
    const eveningBadge = document.getElementById("eveningBadge");
    const morningBtn = document.getElementById("morningBtn");
    const eveningBtn = document.getElementById("eveningBtn");
    const timeSuggestion = document.getElementById("timeSuggestion");

    if (hour >= 4 && hour < 12) {
      timeSuggestion.textContent = "الآن وقت أذكار الصباح";
      morningBtn.classList.add("is-suggested");
      morningBadge.classList.remove("hidden");
    } else if (hour >= 15 && hour < 24) {
      timeSuggestion.textContent = "الآن وقت أذكار المساء";
      eveningBtn.classList.add("is-suggested");
      eveningBadge.classList.remove("hidden");
    } else {
      timeSuggestion.textContent = "اختر الورد الذي ترغب بقراءته";
    }
  });

  function getPreferredTheme() {
    const saved = localStorage.getItem("athkar-theme");
    if (saved === "light" || saved === "dark") return saved;
    const hour = new Date().getHours();
    return hour >= 6 && hour < 18 ? "light" : "dark";
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    document.querySelectorAll(".theme-day").forEach((btn) => {
      btn.classList.toggle("is-on", theme === "light");
    });
    document.querySelectorAll(".theme-night").forEach((btn) => {
      btn.classList.toggle("is-on", theme === "dark");
    });
  }

  window.setTheme = function (theme) {
    localStorage.setItem("athkar-theme", theme);
    applyTheme(theme);
  };
})();

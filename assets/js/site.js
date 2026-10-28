/* TAMANG Nepal — local product tools and on-request Instagram embeds; no checkout. */
(() => {
  "use strict";
  const $ = (q, root = document) => root.querySelector(q),
    $$ = (q, root = document) => [...root.querySelectorAll(q)];
  let products = [];
  try {
    products = JSON.parse($("#product-data")?.textContent || "[]");
  } catch {}
  const bySlug = new Map(products.map((p) => [p.slug, p]));
  const key = "tamang-saved-v2";
  let saved = [];
  try {
    const raw = JSON.parse(localStorage.getItem(key) || "[]");
    if (Array.isArray(raw))
      saved = [
        ...new Set(raw.filter((s) => typeof s === "string" && bySlug.has(s))),
      ].slice(0, 30);
  } catch {}
  let toastTimer;
  const notify = (text) => {
    const el = $("#toast");
    if (!el) return;
    el.textContent = text;
    el.classList.add("visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("visible"), 2600);
  };
  function renderSaved() {
    $$("[data-saved-count]").forEach((el) => (el.textContent = saved.length));
    $$("[data-save]").forEach((el) => {
      const active = saved.includes(el.dataset.save);
      el.setAttribute("aria-pressed", String(active));
      const p = bySlug.get(el.dataset.save);
      if (el.classList.contains("save-piece")) {
        el.textContent = active ? "✓" : "＋";
        el.setAttribute(
          "aria-label",
          `${active ? "Remove" : "Save"} ${p?.title || "piece"}${active ? " from saved pieces" : ""}`,
        );
      } else el.textContent = active ? "Piece saved ✓" : "Save piece ＋";
    });
    const list = $("#saved-items");
    if (!list) return;
    list.replaceChildren();
    $("#saved-empty").hidden = saved.length > 0;
    saved.forEach((slug) => {
      const p = bySlug.get(slug);
      if (!p) return;
      const row = document.createElement("div");
      row.className = "saved-item";
      const img = document.createElement("img");
      img.src = p.image;
      img.alt = "";
      img.width = 90;
      img.height = 90;
      const a = document.createElement("a");
      a.href = p.url;
      a.textContent = p.title + " ↗";
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = "Remove ×";
      b.setAttribute("aria-label", "Remove " + p.title + " from saved pieces");
      b.addEventListener("click", () => {
        saved = saved.filter((s) => s !== slug);
        persist();
        const next = $(".saved-item button");
        if (next) next.focus();
        else {
          $("#saved-title").setAttribute("tabindex", "-1");
          $("#saved-title").focus();
        }
        notify("Piece removed");
      });
      row.append(img, a, b);
      list.append(row);
    });
  }
  function persist() {
    try {
      localStorage.setItem(key, JSON.stringify(saved));
    } catch {}
    renderSaved();
  }
  $$("[data-save]").forEach((el) =>
    el.addEventListener("click", () => {
      const slug = el.dataset.save;
      if (!bySlug.has(slug)) return;
      const active = saved.includes(slug);
      saved = active ? saved.filter((s) => s !== slug) : [...saved, slug];
      persist();
      notify(
        active
          ? "Piece removed from your saved pieces"
          : "Piece saved for your enquiry",
      );
    }),
  );
  renderSaved();
  window.addEventListener("storage", (e) => {
    if (e.key !== key) return;
    try {
      const v = JSON.parse(e.newValue || "[]");
      saved = Array.isArray(v)
        ? [...new Set(v.filter((s) => bySlug.has(s)))]
        : [];
    } catch {
      saved = [];
    }
    renderSaved();
  });
  const menu = $(".menu-toggle"),
    menuDialog = $("#mobile-menu");
  if (menu && menuDialog) {
    const background = [
      $(".site-header"),
      $("#main"),
      $(".site-footer"),
    ].filter(Boolean);
    let returnFocus,
      previousInert = [],
      fallback = false;
    const finishClose = () => {
      document.body.classList.remove("menu-open");
      menu.setAttribute("aria-expanded", "false");
      previousInert.forEach(([element, value]) => {
        element.inert = value;
      });
      previousInert = [];
      (returnFocus?.isConnected ? returnFocus : menu).focus();
    };
    const closeMenu = () => {
      if (!menuDialog.hasAttribute("open")) return;
      if (!fallback) menuDialog.close();
      else {
        menuDialog.removeAttribute("open");
        finishClose();
      }
    };
    menu.addEventListener("click", () => {
      if (menuDialog.hasAttribute("open")) return;
      returnFocus = document.activeElement;
      previousInert = background.map((element) => [
        element,
        Boolean(element.inert),
      ]);
      background.forEach((element) => {
        element.inert = true;
      });
      document.body.classList.add("menu-open");
      menu.setAttribute("aria-expanded", "true");
      fallback = typeof menuDialog.showModal !== "function";
      if (fallback) menuDialog.setAttribute("open", "");
      else menuDialog.showModal();
      $("#close-menu").focus();
    });
    $("#close-menu").addEventListener("click", closeMenu);
    menuDialog.addEventListener("close", finishClose);
    menuDialog.addEventListener("cancel", (event) => {
      event.preventDefault();
      closeMenu();
    });
    menuDialog.addEventListener("click", (event) => {
      if (event.target.closest("a")) closeMenu();
    });
    document.addEventListener("keydown", (event) => {
      if (!menuDialog.hasAttribute("open")) return;
      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu();
      }
      if (fallback && event.key === "Tab") {
        const controls = $$("a[href], button:not([disabled])", menuDialog);
        const first = controls[0],
          last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    });
    const desktop = window.matchMedia?.("(min-width: 801px)");
    desktop?.addEventListener?.("change", (event) => {
      if (event.matches) closeMenu();
    });
  }
  const productRail = $("#home-product-rail");
  if (productRail) {
    const railButtons = $$("[data-rail-direction]");
    const syncRail = () => {
      const max = Math.max(
        0,
        productRail.scrollWidth - productRail.clientWidth,
      );
      railButtons.forEach((button) => {
        button.disabled =
          Number(button.dataset.railDirection) < 0
            ? productRail.scrollLeft <= 1
            : productRail.scrollLeft >= max - 1;
      });
    };
    railButtons.forEach((button) =>
      button.addEventListener("click", () => {
        const left =
          Number(button.dataset.railDirection) *
          Math.max(240, productRail.clientWidth * 0.82);
        if (typeof productRail.scrollBy === "function")
          productRail.scrollBy({
            left,
            behavior: window.matchMedia?.("(prefers-reduced-motion: reduce)")
              .matches
              ? "auto"
              : "smooth",
          });
        else {
          productRail.scrollLeft += left;
          syncRail();
        }
      }),
    );
    productRail.addEventListener("scroll", syncRail, { passive: true });
    window.addEventListener("resize", syncRail);
    syncRail();
  }
  // The homepage material room has its own keyboard-accessible photographic exhibits.
  const originTabs = $$("[data-origin]");
  if (originTabs.length) {
    function selectOrigin(tab, focus = false) {
      originTabs.forEach((button) => {
        const active = button === tab;
        button.setAttribute("aria-selected", String(active));
        button.tabIndex = active ? 0 : -1;
        const panel = document.getElementById(
          button.getAttribute("aria-controls"),
        );
        if (panel) panel.hidden = !active;
      });
      if (focus) tab.focus();
    }
    originTabs.forEach((tab, index) => {
      tab.addEventListener("click", () => selectOrigin(tab));
      tab.addEventListener("keydown", (event) => {
        let next;
        if (event.key === "ArrowDown" || event.key === "ArrowRight")
          next = (index + 1) % originTabs.length;
        if (event.key === "ArrowUp" || event.key === "ArrowLeft")
          next = (index + originTabs.length - 1) % originTabs.length;
        if (event.key === "Home") next = 0;
        if (event.key === "End") next = originTabs.length - 1;
        if (next !== undefined) {
          event.preventDefault();
          selectOrigin(originTabs[next], true);
        }
      });
    });
  }
  const noteFilters = $$("[data-note-filter]");
  if (noteFilters.length) {
    noteFilters.forEach((button) =>
      button.addEventListener("click", () => {
        let count = 0;
        $$("[data-note-card]").forEach((card) => {
          card.hidden =
            button.dataset.noteFilter !== "All" &&
            card.dataset.category !== button.dataset.noteFilter;
          if (!card.hidden) count++;
        });
        noteFilters.forEach((filter) =>
          filter.setAttribute("aria-pressed", String(filter === button)),
        );
        $("#note-count").textContent =
          `${count} ${count === 1 ? "note" : "notes"} to explore.`;
      }),
    );
  }
  const params = new URLSearchParams(location.search);
  if ($("#collection-search")) {
    const cards = $$("[data-product-card]"),
      filters = $$("[data-filter]"),
      search = $("#collection-search"),
      sort = $("#collection-sort"),
      canvas = $(".collection-canvas");
    let category = "All";
    function apply(update = true) {
      let visible = cards.filter(
        (c) =>
          (category === "All" || c.dataset.category === category) &&
          c.dataset.title.includes(search.value.trim().toLowerCase()),
      );
      cards.forEach((c) => (c.hidden = !visible.includes(c)));
      const ordered = [...cards].sort((a, b) =>
        sort.value === "name"
          ? a.dataset.title.localeCompare(b.dataset.title)
          : Number(a.dataset.number) - Number(b.dataset.number),
      );
      ordered.forEach((c) => canvas.insertBefore(c, $("#empty-results")));
      filters.forEach((b) =>
        b.setAttribute("aria-pressed", String(b.dataset.filter === category)),
      );
      const rows = $$("[data-product-row]");
      rows.forEach(
        (row) =>
          (row.hidden = !visible.some(
            (card) => card.dataset.title === row.dataset.title,
          )),
      );
      const matrix = $("#collection-matrix");
      if (matrix) matrix.hidden = visible.length === 0;
      const matrixBody = $("#collection-matrix-body");
      if (matrixBody)
        ordered.forEach((card) => {
          const row = rows.find(
            (row) => row.dataset.title === card.dataset.title,
          );
          if (row) matrixBody.append(row);
        });
      $("#empty-results").hidden = visible.length !== 0;
      $("#result-count").textContent =
        `${visible.length} ${visible.length === 1 ? "piece" : "pieces"} to explore.`;
      canvas.classList.toggle(
        "filtered",
        category !== "All" || !!search.value.trim(),
      );
      if (update) {
        const p = new URLSearchParams(location.search);
        category === "All" ? p.delete("category") : p.set("category", category);
        search.value.trim() ? p.set("q", search.value.trim()) : p.delete("q");
        sort.value === "number" ? p.delete("sort") : p.set("sort", sort.value);
        const qs = p.toString();
        history.replaceState(
          null,
          "",
          location.pathname + (qs ? "?" + qs : ""),
        );
      }
    }
    function fromURL() {
      const p = new URLSearchParams(location.search),
        requested = p.get("category");
      category = filters.some((b) => b.dataset.filter === requested)
        ? requested
        : "All";
      search.value = p.get("q") || "";
      sort.value = p.get("sort") === "name" ? "name" : "number";
      apply(false);
    }
    filters.forEach((b) =>
      b.addEventListener("click", () => {
        category = b.dataset.filter;
        apply();
      }),
    );
    search.addEventListener("input", () => apply());
    sort.addEventListener("change", () => apply());
    $("#reset-filters")?.addEventListener("click", () => {
      category = "All";
      search.value = "";
      sort.value = "number";
      apply();
      search.focus();
    });
    window.addEventListener("popstate", fromURL);
    fromURL();
  }
  const gallery = $("#zoom-image"),
    dialog = $("#image-dialog");
  if (gallery && dialog) {
    let previousFocus;
    const open = () => {
      previousFocus = document.activeElement;
      if (typeof dialog.showModal === "function") dialog.showModal();
      else dialog.setAttribute("open", "");
      $("#close-image").focus();
    };
    const close = () => {
      if (typeof dialog.close === "function") dialog.close();
      else {
        dialog.removeAttribute("open");
        previousFocus?.focus();
      }
    };
    gallery.addEventListener("click", open);
    $("#zoom-link")?.addEventListener("click", open);
    $("#close-image").addEventListener("click", close);
    dialog.addEventListener("close", () => previousFocus?.focus());
    dialog.addEventListener("click", (e) => {
      if (e.target !== dialog) return;
      const b = dialog.getBoundingClientRect();
      if (
        e.clientX < b.left ||
        e.clientX > b.right ||
        e.clientY < b.top ||
        e.clientY > b.bottom
      )
        close();
    });
    $$("[data-view]").forEach((b) =>
      b.addEventListener("click", () => {
        gallery.classList.toggle("detail", b.dataset.view === "detail");
        $$("[data-view]").forEach((v) =>
          v.setAttribute("aria-pressed", String(v === b)),
        );
      }),
    );
  }
  if ($("#process-image")) {
    const image = $("#process-image");
    const stages = [
      [
        "Collect & prepare",
        "A different beginning.",
        "Discarded plastic is collected, cleaned and sorted. Its next use begins with care for what is already here.",
        "originImage",
        "Illustrative recovered polythene bags and prepared strips",
        1536,
        1024,
      ],
      [
        "Crochet by hand",
        "One strip at a time.",
        "Cleaned plastic is cut into strips and crocheted by hand, without heat, into a flexible material.",
        "makingImage",
        "Hands crocheting recovered plastic in a TAMANG photograph",
        690,
        397,
      ],
      [
        "Pair with dyed cloth",
        "Two material stories.",
        "Separately, purchased fabric is dyed with natural materials by a collaborator. The fabric is combined with handworked material where the piece calls for it.",
        "fabricImage",
        "Illustrative naturally dyed cloth with botanical marks",
        1536,
        1024,
      ],
      [
        "Make the piece",
        "Useful, all over again.",
        "In the Laptop Cover, naturally dyed fabric and hand-crocheted recovered plastic come together. Local women cut and stitch the finished piece. Other products have different constructions.",
        "pieceImage",
        "Cream botanical TAMANG Laptop Cover with a flap, two buttons and string closure",
        1080,
        1080,
      ],
    ];
    let stage = 0;
    function show(i) {
      stage = Math.max(0, Math.min(stages.length - 1, i));
      const s = stages[stage];
      $("#process-number").textContent = `0${stage + 1} / ${s[0]}`;
      $("#process-title").textContent = s[1];
      $("#process-description").textContent = s[2];
      image.src = image.dataset[s[3]];
      image.alt = s[4];
      image.width = s[5];
      image.height = s[6];
      $("#process-position").textContent = `0${stage + 1} / 04`;
      $("#process-prev").disabled = stage === 0;
      $("#process-next").disabled = stage === 3;
      $$("[data-stage]").forEach((b) =>
        b.setAttribute(
          "aria-pressed",
          String(Number(b.dataset.stage) === stage),
        ),
      );
    }
    $("#process-prev").addEventListener("click", () => show(stage - 1));
    $("#process-next").addEventListener("click", () => show(stage + 1));
    $$("[data-stage]").forEach((b) =>
      b.addEventListener("click", () => show(Number(b.dataset.stage))),
    );
    show(0);
    const tabs = $$("[data-material]");
    function select(tab, focus = false, update = true) {
      tabs.forEach((t) => {
        const active = t === tab;
        t.setAttribute("aria-selected", String(active));
        t.tabIndex = active ? 0 : -1;
        $("#" + t.getAttribute("aria-controls")).hidden = !active;
      });
      if (focus) tab.focus();
      if (update) {
        const p = new URLSearchParams(location.search);
        p.set("material", tab.dataset.material);
        history.replaceState(null, "", location.pathname + "?" + p.toString());
      }
    }
    tabs.forEach((tab, i) => {
      tab.addEventListener("click", () => select(tab));
      tab.addEventListener("keydown", (e) => {
        let n = i;
        if (e.key === "ArrowRight") n = (i + 1) % tabs.length;
        else if (e.key === "ArrowLeft") n = (i - 1 + tabs.length) % tabs.length;
        else if (e.key === "Home") n = 0;
        else if (e.key === "End") n = tabs.length - 1;
        else return;
        e.preventDefault();
        select(tabs[n], true);
      });
    });
    select(
      tabs.find((t) => t.dataset.material === params.get("material")) ||
        tabs[0],
      false,
      false,
    );
  }
  $("#clear-local-data")?.addEventListener("click", () => {
    saved = [];
    persist();
    notify("Saved pieces cleared");
  });
  const form = $("#enquiry-form");
  if (form) {
    const piece = params.get("piece");
    if (bySlug.has(piece)) $("#enquiry-piece").value = piece;
    const interest = params.get("interest");
    if (["product", "materials", "collaboration", "other"].includes(interest))
      $("#enquiry-interest").value = interest;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!form.reportValidity()) return;
      const chosen = bySlug.get($("#enquiry-piece").value),
        selected = [...new Set([...saved, ...(chosen ? [chosen.slug] : [])])];
      const interestText =
        $("#enquiry-interest").selectedOptions[0].textContent;
      const lines = [
        "TAMANG Nepal — enquiry",
        "",
        `Name: ${$("#enquiry-name").value.trim()}`,
        `Email: ${$("#enquiry-email").value.trim()}`,
        `Interested in: ${interestText}`,
        "",
      ];
      if (selected.length)
        lines.push(
          "Pieces:",
          ...selected.map((s) => "• " + bySlug.get(s).title),
          "",
        );
      lines.push(
        $("#enquiry-message").value.trim(),
        "",
        "Please confirm available colours, dimensions, pricing and delivery.",
      );
      $("#enquiry-draft").value = lines.join("\n");
      $("#enquiry-output").hidden = false;
      $("#copy-status").textContent =
        "Your note is ready. Nothing has been sent.";
      $("#draft-title").focus();
      $("#enquiry-output").scrollIntoView?.({
        behavior: window.matchMedia?.("(prefers-reduced-motion: reduce)")
          .matches
          ? "auto"
          : "smooth",
        block: "start",
      });
    });
    $("#copy-enquiry").addEventListener("click", async () => {
      const text = $("#enquiry-draft").value;
      try {
        if (!navigator.clipboard?.writeText)
          throw new Error("Clipboard unavailable");
        await navigator.clipboard.writeText(text);
        $("#copy-status").textContent =
          "Enquiry copied. Nothing has been sent.";
      } catch {
        $("#enquiry-draft").focus();
        $("#enquiry-draft").select();
        $("#copy-status").textContent =
          "Select and copy the note above. Nothing has been sent.";
      }
    });
    $("#download-enquiry").addEventListener("click", () => {
      const blob = new Blob([$("#enquiry-draft").value], {
          type: "text/plain;charset=utf-8",
        }),
        url = URL.createObjectURL(blob),
        a = document.createElement("a");
      a.href = url;
      a.download = "TAMANG-Nepal-enquiry.txt";
      document.body.append(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      $("#copy-status").textContent =
        "Enquiry downloaded. Nothing has been sent.";
    });
  }

  // Useful starters stay local until the visitor prepares their note.
  $$("[data-enquiry-prompt]").forEach((button) =>
    button.addEventListener("click", () => {
      const subject = button.dataset.enquiryPrompt;
      const starters = {
        product:
          "Could you confirm the dimensions, available colours and price of the piece I am interested in?",
        materials:
          "I would like to know more about the materials and construction of a particular piece.",
        collaboration:
          "I would like to discuss a collaboration. Here is the idea, quantity and timing I have in mind:",
      };
      const message = $("#enquiry-message");
      if (!message || !starters[subject]) return;
      $("#enquiry-interest").value = subject;
      if (!message.value.includes(starters[subject]))
        message.value = message.value.trim()
          ? message.value.trim() + "\n\n" + starters[subject]
          : starters[subject];
      message.focus();
    }),
  );
  // Real post previews work without third-party scripts. Native embeds load on request.
  const socialDialog = $("#instagram-dialog");
  if (socialDialog) {
    let posts = [];
    try {
      posts = JSON.parse($("#instagram-data").textContent);
    } catch {}
    let loadPromise, returnFocus, observer;
    const ensureInstagram = () => {
      if (window.instgrm?.Embeds?.process) return Promise.resolve();
      if (loadPromise) return loadPromise;
      loadPromise = new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "https://www.instagram.com/embed.js";
        script.async = true;
        const fail = () => {
          clearTimeout(timeout);
          script.remove();
          loadPromise = null;
          reject(new Error("Instagram unavailable"));
        };
        const timeout = setTimeout(fail, 12000);
        script.onload = () => {
          clearTimeout(timeout);
          resolve();
        };
        script.onerror = fail;
        document.head.append(script);
      });
      return loadPromise;
    };
    const cleanup = () => {
      observer?.disconnect();
      $("#instagram-embed").replaceChildren();
      returnFocus?.focus();
    };
    const closeSocial = () => {
      if (typeof socialDialog.close === "function") socialDialog.close();
      else {
        socialDialog.removeAttribute("open");
        cleanup();
      }
    };
    $("#close-instagram").addEventListener("click", closeSocial);
    socialDialog.addEventListener("close", cleanup);
    socialDialog.addEventListener("click", (event) => {
      if (event.target !== socialDialog) return;
      const b = socialDialog.getBoundingClientRect();
      if (
        event.clientX < b.left ||
        event.clientX > b.right ||
        event.clientY < b.top ||
        event.clientY > b.bottom
      )
        closeSocial();
    });
    $$("[data-instagram-open]").forEach((button) =>
      button.addEventListener("click", async () => {
        const post = posts[Number(button.dataset.instagramOpen)];
        if (
          !post ||
          !/^https:\/\/www\.instagram\.com\/(p|reel)\/[A-Za-z0-9_-]+\/$/.test(
            post.url,
          )
        )
          return;
        returnFocus = button;
        const host = $("#instagram-embed");
        host.replaceChildren();
        const block = document.createElement("blockquote");
        block.className = "instagram-media";
        block.setAttribute("data-instgrm-permalink", post.url);
        block.setAttribute("data-instgrm-version", "14");
        const link = document.createElement("a");
        link.href = post.url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        const photo = document.createElement("img");
        photo.src = post.image;
        photo.alt = post.alt;
        link.append(photo);
        block.append(link);
        host.append(block);
        $("#instagram-original").href = post.url;
        $("#instagram-dialog-title").textContent = post.title;
        $("#instagram-status").textContent =
          "Loading the Instagram post. You can also open the original below.";
        if (typeof socialDialog.showModal === "function")
          socialDialog.showModal();
        else socialDialog.setAttribute("open", "");
        $("#close-instagram").focus();
        observer?.disconnect();
        observer = new MutationObserver(() => {
          if (host.querySelector("iframe"))
            $("#instagram-status").textContent =
              "If Instagram is unavailable here, open the original post below.";
        });
        observer.observe(host, { childList: true, subtree: true });
        try {
          await ensureInstagram();
          if (socialDialog.hasAttribute("open")) {
            if (!window.instgrm?.Embeds?.process)
              throw new Error("Instagram unavailable");
            window.instgrm.Embeds.process();
            $("#instagram-status").textContent =
              "If the post does not appear, open the original on Instagram below.";
          }
        } catch {
          if (socialDialog.hasAttribute("open"))
            $("#instagram-status").textContent =
              "Instagram could not load here. The photo preview and original post link are still available.";
        }
      }),
    );
  }
})();

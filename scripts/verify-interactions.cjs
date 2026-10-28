/* DOM integration checks. Run after a Jekyll build with jsdom available. */
const assert = require("node:assert/strict"),
  fs = require("node:fs"),
  path = require("node:path");
const { JSDOM } = require("jsdom");
const root = path.resolve(__dirname, "../dist"),
  script = fs.readFileSync(path.join(root, "assets/js/site.js"), "utf8");
const windows = [];
function load(route, storage, options = {}) {
  const url = new URL(route, "https://tamang.test");
  const file = url.pathname.endsWith("/")
    ? url.pathname + "index.html"
    : url.pathname;
  const dom = new JSDOM(fs.readFileSync(path.join(root, file), "utf8"), {
    url: url.href,
    runScripts: "outside-only",
    pretendToBeVisual: true,
  });
  const w = dom.window;
  windows.push(w);
  w.HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute("open", "");
  };
  w.HTMLDialogElement.prototype.close = function () {
    this.removeAttribute("open");
    this.dispatchEvent(new w.Event("close"));
  };
  if (options.withoutDialog) {
    w.HTMLDialogElement.prototype.showModal = undefined;
    w.HTMLDialogElement.prototype.close = undefined;
    w.Array.prototype.at = undefined;
  }
  w.HTMLElement.prototype.scrollIntoView = function () {};
  w.testMedia = new Map();
  w.matchMedia = (query) => {
    if (!w.testMedia.has(query)) {
      const listeners = [];
      w.testMedia.set(query, {
        matches: false,
        addEventListener: (event, listener) => listeners.push(listener),
        emit: (matches) =>
          listeners.forEach((listener) => listener({ matches })),
      });
    }
    return w.testMedia.get(query);
  };
  if (storage !== undefined) w.localStorage.setItem("tamang-saved-v2", storage);
  w.eval(script);
  return w;
}
function click(w, s) {
  const e = w.document.querySelector(s);
  assert(e, "Missing " + s);
  e.click();
  return e;
}
function input(w, s, v, event = "input") {
  const e = w.document.querySelector(s);
  assert(e, "Missing " + s);
  e.value = v;
  e.dispatchEvent(new w.Event(event, { bubbles: true }));
}
function visible(w) {
  return [...w.document.querySelectorAll("[data-product-card]")].filter(
    (e) => !e.hidden,
  );
}
(async () => {
  try {
    let w = load("/");
    for (const href of [
      "/collection/",
      "/materials/",
      "/story/",
      "/community/",
      "/enquire/",
    ])
      assert(w.document.querySelector(`#main-nav a[href="${href}"]`));
    // The homepage material room exposes one accurate origin at a time.
    const originTabs = [...w.document.querySelectorAll("[data-origin]")];
    assert.equal(originTabs.length, 4);
    const activeOrigins = () =>
      [...w.document.querySelectorAll(".origin-exhibit")].filter(
        (panel) => !panel.hidden,
      );
    assert.equal(activeOrigins().length, 1);
    for (const tab of originTabs) {
      tab.click();
      assert.equal(activeOrigins().length, 1);
      assert.equal(activeOrigins()[0].id, tab.getAttribute("aria-controls"));
      assert.equal(tab.getAttribute("aria-selected"), "true");
      assert.equal(originTabs.filter((item) => item.tabIndex === 0).length, 1);
      assert(
        activeOrigins()[0]
          .querySelector("a")
          .href.endsWith("?material=" + tab.dataset.origin),
      );
    }
    assert(activeOrigins()[0].textContent.includes("buy fabric"));
    originTabs[3].dispatchEvent(
      new w.KeyboardEvent("keydown", {
        key: "ArrowDown",
        bubbles: true,
        cancelable: true,
      }),
    );
    assert.equal(w.document.activeElement, originTabs[0]);
    originTabs[0].dispatchEvent(
      new w.KeyboardEvent("keydown", {
        key: "End",
        bubbles: true,
        cancelable: true,
      }),
    );
    assert.equal(w.document.activeElement, originTabs[3]);
    originTabs[3].dispatchEvent(
      new w.KeyboardEvent("keydown", {
        key: "Home",
        bubbles: true,
        cancelable: true,
      }),
    );
    assert.equal(w.document.activeElement, originTabs[0]);
    const menuTrigger = w.document.querySelector(".menu-toggle");
    const menuDialog = w.document.querySelector("#mobile-menu");
    menuTrigger.focus();
    click(w, ".menu-toggle");
    assert(menuDialog.hasAttribute("open"));
    assert.equal(menuTrigger.getAttribute("aria-controls"), "mobile-menu");
    assert.equal(menuTrigger.getAttribute("aria-expanded"), "true");
    assert.equal(w.document.activeElement.id, "close-menu");
    assert(w.document.body.classList.contains("menu-open"));
    assert.equal(w.document.querySelector("#main").inert, true);
    assert.equal(w.document.querySelectorAll(".mobile-nav a").length, 6);
    w.document.dispatchEvent(new w.KeyboardEvent("keydown", { key: "Escape" }));
    assert.equal(
      w.document.querySelector(".menu-toggle").getAttribute("aria-expanded"),
      "false",
    );
    assert(!menuDialog.hasAttribute("open"));
    assert(!w.document.body.classList.contains("menu-open"));
    assert.equal(w.document.querySelector("#main").inert, false);
    assert.equal(w.document.activeElement, menuTrigger);
    click(w, ".menu-toggle");
    click(w, "#close-menu");
    assert(!menuDialog.hasAttribute("open"));
    click(w, ".menu-toggle");
    menuDialog.dispatchEvent(new w.Event("cancel", { cancelable: true }));
    assert(!menuDialog.hasAttribute("open"));
    click(w, ".menu-toggle");
    const materialLink = w.document.querySelector(
      '.mobile-nav a[href="/materials/"]',
    );
    materialLink.addEventListener("click", (event) => event.preventDefault(), {
      once: true,
    });
    materialLink.click();
    assert(!menuDialog.hasAttribute("open"));
    click(w, ".menu-toggle");
    w.testMedia.get("(min-width: 801px)").emit(true);
    assert(!menuDialog.hasAttribute("open"));
    assert.equal(w.document.querySelector(".site-header").inert, false);
    const fallback = load("/", undefined, { withoutDialog: true });
    fallback.document.querySelector(".menu-toggle").focus();
    click(fallback, ".menu-toggle");
    const fallbackControls = [
      ...fallback.document.querySelectorAll(
        "#mobile-menu a[href], #mobile-menu button",
      ),
    ];
    fallbackControls[0].focus();
    fallback.document.dispatchEvent(
      new fallback.KeyboardEvent("keydown", {
        key: "Tab",
        shiftKey: true,
        cancelable: true,
      }),
    );
    assert.equal(fallback.document.activeElement, fallbackControls.at(-1));
    fallback.document.dispatchEvent(
      new fallback.KeyboardEvent("keydown", { key: "Tab", cancelable: true }),
    );
    assert.equal(fallback.document.activeElement, fallbackControls[0]);
    fallback.document.dispatchEvent(
      new fallback.KeyboardEvent("keydown", {
        key: "Escape",
        cancelable: true,
      }),
    );
    assert(
      !fallback.document.querySelector("#mobile-menu").hasAttribute("open"),
    );
    assert.equal(
      fallback.document.activeElement,
      fallback.document.querySelector(".menu-toggle"),
    );
    assert.equal(fallback.document.querySelector("#main").inert, false);
    const rail = w.document.querySelector("#home-product-rail");
    assert.equal(rail.querySelectorAll("[data-product-card]").length, 4);
    Object.defineProperty(rail, "clientWidth", {
      value: 600,
      configurable: true,
    });
    Object.defineProperty(rail, "scrollWidth", {
      value: 1800,
      configurable: true,
    });
    rail.scrollBy = ({ left }) => {
      rail.scrollLeft = Math.max(0, Math.min(1200, rail.scrollLeft + left));
      rail.dispatchEvent(new w.Event("scroll"));
    };
    w.dispatchEvent(new w.Event("resize"));
    assert(w.document.querySelector('[data-rail-direction="-1"]').disabled);
    assert(!w.document.querySelector('[data-rail-direction="1"]').disabled);
    click(w, '[data-rail-direction="1"]');
    assert(rail.scrollLeft > 0);
    assert(!w.document.querySelector('[data-rail-direction="-1"]').disabled);
    for (let i = 0; i < 4; i++) click(w, '[data-rail-direction="1"]');
    assert.equal(rail.scrollLeft, 1200);
    assert(w.document.querySelector('[data-rail-direction="1"]').disabled);
    click(w, '[data-rail-direction="-1"]');
    assert(rail.scrollLeft < 1200);
    rail.scrollLeft = 0;
    rail.dispatchEvent(new w.Event("scroll"));
    assert(w.document.querySelector('[data-rail-direction="-1"]').disabled);
    click(w, '[data-save="toiletries-bag"]');
    assert.equal(
      w.document.querySelector("[data-saved-count]").textContent,
      "1",
    );
    let storage = w.localStorage.getItem("tamang-saved-v2");
    w = load("/collection/");
    assert.equal(visible(w).length, 4);
    click(w, '[data-filter="Pouches"]');
    assert.equal(visible(w).length, 1);
    assert(new URL(w.location.href).searchParams.get("category") === "Pouches");
    input(w, "#collection-search", "toiletries");
    assert.equal(visible(w).length, 1);
    assert.equal(visible(w)[0].dataset.title, "toiletries bag");
    input(w, "#collection-search", "nothing matches");
    assert.equal(visible(w).length, 0);
    assert.equal(w.document.querySelector("#empty-results").hidden, false);
    click(w, "#reset-filters");
    assert.equal(visible(w).length, 4);
    input(w, "#collection-sort", "name", "change");
    assert.deepEqual(
      visible(w).map((e) => e.dataset.title),
      ["chalk bag", "laptop cover", "toiletries bag", "tote bag"],
    );
    w = load("/collection/?category=Climbing&q=chalk&sort=name");
    assert.equal(visible(w).length, 1);
    assert.equal(visible(w)[0].dataset.title, "chalk bag");
    w = load("/collection/?category=unknown");
    assert.equal(visible(w).length, 4);
    // Retired pieces must not reappear from old bookmarks or saved browser data.
    const retired = load(
      "/enquire/?piece=slipper-carrier",
      '["slipper-carrier","boxy-pouch"]',
    );
    assert.equal(retired.document.querySelector("#enquiry-piece").value, "");
    assert.equal(
      retired.document.querySelector("[data-saved-count]").textContent,
      "0",
    );
    assert(
      !retired.document
        .querySelector("#saved-items")
        .textContent.includes("Slipper Carrier"),
    );
    const retiredNotice = load("/pieces/slipper-carrier/");
    assert(
      retiredNotice.document
        .querySelector("h1")
        .textContent.includes("discontinued"),
    );
    assert(
      !retiredNotice.document.querySelector(
        "#zoom-image, [data-save], .product-enquiry",
      ),
    );
    assert(
      retiredNotice.document.querySelector('#main a[href="/collection/"]'),
    );
    const records = JSON.parse(
      retired.document.querySelector("#product-data").textContent,
    );
    assert.equal(records.length, 4);
    assert(!records.some((product) => product.slug === "slipper-carrier"));
    w = load("/pieces/toiletries-bag/", storage);
    assert.equal(
      w.document
        .querySelector('[data-save="toiletries-bag"]')
        .getAttribute("aria-pressed"),
      "true",
    );
    click(w, '[data-view="detail"]');
    assert(
      w.document.querySelector("#zoom-image").classList.contains("detail"),
    );
    click(w, '[data-view="whole"]');
    assert(
      !w.document.querySelector("#zoom-image").classList.contains("detail"),
    );
    click(w, "#zoom-image");
    assert(w.document.querySelector("#image-dialog").hasAttribute("open"));
    click(w, "#close-image");
    assert(!w.document.querySelector("#image-dialog").hasAttribute("open"));
    const enq = w.document
      .querySelector(".product-enquiry")
      .getAttribute("href");
    assert.equal(enq, "/enquire/?piece=toiletries-bag");
    // Every product route must inspect its actual photo and preselect the right enquiry.
    const productRecords = JSON.parse(
      w.document.querySelector("#product-data").textContent,
    );
    for (const product of productRecords) {
      const pieceWindow = load(product.url);
      assert(
        pieceWindow.document
          .querySelector("#gallery-image")
          .src.endsWith(product.image),
      );
      click(pieceWindow, '[data-view="detail"]');
      assert(
        pieceWindow.document
          .querySelector("#zoom-image")
          .classList.contains("detail"),
      );
      click(pieceWindow, "#zoom-link");
      assert(
        pieceWindow.document
          .querySelector("#image-dialog")
          .hasAttribute("open"),
      );
      assert(
        pieceWindow.document
          .querySelector("#image-dialog > img")
          .src.endsWith(product.image),
      );
      click(pieceWindow, "#close-image");
      click(pieceWindow, `[data-save="${product.slug}"]`);
      const noteURL = pieceWindow.document
        .querySelector(".product-enquiry")
        .getAttribute("href");
      const noteWindow = load(
        noteURL,
        pieceWindow.localStorage.getItem("tamang-saved-v2"),
      );
      assert.equal(
        noteWindow.document.querySelector("#enquiry-piece").value,
        product.slug,
      );
      assert(
        noteWindow.document
          .querySelector("#saved-items")
          .textContent.includes(product.title),
      );
    }
    w = load("/materials/?material=dyed");
    assert.equal(
      w.document.querySelector('[role="tab"][aria-selected="true"]').dataset
        .material,
      "dyed",
    );
    assert.equal(w.document.querySelector("#panel-dyed").hidden, false);
    assert(w.document.querySelector("#process-prev").disabled);
    for (let i = 1; i < 4; i++) click(w, "#process-next");
    assert.equal(
      w.document.querySelector("#process-position").textContent,
      "04 / 04",
    );
    assert(w.document.querySelector("#process-next").disabled);
    assert(
      w.document
        .querySelector("#process-image")
        .src.endsWith("/real-products/laptop-cover-original.jpg"),
    );
    assert(
      w.document
        .querySelector("#process-description")
        .textContent.includes("Laptop Cover"),
    );
    click(w, "#process-prev");
    assert.equal(
      w.document.querySelector("#process-position").textContent,
      "03 / 04",
    );
    click(w, '[data-stage="1"]');
    assert(
      w.document
        .querySelector("#process-description")
        .textContent.includes("without heat"),
    );
    assert(
      w.document
        .querySelector("#process-image")
        .src.endsWith("/brand/community.webp"),
    );
    let t = click(w, "#tab-plastic");
    t.dispatchEvent(
      new w.KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }),
    );
    assert.equal(
      w.document.querySelector('[aria-selected="true"]').dataset.material,
      "rice-sacks",
    );
    w.document
      .querySelector("#tab-rice-sacks")
      .dispatchEvent(
        new w.KeyboardEvent("keydown", { key: "End", bubbles: true }),
      );
    assert.equal(
      w.document.querySelector('[aria-selected="true"]').dataset.material,
      "dyed",
    );
    w = load(enq, storage);
    assert.equal(
      w.document.querySelector("#enquiry-piece").value,
      "toiletries-bag",
    );
    assert.equal(w.document.querySelectorAll(".saved-item").length, 1);
    click(w, 'button[type="submit"]');
    assert(w.document.querySelector("#enquiry-output").hidden);
    input(w, "#enquiry-name", "Sunil");
    input(w, "#enquiry-email", "invalid");
    input(
      w,
      "#enquiry-message",
      "Please confirm the dimensions and delivery options.",
    );
    click(w, 'button[type="submit"]');
    assert(w.document.querySelector("#enquiry-output").hidden);
    input(w, "#enquiry-email", "sunil@example.com");
    click(w, 'button[type="submit"]');
    assert.equal(w.document.querySelector("#enquiry-output").hidden, false);
    const note = w.document.querySelector("#enquiry-draft").value;
    assert(note.includes("Sunil"));
    assert(note.includes("sunil@example.com"));
    assert(note.includes("Toiletries Bag"));
    assert.equal((note.match(/• Toiletries Bag/g) || []).length, 1);
    assert(note.includes("delivery options"));
    assert(
      w.document
        .querySelector("#copy-status")
        .textContent.includes("Nothing has been sent"),
    );
    let copied = "";
    Object.defineProperty(w.navigator, "clipboard", {
      value: {
        writeText: async (text) => {
          copied = text;
        },
      },
      configurable: true,
    });
    click(w, "#copy-enquiry");
    await new Promise((resolve) => setImmediate(resolve));
    assert.equal(copied, note);
    assert(
      w.document.querySelector("#copy-status").textContent.includes("copied"),
    );
    let downloaded = "";
    w.URL.createObjectURL = () => "blob:preview";
    w.URL.revokeObjectURL = () => {};
    w.HTMLAnchorElement.prototype.click = function () {
      downloaded = this.download;
    };
    click(w, "#download-enquiry");
    assert.equal(downloaded, "TAMANG-Nepal-enquiry.txt");
    click(w, ".saved-item button");
    assert.equal(w.document.querySelectorAll(".saved-item").length, 0);
    assert.equal(w.document.querySelector("#saved-empty").hidden, false);
    w = load("/enquire/?interest=collaboration");
    assert.equal(
      w.document.querySelector("#enquiry-interest").value,
      "collaboration",
    );
    w = load("/care/", storage);
    click(w, "#clear-local-data");
    assert.equal(
      w.document.querySelector("[data-saved-count]").textContent,
      "0",
    );
    w = load("/", "not valid json");
    assert.equal(
      w.document.querySelector("[data-saved-count]").textContent,
      "0",
    );
    w = load("/", '["unknown","toiletries-bag","toiletries-bag",23]');
    assert.equal(
      w.document.querySelector("[data-saved-count]").textContent,
      "1",
    );

    // The catalogue comparison follows the same filter and sort as the product gallery.
    w = load("/collection/?category=Pouches");
    assert.equal(
      [...w.document.querySelectorAll("[data-product-row]")].filter(
        (row) => !row.hidden,
      ).length,
      1,
    );
    input(w, "#collection-sort", "name", "change");
    assert.deepEqual(
      [...w.document.querySelectorAll("[data-product-row]")]
        .filter((row) => !row.hidden)
        .map((row) => row.dataset.title),
      ["toiletries bag"],
    );
    input(w, "#collection-search", "not a piece");
    assert(w.document.querySelector("#collection-matrix").hidden);
    click(w, "#reset-filters");
    assert(!w.document.querySelector("#collection-matrix").hidden);
    // Every notebook filter keeps the linked article index consistent.
    w = load("/journal/");
    const notes = () =>
      [...w.document.querySelectorAll("[data-note-card]")].filter(
        (e) => !e.hidden,
      );
    assert.equal(notes().length, 6);
    click(w, '[data-note-filter="Place"]');
    assert.equal(notes().length, 1);
    assert.equal(notes()[0].dataset.category, "Place");
    click(w, '[data-note-filter="Making"]');
    assert.equal(notes().length, 3);
    click(w, '[data-note-filter="All"]');
    assert.equal(notes().length, 6);
    for (const note of notes()) {
      const route = note.querySelector("a").getAttribute("href");
      const article = load(route);
      assert(article.document.querySelector(".article-body h2"));
    }
    const oldSaved = load(
      "/enquire/?piece=boxy-pouch",
      '["boxy-pouch","slipper-carrier","laptop-cover"]',
    );
    assert.equal(oldSaved.document.querySelector("#enquiry-piece").value, "");
    assert.equal(oldSaved.document.querySelectorAll(".saved-item").length, 1);
    assert(
      oldSaved.document
        .querySelector("#saved-items")
        .textContent.includes("Laptop Cover"),
    );
    // Instagram previews and links are real data; the native embed is loaded only on request.
    w = load("/");
    assert.equal(w.document.querySelectorAll(".instagram-post").length, 4);
    assert.equal(
      w.document.querySelector(
        'script[src="https://www.instagram.com/embed.js"]',
      ),
      null,
    );
    let processed = 0;
    w.instgrm = {
      Embeds: {
        process: () => {
          processed++;
        },
      },
    };
    click(w, '[data-instagram-open="0"]');
    await new Promise((resolve) => setImmediate(resolve));
    assert(w.document.querySelector("#instagram-dialog").hasAttribute("open"));
    assert.equal(processed, 1);
    assert.equal(
      w.document.querySelector("#instagram-original").href,
      "https://www.instagram.com/p/DbxTt4gj1Va/",
    );
    assert(
      w.document
        .querySelector("#instagram-embed img")
        .src.includes("/assets/images/instagram/"),
    );
    click(w, "#close-instagram");
    assert(!w.document.querySelector("#instagram-dialog").hasAttribute("open"));
    assert.equal(
      w.document.querySelector("#instagram-embed").childElementCount,
      0,
    );
    // A blocked Instagram script keeps the local image and direct original link available.
    w = load("/");
    const originalAppend = w.document.head.append.bind(w.document.head);
    w.document.head.append = (node) => {
      originalAppend(node);
      if (
        node.tagName === "SCRIPT" &&
        node.src === "https://www.instagram.com/embed.js"
      )
        setImmediate(() => node.onerror());
    };
    click(w, '[data-instagram-open="1"]');
    await new Promise((resolve) => setImmediate(resolve));
    await new Promise((resolve) => setImmediate(resolve));
    assert(
      w.document
        .querySelector("#instagram-status")
        .textContent.includes("could not load"),
    );
    assert(w.document.querySelector("#instagram-embed img"));
    assert.equal(
      w.document.querySelector("#instagram-original").href,
      "https://www.instagram.com/p/DbYC1TliJZK/",
    );
    click(w, "#close-instagram");
    w = load("/enquire/");
    input(w, "#enquiry-message", "Please also check delivery.");
    click(w, '[data-enquiry-prompt="materials"]');
    assert.equal(
      w.document.querySelector("#enquiry-interest").value,
      "materials",
    );
    assert(
      w.document
        .querySelector("#enquiry-message")
        .value.includes("Please also check delivery."),
    );
    assert(
      w.document
        .querySelector("#enquiry-message")
        .value.includes("materials and construction"),
    );
    console.log(
      "PASS: all main navigation; mobile menu/Escape; four-product filters, search, sorting, deep links and empty state; saved-piece persistence/removal and corrupt-data recovery; product views/dialog/enquiry link; homepage origin exhibits and keyboard navigation; four material stages and keyboard tabs; enquiry validation, preparation, clipboard and note-download flow; synchronised comparison table; Instagram post previews, native embed handoff and blocked-script fallback; enquiry starters.",
    );
  } finally {
    windows.forEach((w) => w.close());
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});

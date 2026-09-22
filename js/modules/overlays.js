import { experienceData } from "../data/experience.js";

/** Creates a text element without parsing content as markup. */
function createElement(tag, className, text) {
  const element = document.createElement(tag);
  element.className = className;
  if (text) element.textContent = text;
  return element;
}

/** Displays supplied media or a quiet placeholder for a future recording. */
function renderMedia(media, sectionId) {
  if (media.images) {
    const gallery = createElement(
      "div",
      `case-media case-gallery case-gallery-${media.layout}`,
    );
    const controls = createElement("div", "case-steps");
    controls.setAttribute("role", "tablist");
    controls.setAttribute("aria-label", "Workflow screenshots");
    const panels = [];
    const buttons = [];
    function selectShot(index, focus = false) {
      panels.forEach((panel, position) => {
        panel.hidden = position !== index;
        buttons[position].setAttribute(
          "aria-selected",
          String(position === index),
        );
        buttons[position].tabIndex = position === index ? 0 : -1;
      });
      if (focus) buttons[index].focus();
    }
    if (media.images.length > 1) gallery.append(controls);
    media.images.forEach((shot, index) => {
      const item = createElement("figure", "case-shot");
      if (media.images.length > 1) {
        const button = createElement(
          "button",
          "case-step",
          shot.label.replace(/^\d+ · /, ""),
        );
        button.type = "button";
        button.id = `${sectionId}-tab-${index}`;
        button.setAttribute("role", "tab");
        button.setAttribute("aria-controls", `${sectionId}-shot-${index}`);
        button.addEventListener("click", () => selectShot(index));
        button.addEventListener("keydown", (event) => {
          const keys = {
            ArrowRight: (index + 1) % media.images.length,
            ArrowLeft: (index + media.images.length - 1) % media.images.length,
            Home: 0,
            End: media.images.length - 1,
          };
          if (event.key in keys) {
            event.preventDefault();
            selectShot(keys[event.key], true);
          }
        });
        item.id = `${sectionId}-shot-${index}`;
        item.setAttribute("role", "tabpanel");
        item.setAttribute("aria-labelledby", button.id);
        buttons.push(button);
        panels.push(item);
        controls.append(button);
      }
      const image = document.createElement("img");
      image.src = shot.src;
      image.alt = shot.label;
      image.width = shot.width;
      image.height = shot.height;
      image.loading = "lazy";
      image.decoding = "async";
      const caption = createElement("figcaption", "");
      caption.append(
        createElement("strong", "", shot.label),
        createElement("p", "", shot.caption),
      );
      item.append(caption, image);
      gallery.append(item);
    });
    if (panels.length) selectShot(0);
    return gallery;
  }
  const figure = createElement("figure", "case-media");
  if (media.videos) {
    figure.classList.add("case-video-pair");
    media.videos.forEach((video) => {
      const item = createElement("figure", "");
      const player = document.createElement("video");
      player.src = video.src;
      player.controls = true;
      player.playsInline = true;
      player.preload = "metadata";
      player.setAttribute("aria-label", video.label);
      item.append(player, createElement("figcaption", "", video.label));
      figure.append(item);
    });
    return figure;
  }
  if (media.image) {
    const image = document.createElement("img");
    image.src = media.image;
    image.alt = media.label;
    image.loading = "lazy";
    figure.append(image);
  } else if (media.video) {
    const video = document.createElement("video");
    video.src = media.video;
    video.controls = true;
    video.playsInline = true;
    video.preload = "metadata";
    video.setAttribute("aria-label", media.label);
    figure.append(video);
  } else {
    const placeholder = createElement("div", "case-video-placeholder");
    placeholder.append(
      createElement("span", "case-media-label", media.label),
      createElement("span", "case-video-note", "Recording coming soon"),
    );
    figure.append(placeholder);
  }
  if (media.caption)
    figure.append(createElement("figcaption", "", media.caption));
  return figure;
}

/** Builds a readable case study with context, work, and supporting media. */
function renderCase(container, id) {
  const data = experienceData[id];
  container.replaceChildren();
  const header = createElement("header", "case-header");
  const title = createElement("h2", "case-title", data.company);
  title.id = "overlayTitle";
  header.append(title, createElement("p", "case-intro", data.intro));
  container.append(header);
  const navigation = createElement("div", "case-index");
  navigation.setAttribute("role", "tablist");
  navigation.setAttribute("aria-label", "Case study chapters");
  container.append(navigation);
  const chapters = [];
  const chapterButtons = [];
  function selectChapter(index, focus = false) {
    chapters.forEach((panel, position) => {
      panel.hidden = position !== index;
      if (panel.hidden)
        panel.querySelectorAll("video").forEach((video) => video.pause());
      chapterButtons[position].setAttribute(
        "aria-selected",
        String(position === index),
      );
      chapterButtons[position].tabIndex = position === index ? 0 : -1;
    });
    if (focus) chapterButtons[index].focus();
  }
  data.sections.forEach((section, index) => {
    const article = createElement("section", "case-section");
    const text = createElement("div", "case-copy");
    const title = createElement("h3", "", section.title);
    title.id = `case-${id}-${index}`;
    article.setAttribute("aria-labelledby", title.id);
    article.id = `${title.id}-section`;
    const chapter = createElement("button", "", section.nav || section.title);
    chapter.type = "button";
    chapter.id = `${title.id}-chapter`;
    chapter.setAttribute("role", "tab");
    chapter.setAttribute("aria-controls", article.id);
    article.setAttribute("role", "tabpanel");
    article.setAttribute("aria-labelledby", chapter.id);
    chapter.addEventListener("click", () => selectChapter(index));
    chapter.addEventListener("keydown", (event) => {
      const keys = {
        ArrowRight: (index + 1) % data.sections.length,
        ArrowLeft: (index + data.sections.length - 1) % data.sections.length,
        Home: 0,
        End: data.sections.length - 1,
      };
      if (event.key in keys) {
        event.preventDefault();
        selectChapter(keys[event.key], true);
      }
    });
    chapters.push(article);
    chapterButtons.push(chapter);
    navigation.append(chapter);
    text.append(title);
    const body = createElement("div", "case-body");
    section.paragraphs.forEach((paragraph) =>
      body.append(createElement("p", "", paragraph)),
    );
    text.append(body);
    article.append(text);
    if (section.media) article.append(renderMedia(section.media, title.id));
    container.append(article);
  });
  selectChapter(0);
  const footer = createElement("footer", "case-footer");
  const close = createElement("button", "", "Back to the portfolio ↑");
  close.type = "button";
  close.dataset.closeCase = "";
  footer.append(close);
  container.append(footer);
}

/** Opens case studies with one scroll container and keyboard focus containment. */
export function initializeOverlay() {
  const overlay = document.getElementById("expOverlay");
  const close = document.getElementById("overlayClose");
  const scroller = overlay.querySelector(".case-scroll");
  const content = document.getElementById("caseContent");
  const background = [...document.body.children].filter(
    (element) => element !== overlay && element.tagName !== "SCRIPT",
  );
  let previousFocus;

  function openCase(id) {
    if (!experienceData[id]) return;
    previousFocus = document.activeElement;
    overlay.dataset.case = id;
    renderCase(content, id);
    overlay.hidden = false;
    scroller.scrollTop = 0;
    document.body.style.overflow = "hidden";
    background.forEach((element) => (element.inert = true));
    close.focus();
  }

  function closeCase() {
    overlay.querySelectorAll("video").forEach((video) => video.pause());
    overlay.hidden = true;
    document.body.style.overflow = "";
    background.forEach((element) => (element.inert = false));
    previousFocus?.focus();
  }

  document
    .querySelectorAll("[data-exp]")
    .forEach((button) =>
      button.addEventListener("click", () => openCase(button.dataset.exp)),
    );
  close.addEventListener("click", closeCase);
  overlay.addEventListener("click", (event) => {
    if (event.target.closest("[data-close-case]")) closeCase();
  });
  overlay.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeCase();
    if (event.key !== "Tab") return;
    const controls = [
      ...overlay.querySelectorAll("button, a, video[controls]"),
    ].filter(
      (element) => element.getClientRects().length && element.tabIndex !== -1,
    );
    const first = controls[0];
    const last = controls.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
}

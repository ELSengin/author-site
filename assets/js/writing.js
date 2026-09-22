function ensureBookLightbox(){let o=document.getElementById("book-image-lightbox");if(o)return o;o=document.createElement("div");o.id="book-image-lightbox";o.className="book-image-lightbox";o.setAttribute("aria-hidden","true");o.innerHTML=`<div class="book-image-lightbox-inner" role="dialog" aria-modal="true" aria-label="Enlarged book image"><button class="book-image-lightbox-close" type="button" aria-label="Close enlarged image">&times;</button><img class="book-image-lightbox-image" alt=""></div>`;document.body.appendChild(o);o.querySelector(".book-image-lightbox-close").addEventListener("click",closeBookLightbox);o.addEventListener("click",e=>{if(e.target===o)closeBookLightbox();});document.addEventListener("keydown",e=>{if(e.key==="Escape"&&o.classList.contains("is-open"))closeBookLightbox();});return o;}
function openBookLightbox(src,alt){const o=ensureBookLightbox(),i=o.querySelector(".book-image-lightbox-image");i.src=src;i.alt=alt||"";o.classList.add("is-open");o.setAttribute("aria-hidden","false");document.body.classList.add("lightbox-open");o.querySelector(".book-image-lightbox-close").focus();}
function closeBookLightbox(){const o=document.getElementById("book-image-lightbox");if(!o)return;o.classList.remove("is-open");o.setAttribute("aria-hidden","true");document.body.classList.remove("lightbox-open");}

function renderBookItem(item) {
  const article = document.createElement("article");
  article.className = "work-item book-work-item";

  if (item.image) {
    const figure = document.createElement("div");
    figure.className = "book-art";

    const button = document.createElement("button");
    button.type = "button";
    button.className = "book-art-button";
    button.setAttribute("aria-label", "Enlarge " + item.title + " image");
    const img = document.createElement("img");
    img.src = item.image;
    img.alt = item.imageAlt || "";
    img.loading = "lazy";
    button.appendChild(img);
    button.addEventListener("click", () => openBookLightbox(item.fullImage || item.image, item.imageAlt || item.title));
    figure.appendChild(button);
    article.appendChild(figure);
  }

  const copy = document.createElement("div");
  copy.className = "book-copy";

  const h3 = document.createElement("h3");
  h3.textContent = item.title;
  copy.appendChild(h3);

  const meta = document.createElement("div");
  meta.className = "meta";
  meta.textContent = item.type;
  copy.appendChild(meta);

  if (item.status) {
    const status = document.createElement("p");
    status.className = "status";
    status.textContent = item.status;
    copy.appendChild(status);
  }

  if (item.description) {
    const p = document.createElement("p");
    p.className = "description";
    p.textContent = item.description;
    copy.appendChild(p);
  }

  if (item.sampleText) {
    const sample = document.createElement("p");
    sample.className = "book-sample-note";
    sample.textContent = item.sampleText;
    copy.appendChild(sample);
  }

  if (item.readerUrl) {
    const links = document.createElement("div");
    links.className = "work-links book-links";
    const a = document.createElement("a");
    a.href = item.readerUrl;
    a.textContent = item.readerLabel || "Read →";
    links.appendChild(a);
    if (item.readerNote) {
      const note = document.createElement("span");
      note.className = "edition-note";
      note.textContent = item.readerNote;
      links.appendChild(note);
    }
    copy.appendChild(links);
  }

  if (item.editions && item.editions.length) {
    const editions = document.createElement("div");
    editions.className = "edition-list";
    const title = document.createElement("p");
    title.className = "edition-list-title";
    title.textContent = "Available editions";
    editions.appendChild(title);
    item.editions.forEach(edition => {
      const row = document.createElement(edition.url ? "a" : "span");
      row.className = edition.url ? "edition-link" : "edition-pending";
      if (edition.url) {
        row.href = edition.url;
        row.target = "_blank";
        row.rel = "noopener noreferrer";
      }
      const label = document.createElement("strong");
      label.textContent = edition.label;
      row.appendChild(label);
      if (edition.note) {
        const note = document.createElement("span");
        note.className = "edition-note";
        note.textContent = edition.note;
        row.appendChild(note);
      }
      editions.appendChild(row);
    });
    copy.appendChild(editions);
  } else if (item.externalUrl) {
    const links = document.createElement("div");
    links.className = "work-links book-links";
    const a = document.createElement("a");
    a.href = item.externalUrl;
    a.textContent = item.externalLabel || "Read →";
    if (item.externalUrl.startsWith("http")) {
      a.target = "_blank";
      a.rel = "noopener noreferrer";
    }
    links.appendChild(a);
    copy.appendChild(links);
  }

  article.appendChild(copy);
  return article;
}

function renderItems(section, targetId) {
  const target = document.getElementById(targetId);
  if (!target || !window.WRITING_ITEMS) return;

  window.WRITING_ITEMS.filter(item => item.section === section).forEach(item => {
    if (section === "books") {
      target.appendChild(renderBookItem(item));
      return;
    }

    const article = document.createElement("article");
    article.className = "work-item";

    const h3 = document.createElement("h3");
    if (item.internalUrl || item.externalUrl) {
      const a = document.createElement("a");
      a.href = item.internalUrl || item.externalUrl;
      a.textContent = item.title;
      h3.appendChild(a);
    } else {
      h3.textContent = item.title;
    }
    article.appendChild(h3);

    const meta = document.createElement("div");
    meta.className = "meta";
    meta.textContent = item.publication ? `${item.type} — ${item.publication}` : item.type;
    article.appendChild(meta);

    const p = document.createElement("p");
    p.className = "description";
    p.textContent = item.description;
    article.appendChild(p);

    if (item.status) {
      const status = document.createElement("p");
      status.className = "status";
      status.textContent = item.status;
      article.appendChild(status);
    }

    if (item.externalUrl) {
      const links = document.createElement("div");
      links.className = "work-links";
      const a = document.createElement("a");
      a.href = item.externalUrl;
      a.textContent = item.externalLabel || "Read →";
      links.appendChild(a);
      article.appendChild(links);
    }

    if (item.readerUrl) {
      const links = document.createElement("div");
      links.className = "work-links";
      const a = document.createElement("a");
      a.href = item.readerUrl;
      a.textContent = item.readerLabel || "Read →";
      links.appendChild(a);
      article.appendChild(links);
    }

    if (item.note) {
      const note = document.createElement("p");

      const strong = document.createElement("strong");
      strong.textContent = "An unexpected connection: ";
      note.appendChild(strong);

      const parts = item.note.split("The Avatar");

      note.appendChild(document.createTextNode(parts[0]));

      const link = document.createElement("a");
      link.href = "writing/the-avatar.html";
      link.textContent = "The Avatar";
      link.style.fontStyle = "italic";
      note.appendChild(link);

      note.appendChild(document.createTextNode(parts[1]));

      const storyLink = document.createElement("a");
      storyLink.href = "writing/the-avatar.html";
      storyLink.textContent = "Read the story →";
      storyLink.style.display = "block";
      storyLink.style.marginTop = "8px";
      note.appendChild(storyLink);

      article.appendChild(note);
    }

    target.appendChild(article);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderItems("poetry", "poetry-list");
  renderItems("essays", "essay-list");
  renderItems("books", "book-list");
});


function renderItems(section, targetId) {
  const target = document.getElementById(targetId);
  if (!target || !window.WRITING_ITEMS) return;

  window.WRITING_ITEMS.filter(item => item.section === section).forEach(item => {
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

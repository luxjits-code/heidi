/* Heidi — small, dependency-free interactions */
(function () {
  "use strict";

  // ✉️ Change this to the address you'd like notes sent to.
  const CONTACT_EMAIL = "hello@example.com";

  document.documentElement.classList.add("js");

  /* ---------- Header: solid on scroll ---------- */
  const header = document.querySelector(".site-header");
  const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 40);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Mobile menu ---------- */
  const toggle = document.querySelector(".menu-toggle");
  const menu = document.getElementById("mobile-menu");

  function setMenu(open) {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.style.overflow = open ? "hidden" : "";
    if (open) {
      menu.hidden = false;
      requestAnimationFrame(() => menu.classList.add("open"));
    } else {
      menu.classList.remove("open");
      setTimeout(() => { if (!menu.classList.contains("open")) menu.hidden = true; }, 400);
    }
  }
  toggle.addEventListener("click", () => setMenu(toggle.getAttribute("aria-expanded") !== "true"));
  menu.querySelectorAll("a").forEach(a => a.addEventListener("click", () => setMenu(false)));

  /* ---------- Reveal on scroll ---------- */
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    reveals.forEach(el => io.observe(el));
  } else {
    reveals.forEach(el => el.classList.add("in"));
  }

  /* ---------- Active nav link ---------- */
  const links = [...document.querySelectorAll(".nav a")];
  const sections = links.map(a => document.querySelector(a.getAttribute("href"))).filter(Boolean);
  if ("IntersectionObserver" in window) {
    const navIO = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          links.forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id));
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(s => navIO.observe(s));
  }

  /* ---------- Gallery lightbox ---------- */
  const items = [...document.querySelectorAll(".gallery-grid .photo")];
  const lb = document.getElementById("lightbox");
  const stage = lb.querySelector(".lb-stage");
  let index = 0, lastFocus = null;

  function show(i) {
    index = (i + items.length) % items.length;
    const media = items[index].querySelector("img, .ph");
    stage.innerHTML = "";
    stage.appendChild(media.cloneNode(true));
  }
  function openLB(i) {
    lastFocus = document.activeElement;
    show(i);
    lb.hidden = false;
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => lb.classList.add("open"));
    lb.querySelector(".lb-close").focus();
  }
  function closeLB() {
    lb.classList.remove("open");
    document.body.style.overflow = "";
    setTimeout(() => { lb.hidden = true; }, 400);
    if (lastFocus) lastFocus.focus();
  }
  items.forEach((fig, i) => {
    fig.addEventListener("click", () => openLB(i));
    fig.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openLB(i); } });
  });
  lb.querySelector(".lb-close").addEventListener("click", closeLB);
  lb.querySelector(".lb-prev").addEventListener("click", () => show(index - 1));
  lb.querySelector(".lb-next").addEventListener("click", () => show(index + 1));
  lb.addEventListener("click", e => { if (e.target === lb || e.target === stage) closeLB(); });
  document.addEventListener("keydown", e => {
    if (lb.hidden) { if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") setMenu(false); return; }
    if (e.key === "Escape") closeLB();
    if (e.key === "ArrowLeft") show(index - 1);
    if (e.key === "ArrowRight") show(index + 1);
  });

  /* ---------- Invitation form (opens the visitor's email app) ---------- */
  const form = document.getElementById("invite-form");
  const status = form.querySelector(".form-status");

  form.addEventListener("submit", e => {
    e.preventDefault();
    let ok = true;
    form.querySelectorAll("[required]").forEach(input => {
      const valid = input.value.trim() !== "" && (input.type !== "email" || /^\S+@\S+\.\S+$/.test(input.value));
      input.closest(".field").classList.toggle("invalid", !valid);
      if (!valid) ok = false;
    });
    if (!ok) { status.textContent = "Just a few more words, please — every field is needed."; return; }

    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const note = form.note.value.trim();
    const subject = `A note for Heidi, from ${name}`;
    const body = `${note}\n\n— ${name}\n${email}`;
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    status.textContent = "Your email app should open with your note ready to send. Thank you.";
  });
})();

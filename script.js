const menuButton = document.querySelector(".menu-toggle");
const nav = document.querySelector(".nav-links");

menuButton.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(isOpen));
  menuButton.textContent = isOpen ? "×" : "☰";
});

document.querySelectorAll(".nav-links a").forEach((link) => {
  link.addEventListener("click", () => {
    nav.classList.remove("open");
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.textContent = "☰";
  });
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));

const sections = [...document.querySelectorAll("main section[id]")];
const navLinks = [...document.querySelectorAll(".nav-links a[href^='#']")];

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      navLinks.forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
      });
    }
  });
}, { rootMargin: "-35% 0px -55%", threshold: 0 });

sections.forEach((section) => sectionObserver.observe(section));

if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  document.querySelectorAll(".reveal").forEach((element) => element.classList.add("visible"));
}

const contactForm = document.querySelector("#contact-form");
if (contactForm) {
  const toast = document.querySelector("#form-toast");
  const responseFrame = document.querySelector("#contact-response-frame");
  const submitButton = contactForm.querySelector("button[type='submit']");
  const submitButtonLabel = submitButton.querySelector("span");
  let toastTimer;
  let submissionPending = false;
  let responseFrameReady = responseFrame.contentDocument?.readyState === "complete";
  let submissionTimeout;

  const showToast = (type, title, message, duration = 5000) => {
    window.clearTimeout(toastTimer);
    toast.dataset.state = type;
    toast.querySelector(".form-toast-icon").textContent = type === "success" ? "✓" : type === "sending" ? "…" : "!";
    toast.querySelector("[data-toast-title]").textContent = title;
    toast.querySelector("[data-toast-message]").textContent = message;
    contactForm.querySelector(".form-status").textContent = `${title} ${message}`;
    toast.hidden = false;
    toast.classList.add("is-visible");
    if (duration > 0) {
      toastTimer = window.setTimeout(() => {
        toast.classList.remove("is-visible");
        window.setTimeout(() => { toast.hidden = true; }, 250);
      }, duration);
    }
  };

  responseFrame.addEventListener("load", () => {
    if (!responseFrameReady) {
      responseFrameReady = true;
      return;
    }
    if (!submissionPending) return;

    submissionPending = false;
    window.clearTimeout(submissionTimeout);
    contactForm.reset();
    submitButton.disabled = false;
    submitButton.removeAttribute("aria-busy");
    submitButtonLabel.textContent = "Send Message";
    showToast("success", "Message submitted!", "Thanks for reaching out. Your message has been submitted.");
  });

  toast.querySelector(".form-toast-close").addEventListener("click", () => {
    window.clearTimeout(toastTimer);
    toast.classList.remove("is-visible");
    window.setTimeout(() => { toast.hidden = true; }, 250);
  });

  contactForm.addEventListener("submit", (event) => {
    if (contactForm.elements._honey.value) {
      event.preventDefault();
      return;
    }
    if (submissionPending) {
      event.preventDefault();
      return;
    }

    contactForm.querySelector("#contact-reply-to").value = contactForm.elements.email.value.trim();
    contactForm.elements._subject.value = `Portfolio contact: ${contactForm.elements.subject.value.trim()}`;
    submissionPending = true;
    submitButton.disabled = true;
    submitButton.setAttribute("aria-busy", "true");
    submitButtonLabel.textContent = "Sending…";
    showToast("sending", "Sending your message…", "Please wait while your message is submitted.", 0);

    submissionTimeout = window.setTimeout(() => {
      if (!submissionPending) return;
      submissionPending = false;
      submitButton.disabled = false;
      submitButton.removeAttribute("aria-busy");
      submitButtonLabel.textContent = "Send Message";
      showToast("error", "Submission timed out", "Please try again, or email poojamehta02000@gmail.com directly.", 0);
    }, 25000);
  });
}

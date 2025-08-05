// === INICIALIZAR BOTÓN FLOTANTE DE TEMA ===
export function initThemeToggle() {
  const themeToggle = document.getElementById("darkModeToggle");
  if (!themeToggle) return;

  const savedTheme = localStorage.getItem("theme");
  const isDark = savedTheme === "dark";
  document.body.classList.toggle("dark-mode", isDark);
  themeToggle.innerHTML = `<i class="fas fa-${isDark ? "sun" : "moon"}"></i>`;

  themeToggle.addEventListener("click", () => {
    const dark = document.body.classList.toggle("dark-mode");
    themeToggle.innerHTML = `<i class="fas fa-${dark ? "sun" : "moon"}"></i>`;
    localStorage.setItem("theme", dark ? "dark" : "light");
  });
  
}


  // === ESTILO TEMPORAL PARA IMPRESIÓN DESDE MODO OSCURO ===
window.addEventListener("beforeprint", () => {
  if (!document.body.classList.contains("dark-mode")) return;

  const printStyle = document.createElement("style");
  printStyle.setAttribute("id", "dark-print-style");
  printStyle.innerHTML = `
    .ql-editor {
      color: #000 !important;
      background-color: #fff !important;
    }
  `;
  document.head.appendChild(printStyle);
});

window.addEventListener("afterprint", () => {
  const printStyle = document.getElementById("dark-print-style");
  if (printStyle) printStyle.remove();
});



// === Reversión temporal de modo oscuro durante impresión ===
window.addEventListener("beforeprint", () => {
  if (document.body.classList.contains("dark-mode")) {
    document.body.classList.remove("dark-mode");
    document.body.setAttribute("data-temporal-print-dark", "true");
  }

  const printStyle = document.createElement("style");
  printStyle.setAttribute("id", "dark-print-style");
  printStyle.innerHTML = `
    .ql-editor {
      color: #000 !important;
      background-color: #fff !important;
    }
  `;
  document.head.appendChild(printStyle);
});

window.addEventListener("afterprint", () => {
  if (document.body.getAttribute("data-temporal-print-dark") === "true") {
    document.body.classList.add("dark-mode");
    document.body.removeAttribute("data-temporal-print-dark");
  }

  const styleTag = document.getElementById("dark-print-style");
  if (styleTag) styleTag.remove();
});

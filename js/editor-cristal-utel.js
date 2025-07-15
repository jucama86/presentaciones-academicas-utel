// 🔹 Motor TipTap local
const { Editor } = window["@tiptap/vanilla-bundle"];

// 🔹 Recuperar contenido guardado
const contenidoGuardado = localStorage.getItem("contenidoUTEL");

// 🔹 Inicializar editor y exponerlo públicamente
window.editor = new Editor({
  element: document.querySelector(".editor-cristal"),
  content: contenidoGuardado || "<p>Texto institucional UTEL inicial...</p>",
  onTransaction: () => {
    localStorage.setItem("contenidoUTEL", editor.getContent());
    console.log("✏️ Cambios guardados localmente.");
  }
});

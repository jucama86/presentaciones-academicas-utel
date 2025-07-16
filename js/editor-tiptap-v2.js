// js/editor-tiptap-v2.js

let isEditorActive = false;

function activarEditorUTEL() {
  if (isEditorActive) {
    console.log("El editor ya está activo.");
    return;
  }

  // Esperar a que el bundle de TipTap esté disponible en la ventana global
  const bundle = window["@tiptap/vanilla-bundle"];
  if (!bundle || !bundle.Editor) {
    console.error("Error crítico: El bundle de TipTap no se ha cargado.");
    alert("No se pudo cargar el editor. Por favor, refresca la página.");
    return;
  }

  console.log("✅ TipTap cargado. Inicializando editores...");
  const { Editor, StarterKit } = bundle;
  
  inicializarEditores(Editor, StarterKit);
  isEditorActive = true;
}

function inicializarEditores(Editor, StarterKit) {
  const contenedoresEditables = document.querySelectorAll(".editable-content");

  contenedoresEditables.forEach((contenedor) => {
    const section = contenedor.closest('section');
    if (!section || !section.dataset.titulo) {
      console.warn("Se encontró un contenedor editable fuera de una sección con título.", contenedor);
      return;
    }

    // Evitar reinicializar si ya tiene un editor
    if (contenedor.tiptapEditor) {
      return;
    }

    const clave = `contenido-utel-${section.dataset.titulo}`;
    const contenidoGuardado = localStorage.getItem(clave) || contenedor.innerHTML;

    const editor = new Editor({
      element: contenedor,
      extensions: [
        StarterKit.configure({
          heading: { levels: [1, 2, 3] },
        }),
      ],
      content: contenidoGuardado,
      onUpdate: ({ editor }) => {
        // Guardado local por cada cambio
        localStorage.setItem(clave, editor.getHTML());
      },
    });

    // Adjuntar la instancia del editor al elemento para referencia futura
    contenedor.tiptapEditor = editor; 
    console.log(`🧠 Editor Tiptap activado en: "${section.dataset.titulo}"`);
  });
}

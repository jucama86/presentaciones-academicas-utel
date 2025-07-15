// js/editor-tiptap-v2.js

// Variable global para evitar múltiples inicializaciones
let isEditorActive = false;

// Estado de la conexión
let onlineStatus = navigator.onLine;

// Cola para cambios pendientes de sincronizar
const syncQueue = new Set();

/**
 * Simulación de envío de datos al servidor.
 * Reemplazar con una llamada `fetch` real a tu API.
 * @param {string} key - La clave única del contenido (e.g., 'contenido-utel-Introducción')
 * @param {string} htmlContent - El contenido HTML a guardar.
 */
async function syncRemote(key, htmlContent) {
  console.log(`📡 Sincronizando "${key}" con el servidor...`);
  
  // -- COMIENZO DE LA SIMULACIÓN --
  return new Promise(resolve => {
    setTimeout(() => {
      console.log(`✅ "${key}" sincronizado.`);
      resolve({ success: true });
    }, 1000); // Simular retraso de red
  });
  // -- FIN DE LA SIMULACIÓN --

  /*
  // -- EJEMPLO REAL CON FETCH --
  try {
    const response = await fetch('https://tu-api.com/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: key, content: htmlContent })
    });
    if (!response.ok) throw new Error('Falló la respuesta del servidor');
    return await response.json();
  } catch (error) {
    console.error("Error al sincronizar:", error);
    return { success: false };
  }
  */
}


/**
 * Procesa la cola de cambios pendientes cuando se recupera la conexión.
 */
async function processSyncQueue() {
  if (syncQueue.size === 0) return;
  console.log(`🔄 Procesando ${syncQueue.size} cambios pendientes...`);
  
  const processingQueue = [...syncQueue];
  syncQueue.clear();

  for (const key of processingQueue) {
    const content = localStorage.getItem(key);
    if (content) {
      const result = await syncRemote(key, content);
      if (!result.success) {
        // Si falla, lo devolvemos a la cola para un reintento posterior
        syncQueue.add(key);
      }
    }
  }
}

// Escuchar cambios en el estado de la conexión
window.addEventListener('online', () => {
  onlineStatus = true;
  console.log("🟢 Conectado a internet. Sincronizando cambios pendientes...");
  processSyncQueue();
});
window.addEventListener('offline', () => {
  onlineStatus = false;
  console.log("🔴 Sin conexión. Los cambios se guardarán localmente.");
});


function activarEditorUTEL() {
  if (isEditorActive) {
    console.log("Editor ya está activo.");
    return;
  }
  
  const bundle = window["@tiptap/vanilla-bundle"];
  if (!bundle || !bundle.Editor) {
    console.warn("⏳ TipTap aún no disponible. Reintentando en 100ms...");
    setTimeout(activarEditorUTEL, 100);
    return;
  }
  
  console.log("✅ TipTap cargado. Inicializando editores...");
  inicializarEditores(bundle.Editor, bundle.StarterKit);
  isEditorActive = true;
}


function inicializarEditores(Editor, StarterKit) {
  const contenedoresEditables = document.querySelectorAll(".editable-content");

  contenedoresEditables.forEach((contenedor) => {
    const section = contenedor.closest('section');
    if (!section || !section.dataset.titulo) return;

    const clave = `contenido-utel-${section.dataset.titulo}`;
    const contenidoGuardado = localStorage.getItem(clave) || contenedor.innerHTML;
    
    // Evitar reinicializar un editor en el mismo contenedor
    if (contenedor.querySelector('.ProseMirror')) return;

    const editor = new Editor({
      element: contenedor,
      extensions: [
        StarterKit.configure({
          // Configura las extensiones incluidas en StarterKit si es necesario
          heading: { levels: [1, 2, 3] },
        }),
      ],
      content: contenidoGuardado,
      
      onUpdate: ({ editor }) => {
        const html = editor.getHTML();
        
        // 1. Guardado local inmediato (siempre)
        localStorage.setItem(clave, html);
        console.log(`💾 Guardado localmente: "${clave}"`);

        // 2. Guardado remoto (si hay conexión) o encolado (si no la hay)
        if (onlineStatus) {
          syncRemote(clave, html);
        } else {
          syncQueue.add(clave);
          console.log(`📥 "${clave}" añadido a la cola de sincronización.`);
        }
      }
    });

    console.log(`🧠 Editor Tiptap activado en sección: "${section.dataset.titulo}"`);
  });
}

// Iniciar la cola de sincronización al cargar la página si hay conexión
if (onlineStatus) {
  processSyncQueue();
}
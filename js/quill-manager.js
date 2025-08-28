// js/quill-manager.js

class QuillManager {
  constructor() {
    this.activeQuillInstance = null;
    this.activeTarget = null;
    this.isEditingEnabled = false;
    this.toolbarContainer = null;
    this.init();
  }

  init() {
    document.addEventListener("DOMContentLoaded", () => {
      this.toolbarContainer = document.getElementById('quill-toolbar-container');
      this.loadAllTargetsFromStorage();
      this.addEventListeners();
      this.updateOnlineStatus();
      setInterval(() => this.saveAllTargetsToStorage(), 1000);
    });
  }

  addEventListeners() {
    document.body.addEventListener('click', (e) => {
  const target = e.target.closest('.quill-target');
  const clickedInsideToolbar = e.target.closest('#quill-toolbar-container');

  // No hacemos nada si clic en toolbar
  if (clickedInsideToolbar) {
    return;
  }

  if (this.isEditingEnabled) {
    if (target && this.activeTarget !== target) {
      // Si clic en otro target distinto, lo activamos
      this.activateInPlaceEditing(target);
    }
    // Si clic fuera de target, NO desactivamos nada (esto está omitido)
  }
});







// 🔘 Botón ACEPTAR
  const acceptBtn = document.getElementById('quill-accept');
  if (acceptBtn) {
    acceptBtn.addEventListener('click', () => {
      this.deactivateEditing(); // Guarda y cierra
	  this.showSaveFeedback();
    });
  }

  // ❌ Botón CANCELAR
  const cancelBtn = document.getElementById('quill-cancel');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      const original = this.activeTarget?.getAttribute('data-original-content');
      if (original !== null && this.activeTarget) {
        this.activeTarget.innerHTML = original;
      }
      this.deactivateEditing(); // Cancela y cierra
	  this.showCancelFeedback();

    });
  }

  // ⌨️ ESC como atajo para cancelar
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const original = this.activeTarget?.getAttribute('data-original-content');
      if (original !== null && this.activeTarget) {
        this.activeTarget.innerHTML = original;
      }
      this.deactivateEditing();
	  this.showCancelFeedback();

    }
  });
  

document.getElementById('quill-redo')?.addEventListener('click', () => {
  if (this.activeQuillInstance) {
    this.activeQuillInstance.history.redo();
  }
});

  
document.getElementById('quill-undo')?.addEventListener('click', () => {
  if (this.activeQuillInstance) {
    this.activeQuillInstance.history.undo();
  }
});



// 🔧 ZONA DE EXTENSIÓN DE FUNCIONALIDAD

// 📹 Botón INSERTAR VIDEO
const videoBtn = document.getElementById('quill-insert-video');
if (videoBtn) {
  videoBtn.addEventListener('click', () => {
    const videoUrl = prompt('📹 Ingresa el enlace del video (YouTube, Vimeo, etc.):');
    if (!videoUrl) return;

    let embedUrl = videoUrl;

    const youtubeStandard = videoUrl.match(/(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)(?:.*t=(\d+s?))?/);
    if (youtubeStandard) {
      embedUrl = `https://www.youtube.com/embed/${youtubeStandard[1]}`;
      if (youtubeStandard[2]) {
        embedUrl += `?start=${convertTimeToSeconds(youtubeStandard[2])}`;
      }
    }

    const youtubeShort = videoUrl.match(/(?:https?:\/\/)?youtu\.be\/([^?]+)(?:\?t=(\d+s?))?/);
    if (youtubeShort) {
      embedUrl = `https://www.youtube.com/embed/${youtubeShort[1]}`;
      if (youtubeShort[2]) {
        embedUrl += `?start=${convertTimeToSeconds(youtubeShort[2])}`;
      }
    }

    const vimeoMatch = videoUrl.match(/(?:https?:\/\/)?vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
      embedUrl = `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }

    const embedHtml = `<iframe width="560" height="315" src="${embedUrl}" frameborder="0" allowfullscreen></iframe>`;
    const range = this.activeQuillInstance.getSelection();
    const index = range ? range.index : this.activeQuillInstance.getLength();
    this.activeQuillInstance.clipboard.dangerouslyPasteHTML(index, embedHtml);
  });
}



// 🔧 Inicialización del editor (Quill interno, no visible)
const quill = new Quill("#editor", {
  theme: "snow",
  modules: {
    toolbar: false // Editor oculto, no interfiere con el flujo real
  }
});

// 🕵️‍♂️ Detectar el campo activo (como content-actividad, content-desarrollo, etc.)
function getActiveContentField() {
  const fields = document.querySelectorAll('[id^="content-"]');
  for (const field of fields) {
    if (document.activeElement === field) return field;
  }
  return null;
}

// 🖼️ Insertar imagen en el campo activo
function insertImageIntoActiveField(imageUrl) {
  const field = getActiveContentField();
  if (!field) {
    alert("Selecciona un campo de contenido antes de insertar.");
    return;
  }

  const imgTag = `<img src="${imageUrl}" alt="Imagen">`;
  const cursor = field.selectionStart;
  const value = field.value;

  field.value = value.slice(0, cursor) + imgTag + value.slice(cursor);
}

// 🧩 Función global que usará el modal (conecta con insertImageIntoActiveField)
function insertImage(src) {
  insertImageIntoActiveField(src);
}

// 📷 Lógica del botón INSERTAR IMAGEN

// 🎯 Elementos principales
const modal = document.getElementById("image-modal");
const uploadInput = document.getElementById("image-upload");
const insertBtn = document.getElementById("insert-image-trigger");
const urlBtn = document.getElementById("choose-url-btn");
const fileBtn = document.getElementById("choose-file-btn");

// 🖼️ Abrir el modal
insertBtn.addEventListener("click", () => {
  modal.style.display = "block";
});

// 📂 Cargar imagen desde archivo
fileBtn.addEventListener("click", () => {
  modal.style.display = "none";
  uploadInput.click();
});

uploadInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    insertImage(reader.result); // Inserta en el campo activo
    modal.style.display = "none";
  };
  reader.readAsDataURL(file);
});

// 🌐 Insertar imagen por URL
urlBtn.addEventListener("click", () => {
  modal.style.display = "none";
  const url = prompt("Ingresa la URL de la imagen");
  if (url) insertImage(url); // Inserta en el campo activo
});



//  Botón INSERTAR TABLA
document.getElementById('insert-table-btn').addEventListener('click', () => {
  const table = document.createElement('table');
  table.style.borderCollapse = 'collapse';

  for (let i = 0; i < 3; i++) {
    const row = document.createElement('tr');
    for (let j = 0; j < 3; j++) {
      const cell = document.createElement('td');
      cell.contentEditable = true;
	  cell.innerHTML = '&nbsp;'; // espacio inicial visible
      cell.style.border = '1px solid #ccc';
      cell.style.padding = '8px';
      row.appendChild(cell);
    }
    table.appendChild(row);
  }

  this.activeTarget.appendChild(table);
});



const toolbar = document.getElementById('quill-toolbar-actions');

toolbar.addEventListener('click', (e) => {
  const btn = e.target.closest('.quill-action');
  if (!btn || !this.activeQuillInstance) return;

  // Botones con estado persistente
  const togglableActions = ['bold', 'italic', 'underline'];

  if (btn.dataset.action && togglableActions.includes(btn.dataset.action)) {
    const isActive = btn.classList.contains('active');
    btn.classList.toggle('active', !isActive);

    const range = this.activeQuillInstance.getSelection();
    if (range) {
      this.activeQuillInstance.formatText(range.index, range.length, btn.dataset.action, !isActive);
    }
  } else {
    // Acción única: retroalimentación visual breve
    btn.classList.add('active');
    setTimeout(() => btn.classList.remove('active'), 1000);
  }
});

  

// 🔄 Estado de conexión
  window.addEventListener('online', () => this.updateOnlineStatus());
  window.addEventListener('offline', () => this.updateOnlineStatus());
}


showCancelFeedback() {
  const el = document.getElementById('cancel-feedback');
  if (el) {
    el.classList.remove('hidden');
    setTimeout(() => {
      el.classList.add('hidden');
    }, 2000);
  }
}


showSaveFeedback() {
  const el = document.getElementById('save-feedback');
  if (el) {
    el.classList.remove('hidden');
    setTimeout(() => {
      el.classList.add('hidden');
    }, 2000);
  }
}


 
  activateInPlaceEditing(targetElement) {
    // Primero, desactiva cualquier instancia anterior para guardar su contenido
    this.deactivateEditing();

    this.activeTarget = targetElement;

if (!targetElement.hasAttribute('data-original-content')) {
  targetElement.setAttribute('data-original-content', targetElement.innerHTML);
}


    // <-- 1. LA CORRECCIÓN CLAVE: Guarda el contenido actual ANTES de inicializar Quill.
    const initialContent = this.activeTarget.innerHTML;

    this.activeTarget.classList.add('editing-active');

    // Inicializa Quill en el elemento. En este punto, el contenido visual se borra temporalmente.
    this.activeQuillInstance = new Quill(this.activeTarget, {
      modules: {
        toolbar: '#quill-toolbar-container'
      },
      theme: 'snow'
    });

    // <-- 2. RESTAURACIÓN: Vuelve a colocar el contenido guardado dentro del editor ya activo.
    this.activeQuillInstance.root.innerHTML = initialContent;

    this.toolbarContainer.classList.remove('hidden');
    this.positionToolbar(targetElement);
    
    // Enfoca el editor y mueve el cursor al final del texto.
    this.activeQuillInstance.focus();
    this.activeQuillInstance.setSelection(this.activeQuillInstance.getLength(), 0);
  }

  positionToolbar(targetElement) {
    const targetRect = targetElement.getBoundingClientRect();
    const toolbarHeight = this.toolbarContainer.offsetHeight;
    
    // Posiciona la barra 5px por encima del elemento editable
    let topPosition = window.scrollY + targetRect.top - toolbarHeight - 5;
    
    // Si se sale por arriba de la pantalla, la coloca debajo
    if (topPosition < window.scrollY) {
        topPosition = window.scrollY + targetRect.bottom + 5;
    }

    this.toolbarContainer.style.top = `${topPosition}px`;
    this.toolbarContainer.style.left = `${window.scrollX + targetRect.left}px`;
  }

  deactivateEditing() {
    // <-- FUNCIÓN MEJORADA PARA MAYOR ESTABILIDAD
    if (this.activeTarget && this.activeQuillInstance) {
      // Obtiene el contenido final directamente desde la instancia de Quill
      const finalContent = this.activeQuillInstance.root.innerHTML;

      // Limpia completamente el div de las clases y atributos de Quill
      this.activeTarget.classList.remove('editing-active', 'ql-container', 'ql-snow');
      this.activeTarget.removeAttribute('contenteditable');
      
      // Restaura el contenido, "destruyendo" efectivamente la instancia de Quill
      // Si el contenido es el "párrafo en blanco" por defecto de Quill, lo guarda como vacío.
      this.activeTarget.innerHTML = (finalContent === '<p><br></p>') ? '' : finalContent;
    }

    // Resetea las variables de estado
    this.activeTarget = null;
    this.activeQuillInstance = null;
    
    // Oculta la barra de herramientas
    this.toolbarContainer.classList.add('hidden');
  }

  toggleEditing(enable) {
  this.isEditingEnabled = enable;
  document.body.classList.toggle('quill-read-only', !enable);

  if (enable) {
    this.toolbarContainer.classList.remove('hidden'); // ⚡ Mostrar barra
  } else {
    this.deactivateEditing();
    this.toolbarContainer.classList.add('hidden');     // ❌ Ocultar barra
  }
}

  saveAllTargetsToStorage() {
    const allTargets = document.querySelectorAll('.quill-target');
    const dataToSave = {};
    allTargets.forEach(target => {
      if (target.id) {
        const editorDiv = target.querySelector('.ql-editor');
        dataToSave[target.id] = editorDiv ? editorDiv.innerHTML : target.innerHTML;
      }
    });
    localStorage.setItem('quillHTMLContents', JSON.stringify(dataToSave));
  }

  loadAllTargetsFromStorage() {
    const savedData = JSON.parse(localStorage.getItem('quillHTMLContents'));
    if (!savedData) return;

    for (const id in savedData) {
      const targetElement = document.getElementById(id);
      if (targetElement) {
        targetElement.innerHTML = savedData[id];
      }
    }
  }

  updateOnlineStatus() {
    const isOnline = navigator.onLine;
    console.log(isOnline ? "🟢 Conexión restablecida." : "🔴 Estás offline. Los cambios se seguirán guardando localmente.");
    document.body.classList.toggle('offline', !isOnline);
  }
  
  handleTargetDeletion(target) {
  const index = this.instances.findIndex(instance => instance.id === target.id);
  if (index !== -1) {
    this.instances.splice(index, 1);
  }
}
  
}

// Iniciar el gestor
const quillManager = new QuillManager();

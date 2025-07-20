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
      if (e.target.closest('#quill-toolbar-container')) {
        return;
      }

      if (this.isEditingEnabled) {
        if (target) {
          if (this.activeTarget !== target) {
            this.activateInPlaceEditing(target);
          }
        } else {
          this.deactivateEditing();
        }
      }
    });
    
    window.addEventListener('online', () => this.updateOnlineStatus());
    window.addEventListener('offline', () => this.updateOnlineStatus());
  }

  activateInPlaceEditing(targetElement) {
    // Primero, desactiva cualquier instancia anterior para guardar su contenido
    this.deactivateEditing();

    this.activeTarget = targetElement;

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

    if (!enable) {
      this.deactivateEditing();
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
}

// Iniciar el gestor
const quillManager = new QuillManager();
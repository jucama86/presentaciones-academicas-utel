// js/presentacion.js

document.addEventListener("DOMContentLoaded", () => {
  // ------------------- INICIALIZACIÓN -------------------
  cargarSlidesDinamicas(); 

  let sections = document.querySelectorAll("section");
  const intro = document.querySelector(".intro-slide");
  const contador = document.getElementById("contador-paginas");
  const navegador = document.querySelector(".navegador-centro");
  const flechaPrev = document.getElementById("flecha-previa");
  const flechaNext = document.getElementById("flecha-siguiente");
  const botonComenzar = document.getElementById("boton-comenzar");
  const botonReinicio = document.getElementById("reiniciar-presentacion");
  const botonMenu = document.getElementById("boton-menu");
  const menuIndice = document.getElementById("menu-indice");
  const footer = document.querySelector(".footer-utel");
  let current = -1; // -1 = Bienvenida

  // Elementos del modal "Agregar Página"
  const modalAdd = document.getElementById("modal-add-page");
  const btnCloseModal = document.getElementById("btn-close-modal");
  const btnCancelModal = document.getElementById("btn-cancel");
  const btnConfirmModal = document.getElementById("btn-confirm");
  const tipoSelect = document.getElementById("tipo-slide");
  const posSelect = document.getElementById("posicion-slide");
  const contentTextarea = document.getElementById("contenido-slide");
  const indiceAdd = document.getElementById("indice-add-page");
  const toggleEditSwitch = document.getElementById('toggle-edit-mode');

  // ------------------- FUNCIONES NÚCLEO -------------------
  function actualizarContador() {
    contador.textContent = `${current + 1} / ${sections.length}`;
  }

  function reconstruirIndice() {
    const ul = menuIndice.querySelector("ul");
    ul.innerHTML = "";
    sections.forEach((sl, i) => {
      const title = sl.dataset.titulo || `Página ${i + 1}`;
      if (title === 'Final') return;

      const li = document.createElement("li");
      li.textContent = title;
      li.onclick = () => {
        showSlide(i);
        menuIndice.classList.remove("activo");
      };

      if (sl.dataset.dynamic === "true") {
        const btnDel = document.createElement("button");
        btnDel.textContent = "🗑️";
        btnDel.className = "btn-delete-slide";
        btnDel.onclick = e => {
          e.stopPropagation();
          if (confirm(`¿Seguro que quieres borrar la página "${title}"?`)) {
            const target = sl.querySelector('.quill-target');
            if(target) {
              quillManager.handleTargetDeletion(target);
            }
            sl.remove();
            
            sections = document.querySelectorAll("section");
            reconstruirIndice();
            guardarSlidesDinamicas(); // Guarda la nueva estructura de slides
            quillManager.saveAllTargetsToStorage(); // Guarda los contenidos restantes

            if (current >= sections.length - 1) {
              showSlide(sections.length - 2);
            } else {
              showSlide(current);
            }
          }
        };
        li.appendChild(btnDel);
      }
      ul.appendChild(li);
    });
  }

  function showSlide(index) {
    const esIntro = index === -1;
    const esFinal = sections[index]?.classList.contains("slide-final");

    intro.style.display = esIntro ? "flex" : "none";
    sections.forEach((s, i) => s.classList.toggle("active", i === index));
    current = index;
    actualizarContador();

    const shouldShowControls = !esIntro && !esFinal;
    navegador.style.display = shouldShowControls ? "flex" : "none";
    contador.style.display = shouldShowControls ? "block" : "none";
    botonMenu.style.display = shouldShowControls ? "block" : "none";
    menuIndice.style.display = shouldShowControls ? "block" : "none";
    footer.style.display = shouldShowControls ? "block" : "none";

    menuIndice.classList.remove("activo");
  }

  // ------------------- MANEJO DE EVENTOS -------------------
  flechaPrev?.addEventListener("click", () => current > 0 && showSlide(current - 1));
  flechaNext?.addEventListener("click", () => current < sections.length - 1 && showSlide(current + 1));
  document.addEventListener("keydown", e => {
    if (e.target.closest('.ql-editor')) return; // No navegar si se escribe en el editor
    if(e.key === "ArrowRight" && current < sections.length - 1) showSlide(current + 1);
    if(e.key === "ArrowLeft" && current > -1) showSlide(current - 1);
    if(e.key === "Escape") [modalAdd, document.getElementById('modal-evaluacion')].forEach(m => m?.classList.add("hidden"));
  });

  botonComenzar?.addEventListener("click", () => showSlide(0));
  botonReinicio?.addEventListener("click", () => {
    quillManager.deactivateEditing();
    showSlide(-1)
  });
  botonMenu?.addEventListener("click", e => { e.stopPropagation(); menuIndice.classList.toggle("activo"); });
  document.addEventListener("click", e => { if (!menuIndice.contains(e.target) && !botonMenu.contains(e.target)) menuIndice.classList.remove("activo"); });
  
  toggleEditSwitch.addEventListener('change', (e) => {
    quillManager.toggleEditing(e.target.checked);
  });

  // Lógica del Modal "Agregar Página"
  indiceAdd.addEventListener("click", () => {
    posSelect.innerHTML = "";
    document.querySelectorAll("section:not(.slide-final)").forEach((sl, i) => {
        const opt = document.createElement("option");
        opt.value = i;
        opt.text = `${i + 1}. ${sl.dataset.titulo}`;
        posSelect.append(opt);
    });
    posSelect.selectedIndex = sections.length - 2;
    modalAdd.classList.remove("hidden");
    menuIndice.classList.remove("activo");
  });

  const closeModal = () => modalAdd.classList.add("hidden");
  btnCloseModal.addEventListener("click", closeModal);
  btnCancelModal.addEventListener("click", closeModal);
  
  btnConfirmModal.addEventListener("click", () => {
    const tipo = tipoSelect.value;
    const afterIndex = parseInt(posSelect.value, 10);
    const texto = contentTextarea.value.trim();
    if (!texto) return;

    const tpl = document.getElementById("template-slide");
    const clone = tpl.content.cloneNode(true);
    const newSlide = clone.querySelector("section");
    const targetDiv = newSlide.querySelector(".quill-target");
    
    targetDiv.id = `content-dynamic-${Date.now()}`;
    targetDiv.innerHTML = `<p>${texto.replace(/\n/g, '<br>')}</p>`;
    
    newSlide.dataset.titulo = tipo;
    newSlide.querySelector(".shape-seccion").textContent = tipo;
    newSlide.querySelector("h2").textContent = tipo;
    
    sections[afterIndex].after(newSlide);
    
    contentTextarea.value = "";
    sections = document.querySelectorAll("section");
    reconstruirIndice();
    guardarSlidesDinamicas();
    closeModal();
    showSlide(afterIndex + 1);
  });

  // ------------------- ARRANQUE -------------------
  reconstruirIndice();
  showSlide(-1); // Empezar en la bienvenida
});
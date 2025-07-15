// js/presentacion.js

document.addEventListener("DOMContentLoaded", () => {
  // ------------------- LÓGICA DE PERSISTENCIA DE ESTRUCTURA -------------------
  
  function guardarEstructuraDinamica() {
    const slidesDinamicas = document.querySelectorAll('section[data-dynamic="true"]');
    const datosEstructura = Array.from(slidesDinamicas).map(slide => {
      const prevSlide = slide.previousElementSibling;
      return {
        titulo: slide.dataset.titulo,
        // Guardamos el título del slide anterior para saber dónde insertarlo
        after: prevSlide ? prevSlide.dataset.titulo : null 
      };
    });
    localStorage.setItem('estructuraDinamicaEnsayo', JSON.stringify(datosEstructura));
  }
  
  function cargarEstructuraDinamica() {
    const datosGuardados = JSON.parse(localStorage.getItem('estructuraDinamicaEnsayo'));
    if (!datosGuardados || datosGuardados.length === 0) return;
  
    const tpl = document.getElementById('template-slide');
  
    datosGuardados.forEach(dato => {
      if (!tpl) return;
      const clone = tpl.content.cloneNode(true);
      const sl = clone.querySelector("section");
      sl.dataset.titulo = dato.titulo;
      sl.querySelector(".shape-seccion").textContent = dato.titulo;
      
      const insertAfterNode = document.querySelector(`section[data-titulo="${dato.after}"]`);
      if (insertAfterNode) {
        insertAfterNode.after(sl);
      } else { // Si no encontramos el nodo, lo agregamos antes de Agradecimientos
        document.querySelector('section[data-titulo="Agradecimientos"]').before(sl);
      }
    });
  }

  // ------------------- INICIALIZACIÓN -------------------
  cargarEstructuraDinamica(); // Cargar primero las diapositivas guardadas

  // Elementos principales (se seleccionan después de cargar las dinámicas)
  let sections = document.querySelectorAll("section");
  const intro = document.querySelector(".intro-slide");
  const contador = document.getElementById("contador-paginas");
  const navegador = document.querySelector(".navegador-centro");
  const flechaPrev = document.getElementById("flecha-previa");
  const flechaNext = document.getElementById("flecha-siguiente");
  const botonComenzar = document.getElementById("boton-comenzar");
  const botonReinicio = document.getElementById("reiniciar-presentacion");
  const botonMenu = document.getElementById("boton-menu");
  const btnActivarEdicion = document.getElementById("indice-editar-contenido");
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
      li.onclick = () => showSlide(i);

      if (sl.dataset.dynamic === "true") {
        const btnDel = document.createElement("button");
        btnDel.textContent = "🗑️";
        btnDel.className = "btn-delete-slide";
        btnDel.onclick = e => {
          e.stopPropagation();
          if (confirm(`¿Seguro que quieres borrar la página "${title}"?`)) {
            // También eliminar su contenido de localStorage
            const claveContenido = `contenido-utel-${sl.dataset.titulo}`;
            localStorage.removeItem(claveContenido);
            
            sl.remove();
            sections = document.querySelectorAll("section"); // Re-cachear las secciones
            reconstruirIndice();
            guardarEstructuraDinamica();
            if (current >= sections.length -1) showSlide(sections.length - 2);
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

    navegador.style.display = esIntro || esFinal ? "none" : "flex";
    contador.style.display = esIntro || esFinal ? "none" : "block";
    botonMenu.style.display = esIntro || esFinal ? "none" : "block";
    menuIndice.style.display = esIntro || esFinal ? "none" : "block";
    footer.style.display = esIntro || esFinal ? "none" : "block";

    menuIndice.classList.remove("activo");
  }

  // ------------------- MANEJO DE EVENTOS -------------------
  flechaPrev?.addEventListener("click", () => current > 0 && showSlide(current - 1));
  flechaNext?.addEventListener("click", () => current < sections.length - 1 && showSlide(current + 1));
  document.addEventListener("keydown", e => {
    if (modalAdd.classList.contains('hidden')) { // Evitar navegación mientras el modal está abierto
      if(e.key === "ArrowRight" && current < sections.length - 1) showSlide(current + 1);
      if(e.key === "ArrowLeft" && current > -1) showSlide(current - 1);
    }
    if(e.key === "Escape") [modalAdd, document.getElementById('modal-evaluacion')].forEach(m => m?.classList.add("hidden"));
  });

  botonComenzar?.addEventListener("click", () => showSlide(0));
  botonReinicio?.addEventListener("click", () => showSlide(-1));
  botonMenu?.addEventListener("click", e => { e.stopPropagation(); menuIndice.classList.toggle("activo"); });
  document.addEventListener("click", e => { if (!menuIndice.contains(e.target) && !botonMenu.contains(e.target)) menuIndice.classList.remove("activo"); });
  
  btnActivarEdicion?.addEventListener("click", () => {
    // La función activarEditorUTEL está en editor-tiptap-v2.js y es global
    if (typeof activarEditorUTEL === "function") {
        activarEditorUTEL();
        alert("Modo de edición activado.\nPuedes hacer clic en cualquier texto para editarlo.");
    } else {
        alert("Error: La función del editor no está disponible.");
    }
    menuIndice.classList.remove("activo");
  });

  // Lógica del Modal "Agregar Página"
  indiceAdd.addEventListener("click", () => {
    posSelect.innerHTML = "";
    document.querySelectorAll("section:not(.slide-final)").forEach((sl, i) => {
        const opt = document.createElement("option");
        opt.value = sl.dataset.titulo; // Usar el título como valor
        opt.text = `${i + 1}. ${sl.dataset.titulo}`;
        posSelect.append(opt);
    });
    posSelect.selectedIndex = sections.length - 2; // Pre-seleccionar la penúltima
    modalAdd.classList.remove("hidden");
    menuIndice.classList.remove("activo");
  });

  const closeModal = () => modalAdd.classList.add("hidden");
  btnCloseModal.addEventListener("click", closeModal);
  btnCancelModal.addEventListener("click", closeModal);
  
  btnConfirmModal.addEventListener("click", () => {
    const tipo = tipoSelect.value;
    const afterTitle = posSelect.value;
    const html = contentTextarea.value.trim().replace(/\n/g, '<br>');
    if (!html) {
      alert("El contenido no puede estar vacío.");
      return;
    }

    const tpl = document.getElementById("template-slide");
    const clone = tpl.content.cloneNode(true);
    const sl = clone.querySelector("section");
    // Usar un título único si es necesario, por ejemplo, añadiendo un timestamp
    sl.dataset.titulo = `${tipo} (${Date.now()})`; 
    sl.querySelector(".shape-seccion").textContent = tipo;
    sl.querySelector(".editable-content").innerHTML = `<h2>${tipo}</h2><p>${html}</p>`;
    
    const afterNode = document.querySelector(`section[data-titulo="${afterTitle}"]`);
    const afterIndex = Array.from(sections).indexOf(afterNode);

    afterNode.after(sl);
    
    sections = document.querySelectorAll("section"); // Actualizar caché de secciones
    reconstruirIndice();
    guardarEstructuraDinamica(); // Guardar la nueva estructura
    closeModal();
    showSlide(afterIndex + 1);
  });

  // ------------------- ARRANQUE -------------------
  reconstruirIndice();
  showSlide(-1); // Empezar en la bienvenida
});
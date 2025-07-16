// js/presentacion.js

document.addEventListener("DOMContentLoaded", () => {
  // ------------------- LÓGICA DE PERSISTENCIA DE ESTRUCTURA -------------------
  
  function guardarEstructuraDinamica() {
    const slidesDinamicas = document.querySelectorAll('section[data-dynamic="true"]');
    const datosEstructura = Array.from(slidesDinamicas).map(slide => {
      const prevSlide = slide.previousElementSibling;
      return {
        titulo: slide.dataset.titulo,
        after: prevSlide ? prevSlide.dataset.titulo : null
      };
    });
    localStorage.setItem('estructuraDinamicaEnsayo', JSON.stringify(datosEstructura));
  }
  
  function cargarEstructuraDinamica() {
    try {
      const datosGuardados = JSON.parse(localStorage.getItem('estructuraDinamicaEnsayo'));
      if (!datosGuardados || datosGuardados.length === 0) return;
    
      const tpl = document.getElementById('template-slide');
    
      datosGuardados.forEach(dato => {
        if (!tpl) return;
        const clone = tpl.content.cloneNode(true);
        const sl = clone.querySelector("section");
        sl.dataset.titulo = dato.titulo;
        sl.querySelector(".shape-seccion").textContent = dato.titulo.split('(')[0].trim(); // Muestra el título limpio
        
        const insertAfterNode = document.querySelector(`section[data-titulo="${dato.after}"]`);
        if (insertAfterNode) {
          insertAfterNode.after(sl);
        } else {
          document.querySelector('section[data-titulo="Agradecimientos"]').before(sl);
        }
      });
    } catch (e) {
      console.error("Error al cargar la estructura dinámica:", e);
      localStorage.removeItem('estructuraDinamicaEnsayo'); // Limpiar datos corruptos
    }
  }

  // ------------------- INICIALIZACIÓN -------------------
  cargarEstructuraDinamica(); 

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
  const btnActivarEdicion = document.getElementById("indice-editar-contenido"); // <-- Se captura el botón
  const menuIndice = document.getElementById("menu-indice");
  const footer = document.querySelector(".footer-utel");
  let current = -1;

  // Elementos del modal "Agregar Página" (sin cambios)
  const modalAdd = document.getElementById("modal-add-page");
  // ... (resto de elementos del modal sin cambios)

  // ------------------- FUNCIONES NÚCLEO (sin cambios) -------------------
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
      li.textContent = title.split('(')[0].trim();
      li.onclick = () => showSlide(i);

      if (sl.dataset.dynamic === "true") {
        const btnDel = document.createElement("button");
        btnDel.textContent = "🗑️";
        btnDel.className = "btn-delete-slide";
        btnDel.onclick = e => {
          e.stopPropagation();
          if (confirm(`¿Seguro que quieres borrar la página "${title}"?`)) {
            const claveContenido = `contenido-utel-${sl.dataset.titulo}`;
            localStorage.removeItem(claveContenido);
            sl.remove();
            sections = document.querySelectorAll("section");
            reconstruirIndice();
            guardarEstructuraDinamica();
            if (current >= sections.length - 1) showSlide(sections.length - 2);
            else showSlide(current);
          }
        };
        li.appendChild(btnDel);
      }
      ul.appendChild(li);
    });
  }

  function showSlide(index) {
     // ... (función sin cambios)
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
  // ... (otros eventos sin cambios)
  flechaPrev?.addEventListener("click", () => current > 0 && showSlide(current - 1));
  flechaNext?.addEventListener("click", () => current < sections.length - 1 && showSlide(current + 1));
  document.addEventListener("keydown", e => {
    if (modalAdd.classList.contains('hidden')) {
      if(e.key === "ArrowRight" && current < sections.length - 1) showSlide(current + 1);
      if(e.key === "ArrowLeft" && current > -1) showSlide(current - 1);
    }
    if(e.key === "Escape") [document.getElementById("modal-add-page"), document.getElementById('modal-evaluacion')].forEach(m => m?.classList.add("hidden"));
  });
  botonComenzar?.addEventListener("click", () => showSlide(0));
  botonReinicio?.addEventListener("click", () => showSlide(-1));
  botonMenu?.addEventListener("click", e => { e.stopPropagation(); menuIndice.classList.toggle("activo"); });
  document.addEventListener("click", e => { if (!menuIndice.contains(e.target) && !botonMenu.contains(e.target)) menuIndice.classList.remove("activo"); });

  // ✅ ¡CAMBIO CLAVE AQUÍ!
  btnActivarEdicion?.addEventListener("click", () => {
    if (typeof activarEditorUTEL === "function") {
        // La función viene del script editor-tiptap-v2.js
        activarEditorUTEL(); 
        btnActivarEdicion.textContent = "✏️ Edición Activada";
        btnActivarEdicion.style.pointerEvents = "none"; // Deshabilitar después del primer clic
        alert("Modo de edición activado.\nAhora puedes hacer clic en cualquier texto para editarlo.");
    } else {
        alert("Error: La función del editor no está disponible. Revisa la consola (F12).");
    }
    menuIndice.classList.remove("activo");
  });

  // Lógica del Modal "Agregar Página" (sin cambios, pero con las correcciones de antes)
  // ...

  // ------------------- ARRANQUE -------------------
  reconstruirIndice();
  showSlide(-1); 
});

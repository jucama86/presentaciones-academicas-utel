// js/autoguardado.js

/**
 * Guarda el contenido de todas las diapositivas dinámicas en localStorage.
 */
function guardarSlidesDinamicas() {
  const slidesDinamicas = document.querySelectorAll('section[data-dynamic="true"]');
  const datosParaGuardar = Array.from(slidesDinamicas).map(slide => {
    return {
      titulo: slide.dataset.titulo,
      contenido: slide.querySelector('.slide-content').innerHTML
    };
  });
  localStorage.setItem('slidesDinamicasEnsayo', JSON.stringify(datosParaGuardar));
}

/**
 * Carga las diapositivas guardadas desde localStorage y las reinserta en la página.
 */
function cargarSlidesDinamicas() {
  const datosGuardados = JSON.parse(localStorage.getItem('slidesDinamicasEnsayo'));
  if (!datosGuardados || datosGuardados.length === 0) {
    return; // No hay nada que cargar
  }

  const ultimaSlideFija = document.querySelector('section[data-titulo="Referencias"]');
  const tpl = document.getElementById('template-slide');

  datosGuardados.forEach(dato => {
    const clone = tpl.content.cloneNode(true);
    const sl = clone.querySelector("section");
    sl.dataset.titulo = dato.titulo;
    sl.querySelector(".shape-seccion").textContent = dato.titulo;
    sl.querySelector("h2").textContent = dato.titulo;
    sl.querySelector(".slide-content").innerHTML = dato.contenido;
    
    // Inserta la diapositiva cargada después de la última conocida
    // (Esto puede necesitar ajuste si se quieren guardar en posiciones exactas)
    ultimaSlideFija.after(sl);
  });
}
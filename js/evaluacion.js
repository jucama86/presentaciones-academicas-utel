// js/evaluacion.js

document.addEventListener("DOMContentLoaded", () => {
  const btnEval = document.getElementById("btn-evaluacion");
  const modalEval = document.getElementById("modal-evaluacion");
  const cerrarEval = document.getElementById("cerrar-evaluacion");
  const guardarEval = document.getElementById("guardar-evaluacion");
  const comentario = document.getElementById("comentario-profesor");
  const nota = document.getElementById("nota-final");
  const panelEval = document.getElementById("evaluacion-final");
  const comentarioVis = document.getElementById("comentario-visible");
  const notaVis = document.getElementById("nota-visible");
  const nombreVis = document.getElementById("evaluado-por");
  const fechaVis = document.getElementById("fecha-evaluacion");

  const tituloProfesor = Array.from(document.querySelectorAll(".campo-titulo")).find(el => el.textContent.trim().toLowerCase() === "profesor");
  const nombreProfesor = tituloProfesor?.nextElementSibling?.textContent.trim() || "Profesor UTEL";

  function cargarEvaluacion() {
    const datos = JSON.parse(localStorage.getItem("evaluacionEnsayo"));
    if (datos) {
      panelEval.classList.remove("hidden");
      comentarioVis.textContent = datos.comentario;
      notaVis.textContent = datos.nota;
      nombreVis.textContent = datos.profesor;
      fechaVis.textContent = datos.fecha;
      btnEval.textContent = "Ver calificación";
    }
  }
  
  btnEval?.addEventListener("click", () => {
      modalEval.classList.remove("hidden");
  });
  
  cerrarEval?.addEventListener("click", () => modalEval.classList.add("hidden"));
  
  guardarEval?.addEventListener("click", () => {
    if(nota.value === "") {
        alert("Por favor, ingresa una calificación.");
        return;
    }
    const fechaEvaluacion = new Date().toLocaleString("es-MX", { dateStyle: "long", timeStyle: "short" });
    const registro = {
      comentario: comentario.value.trim(),
      nota: nota.value,
      profesor: nombreProfesor,
      fecha: fechaEvaluacion,
    };
    localStorage.setItem("evaluacionEnsayo", JSON.stringify(registro));
    modalEval.classList.add("hidden");
    cargarEvaluacion();
  });

  // Cargar al iniciar
  cargarEvaluacion();
});
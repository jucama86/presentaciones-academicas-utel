function calcularFinalEvaluacion() {
  const contenido    = parseFloat(document.getElementById('contenido').value) || 0;
  const organizacion = parseFloat(document.getElementById('organizacion').value) || 0;
  const fuentes      = parseFloat(document.getElementById('fuentes').value) || 0;
  const apa          = parseFloat(document.getElementById('apa').value) || 0;

  const modo = document.getElementById('modoCalculo')?.value || 'promedio';
  let resultado = modo === 'promedio'
    ? (contenido + organizacion + fuentes + apa) / 4
    : contenido + organizacion + fuentes + apa;

  document.getElementById('finalScore').value = resultado.toFixed(2);
}

function mostrarFechaEvaluacion() {
  const hoy = new Date();
  const fecha = hoy.toLocaleDateString('es-MX', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
  const hora = hoy.toLocaleTimeString('es-MX', {
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
  });
  document.getElementById('fechaEvaluacion').textContent = `${fecha} | ${hora}`;
}

window.addEventListener('DOMContentLoaded', () => {
  ['contenido', 'organizacion', 'fuentes', 'apa', 'modoCalculo'].forEach(id => {
    const campo = document.getElementById(id);
    if (campo) {
      campo.addEventListener('input', calcularFinalEvaluacion);
    }
  });

  calcularFinalEvaluacion();
  mostrarFechaEvaluacion();
});

function guardarEvaluacionFirebase(profesorId, semana) {
  const evaluacion = {
    contenido: document.getElementById("contenido").value,
    organizacion: document.getElementById("organizacion").value,
    fuentes: document.getElementById("fuentes").value,
    apa: document.getElementById("apa").value,
    notaFinal: document.getElementById("finalScore").value,
    retroalimentacion: document.getElementById("retro").value,
    fecha: new Date().toISOString(),
  };

  db.ref(`evaluaciones/${profesorId}/${semana}`).set(evaluacion);
}

function cargarEvaluacionFirebase(profesorId, semana) {
  db.ref(`evaluaciones/${profesorId}/${semana}`).once("value").then(snapshot => {
    const datos = snapshot.val();
    if (datos) {
      document.getElementById("contenido").value = datos.contenido;
      document.getElementById("organizacion").value = datos.organizacion;
      document.getElementById("fuentes").value = datos.fuentes;
      document.getElementById("apa").value = datos.apa;
      document.getElementById("finalScore").value = datos.notaFinal;
      document.getElementById("retro").value = datos.retroalimentacion;
      document.getElementById("fechaEvaluacion").textContent = new Date(datos.fecha).toLocaleDateString();
    }
  });
}

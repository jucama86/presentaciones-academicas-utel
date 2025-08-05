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

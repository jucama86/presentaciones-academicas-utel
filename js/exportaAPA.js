// js/exportaAPA.js

document.addEventListener("DOMContentLoaded", () => {
  const btnExportarAPA = document.getElementById("exportar-apa-btn");

  btnExportarAPA?.addEventListener("click", () => {
    const seccionReferencias = document.querySelector('section[data-titulo="Referencias"]');
    if (!seccionReferencias) {
      alert("No se encontró la sección de referencias.");
      return;
    }

    const listaItems = seccionReferencias.querySelectorAll("ul li");
    if (listaItems.length === 0) {
      alert("No hay referencias para exportar.");
      return;
    }

    // Formatear el texto
    let textoReferencias = "Referencias\n\n";
    listaItems.forEach(item => {
      textoReferencias += `- ${item.innerText}\n`;
    });

    // Crear y descargar el archivo
    const blob = new Blob([textoReferencias], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "referencias-ensayo.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  });
});
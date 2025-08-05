function updateConnectionStatus(status) {
  const el = document.getElementById('connectionStatus');
  if (!el) return;

  el.className = 'connection-status aeroglass ' + status;

  const icon = el.querySelector('i');
  const text = el.querySelector('span');

  switch (status) {
    case 'online':
      icon.style.color = '#00FF00';
      text.textContent = 'En línea';
      break;
    case 'offline':
      icon.style.color = '#2f2f2f';
      text.textContent = 'Sin conexión';
      break;
    case 'syncing':
      icon.style.color = '#2563eb';
      text.textContent = 'Sincronizando...';
      break;
  }
}

// ✅ Ejecutar al iniciar
updateConnectionStatus(navigator.onLine ? 'online' : 'offline');

// ✅ Eventos de navegador
window.addEventListener('offline', () => updateConnectionStatus('offline'));
window.addEventListener('online', () => {
  updateConnectionStatus('syncing');
  setTimeout(() => updateConnectionStatus('online'), 1500);
});

// ✅ Verificación activa cada 2 segundos (por si el evento no se lanza)
setInterval(() => {
  const estado = navigator.onLine ? 'online' : 'offline';
  updateConnectionStatus(estado);
}, 2000);

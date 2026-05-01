(async () => {
  const status = document.getElementById('shell-status');

  if (!status) {
    return;
  }

  if (!window.swarm || typeof window.swarm.getAppInfo !== 'function') {
    status.textContent = 'bridge missing';
    return;
  }

  try {
    const info = await window.swarm.getAppInfo();
    status.textContent = info.status || 'ready';
  } catch (error) {
    status.textContent = 'bridge error';
  }
})();

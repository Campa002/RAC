/* ── Constantes ──────────────────────────────── */
  const DB_NAME    = 'RAC_Reportes';
  const DB_VERSION = 1;
  const STORE_NAME = 'clasificaciones';

  const CAT_CONFIG = {
    'Electrónico':         { icon: 'fa-solid fa-microchip',            color: '#6366f1' },
    'Desechable':          { icon: 'fa-solid fa-wine-bottle',           color: '#f59e0b' },
    'Reciclable liviano':  { icon: 'fa-solid fa-recycle',               color: '#3ab54a' },
    'Orgánico':            { icon: 'fa-solid fa-leaf',                  color: '#a16207' },
    'Metal':               { icon: 'fa-solid fa-gear',                  color: '#64748b' },
    'Contingencia':        { icon: 'fa-solid fa-triangle-exclamation',  color: '#e11d48' },
  };

  /* ── Referencias al DOM ──────────────────────── */
  const ui = {
    form:           document.getElementById('formReporte'),
    operario:       document.getElementById('operario'),
    fechaHora:      document.getElementById('fechaHora'),
    cantidad:       document.getElementById('cantidad'),
    modo:           document.getElementById('modo'),
    confianza:      document.getElementById('confianza'),
    confLabel:      document.getElementById('confLabel'),
    confBar:        document.getElementById('confBar'),
    observaciones:  document.getElementById('observaciones'),
    btnGuardar:     document.getElementById('btnGuardar'),
    btnLimpiar:     document.getElementById('btnLimpiar'),
    btnLimpiarTodo: document.getElementById('btnLimpiarTodo'),
    histContainer:  document.getElementById('historialContainer'),
    histCount:      document.getElementById('histCount'),
    toast:          document.getElementById('toast'),
    statTotal:      document.getElementById('statTotal'),
    statHoy:        document.getElementById('statHoy'),
    statProm:       document.getElementById('statProm'),
  };

  /* ── IndexedDB ───────────────────────────────── */
  let db = null;

  function abrirDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const database = event.target.result;
        if (!database.objectStoreNames.contains(STORE_NAME)) {
          database.createObjectStore(STORE_NAME, {
            keyPath: 'id',
            autoIncrement: true,
          });
        }
      };

      request.onsuccess  = (event) => resolve(event.target.result);
      request.onerror    = (event) => reject(event.target.error);
    });
  }

  function guardarRegistro(registro) {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store       = transaction.objectStore(STORE_NAME);
      const request     = store.add(registro);
      request.onsuccess = () => resolve(request.result);
      request.onerror   = () => reject(request.error);
    });
  }

  function obtenerTodosLosRegistros() {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store       = transaction.objectStore(STORE_NAME);
      const request     = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror   = () => reject(request.error);
    });
  }

  function eliminarRegistro(id) {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store       = transaction.objectStore(STORE_NAME);
      const request     = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror   = () => reject(request.error);
    });
  }

  function limpiarTodosLosRegistros() {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store       = transaction.objectStore(STORE_NAME);
      const request     = store.clear();
      request.onsuccess = () => resolve();
      request.onerror   = () => reject(request.error);
    });
  }

  /* ── Lectura del formulario ──────────────────── */
  function leerCategoriaSeleccionada() {
    const checked = document.querySelector('input[name="categoria"]:checked');
    return checked ? checked.value : null;
  }

  function leerFormulario() {
    return {
      operario:      ui.operario.value.trim(),
      fechaHora:     ui.fechaHora.value,
      categoria:     leerCategoriaSeleccionada(),
      cantidad:      parseInt(ui.cantidad.value, 10),
      modo:          ui.modo.value,
      confianza:     parseInt(ui.confianza.value, 10),
      observaciones: ui.observaciones.value.trim(),
      guardadoEn:    new Date().toISOString(),
    };
  }

  function validarFormulario(datos) {
    if (!datos.operario)   return 'Ingresá el nombre del operario o sector.';
    if (!datos.fechaHora)  return 'Seleccioná la fecha y hora del turno.';
    if (!datos.categoria)  return 'Seleccioná una categoría de residuo.';
    if (!datos.cantidad || datos.cantidad < 1) return 'Ingresá una cantidad válida.';
    if (!datos.modo)       return 'Seleccioná el modo de operación.';
    return null;
  }

  function limpiarFormulario() {
    ui.form.reset();
    const checked = document.querySelector('input[name="categoria"]:checked');
    if (checked) checked.checked = false;
    actualizarConfianza(75);
    setFechaHoraActual();
  }

  /* ── Renderizado del historial ───────────────── */
  function renderizarHistorial(registros) {
    ui.histCount.textContent = `${registros.length} registro${registros.length !== 1 ? 's' : ''}`;

    if (registros.length === 0) {
      ui.histContainer.innerHTML = `
        <div class="history-empty">
          <i class="fa-regular fa-clipboard"></i>
          Aún no hay registros guardados.<br>Completá el formulario para empezar.
        </div>`;
      return;
    }

    const lista = registros
      .slice()
      .reverse()
      .map(r => crearItemHistorial(r))
      .join('');

    ui.histContainer.innerHTML = `<div class="history-list">${lista}</div>`;

    ui.histContainer.querySelectorAll('.item-delete').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = parseInt(btn.dataset.id, 10);
        await eliminarRegistro(id);
        await refrescarVista();
        mostrarToast('Registro eliminado', 'error');
      });
    });
  }

  function crearItemHistorial(r) {
    const cat    = CAT_CONFIG[r.categoria] || { icon: 'fa-solid fa-question', color: '#999' };
    const fecha  = new Date(r.guardadoEn).toLocaleString('es-AR', {
      day: '2-digit', month: '2-digit', year: '2-digit',
      hour: '2-digit', minute: '2-digit',
    });

    return `
      <div class="history-item">
        <div class="item-cat-badge" style="background:${cat.color}22;color:${cat.color}">
          <i class="${cat.icon}"></i>
        </div>
        <div class="item-body">
          <div class="item-operario">${escapar(r.operario)}</div>
          <div class="item-meta">${r.categoria} · ${r.modo} · ${fecha}</div>
          ${r.observaciones ? `<div class="item-meta" style="margin-top:2px;font-family:var(--font-body)">${escapar(r.observaciones)}</div>` : ''}
        </div>
        <div class="item-right">
          <div class="item-cantidad">${r.cantidad} u.</div>
          <div class="item-conf">IA: ${r.confianza}%</div>
        </div>
        <button class="item-delete" data-id="${r.id}" title="Eliminar registro">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>`;
  }

  /* ── Stats ───────────────────────────────────── */
  function actualizarStats(registros) {
    const hoy = new Date().toDateString();
    const registrosHoy = registros.filter(r =>
      new Date(r.guardadoEn).toDateString() === hoy
    );

    const promConf = registros.length
      ? Math.round(registros.reduce((acc, r) => acc + r.confianza, 0) / registros.length)
      : null;

    ui.statTotal.textContent = registros.length;
    ui.statHoy.textContent   = registrosHoy.length;
    ui.statProm.textContent  = promConf !== null ? `${promConf}%` : '—';
  }

  /* ── Helpers ─────────────────────────────────── */
  function actualizarConfianza(valor) {
    ui.confianza.value        = valor;
    ui.confLabel.textContent  = `${valor}%`;
    ui.confBar.style.width    = `${valor}%`;

    let color = '#3ab54a';
    if (valor < 40) color = '#e11d48';
    else if (valor < 70) color = '#f59e0b';
    ui.confBar.style.background = color;
    ui.confLabel.style.color    = color;
  }

  function setFechaHoraActual() {
    const now    = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    const local  = new Date(now - offset).toISOString().slice(0, 16);
    ui.fechaHora.value = local;
  }

  function mostrarToast(mensaje, tipo = 'success') {
    ui.toast.textContent = mensaje;
    ui.toast.className   = `toast ${tipo} show`;
    setTimeout(() => { ui.toast.className = 'toast'; }, 2800);
  }

  function escapar(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  async function refrescarVista() {
    const registros = await obtenerTodosLosRegistros();
    renderizarHistorial(registros);
    actualizarStats(registros);
  }

  /* ── Handlers de eventos ─────────────────────── */
  ui.confianza.addEventListener('input', () => {
    actualizarConfianza(parseInt(ui.confianza.value, 10));
  });

  ui.form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const datos = leerFormulario();
    const error = validarFormulario(datos);

    if (error) {
      mostrarToast(error, 'error');
      return;
    }

    try {
      await guardarRegistro(datos);
      await refrescarVista();
      limpiarFormulario();
      mostrarToast('Registro guardado en IndexedDB');
    } catch (err) {
      mostrarToast('Error al guardar. Revisá la consola.', 'error');
      console.error('IndexedDB error:', err);
    }
  });

  ui.btnLimpiar.addEventListener('click', limpiarFormulario);

  ui.btnLimpiarTodo.addEventListener('click', async () => {
    if (!confirm('¿Borrar todos los registros de IndexedDB? Esta acción no se puede deshacer.')) return;
    await limpiarTodosLosRegistros();
    await refrescarVista();
    mostrarToast('Historial limpiado', 'error');
  });

  /* ── Inicialización ──────────────────────────── */
  (async () => {
    try {
      db = await abrirDB();
      setFechaHoraActual();
      await refrescarVista();
    } catch (err) {
      mostrarToast('No se pudo abrir IndexedDB.', 'error');
      console.error('IndexedDB init error:', err);
    }
  })();
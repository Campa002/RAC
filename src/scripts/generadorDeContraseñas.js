/* ── Constantes de caracteres ─────────────────────── */
  const CHARSET = {
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    numbers:   '0123456789',
    symbols:   '!@#$%^&*()_+-=[]{}|;:,.<>?',
  };

  const STRENGTH_LEVELS = [
    { maxScore: 39,  label: 'Débil',      color: 'var(--strength-weak)'    },
    { maxScore: 69,  label: 'Media',      color: 'var(--strength-fair)'    },
    { maxScore: 89,  label: 'Fuerte',     color: 'var(--strength-strong)'  },
    { maxScore: 100, label: 'Muy fuerte', color: 'var(--strength-vstrong)' },
  ];

  const PLACEHOLDER_TEXT = 'Tu contraseña aparecerá aquí';

  /* ── Referencias al DOM ───────────────────────────── */
  const ui = {
    passwordOutput:    document.getElementById('passwordOutput'),
    strengthLabel:     document.getElementById('strengthLabel'),
    strengthBar:       document.getElementById('strengthBar'),
    lengthSlider:      document.getElementById('lengthSlider'),
    lengthDisplay:     document.getElementById('lengthDisplay'),
    includeUppercase:  document.getElementById('includeUppercase'),
    includeLowercase:  document.getElementById('includeLowercase'),
    includeNumbers:    document.getElementById('includeNumbers'),
    includeSymbols:    document.getElementById('includeSymbols'),
    generateBtn:       document.getElementById('generateBtn'),
    copyBtn:           document.getElementById('copyBtn'),
  };

  /* ── Construcción del conjunto de caracteres ──────── */
  function buildCharset(options) {
    let charset = '';
    if (options.uppercase) charset += CHARSET.uppercase;
    if (options.lowercase) charset += CHARSET.lowercase;
    if (options.numbers)   charset += CHARSET.numbers;
    if (options.symbols)   charset += CHARSET.symbols;
    return charset;
  }

  /* ── Generación de la contraseña ──────────────────── */
  function generatePassword(length, charset) {
    return Array.from(
      { length },
      () => charset[Math.floor(Math.random() * charset.length)]
    ).join('');
  }

  /* ── Cálculo del puntaje de fuerza (0-100) ────────── */
  function calculateStrengthScore(length, options) {
    let score = 0;
    if (length >= 8)  score += 20;
    if (length >= 12) score += 20;
    if (length >= 20) score += 10;
    if (options.uppercase && options.lowercase) score += 20;
    if (options.numbers)  score += 15;
    if (options.symbols)  score += 15;
    return Math.min(score, 100);
  }

  /* ── Obtención del nivel de fuerza ───────────────── */
  function getStrengthLevel(score) {
    return STRENGTH_LEVELS.find(level => score <= level.maxScore);
  }

  /* ── Actualización de la barra de fuerza ─────────── */
  function updateStrengthIndicator(score) {
    const level = getStrengthLevel(score);
    ui.strengthBar.style.width      = `${score}%`;
    ui.strengthBar.style.background = level.color;
    ui.strengthLabel.textContent    = `Fuerza: ${level.label}`;
    ui.strengthBar.closest('[role="progressbar"]').setAttribute('aria-valuenow', score);
  }

  /* ── Lectura de opciones desde el DOM ─────────────── */
  function readOptions() {
    return {
      uppercase: ui.includeUppercase.checked,
      lowercase: ui.includeLowercase.checked,
      numbers:   ui.includeNumbers.checked,
      symbols:   ui.includeSymbols.checked,
    };
  }

  /* ── Handler principal: generar contraseña ────────── */
  function handleGenerate() {
    const options = readOptions();
    const charset = buildCharset(options);

    if (!charset) {
      alert('Seleccioná al menos una opción de caracteres.');
      return;
    }

    const length   = parseInt(ui.lengthSlider.value, 10);
    const password = generatePassword(length, charset);
    const score    = calculateStrengthScore(length, options);

    ui.passwordOutput.textContent = password;
    updateStrengthIndicator(score);
  }

  /* ── Handler: copiar al portapapeles ──────────────── */
  async function handleCopy() {
    const text = ui.passwordOutput.textContent;

    if (text === PLACEHOLDER_TEXT) {
      alert('Primero generá una contraseña.');
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      ui.copyBtn.textContent = '¡Copiado!';
      setTimeout(() => { ui.copyBtn.textContent = 'Copiar'; }, 1500);
    } catch {
      alert('No se pudo copiar al portapapeles.');
    }
  }

  /* ── Handler: actualizar display del slider ───────── */
  function handleSliderInput() {
    ui.lengthDisplay.textContent = ui.lengthSlider.value;
  }

  /* ── Registro de eventos ──────────────────────────── */
  ui.generateBtn.addEventListener('click', handleGenerate);
  ui.copyBtn.addEventListener('click', handleCopy);
  ui.lengthSlider.addEventListener('input', handleSliderInput);
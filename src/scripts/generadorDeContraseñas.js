function hacer() {
    var l = document.getElementById('lon').value;
    var m = document.getElementById('may').checked;
    var n = document.getElementById('min').checked;
    var nu = document.getElementById('num2').checked;
    var s = document.getElementById('sim').checked;
    var ch = '';
    if (m) ch += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (n) ch += 'abcdefghijklmnopqrstuvwxyz';
    if (nu) ch += '0123456789';
    if (s) ch += '!@#$%^&*()_+-=[]{}|;:,.<>?';
    if (ch == '') { alert('selecciona algo'); return; }
    var p = '';
    for (var i = 0; i < l; i++) {
      p += ch[Math.floor(Math.random() * ch.length)];
    }
    document.getElementById('res').textContent = p;
    // calcular fuerza mezclado aca mismo
    var f = 0;
    if (l >= 8) f += 20;
    if (l >= 12) f += 20;
    if (l >= 20) f += 10;
    if (m && n) f += 20;
    if (nu) f += 15;
    if (s) f += 15;
    if (f > 100) f = 100;
    document.getElementById('barra').style.width = f + '%';
    var txt = '';
    var col = '';
    if (f < 40) { txt = 'Debil'; col = '#e53935'; }
    else if (f < 70) { txt = 'Media'; col = '#fb8c00'; }
    else if (f < 90) { txt = 'Fuerte'; col = '#3ab54a'; }
    else { txt = 'Muy fuerte'; col = '#2e7d32'; }
    document.getElementById('fuerza').textContent = 'Fuerza: ' + txt;
    document.getElementById('barra').style.background = col;
  }
  // copiar
  function cop() {
    var t = document.getElementById('res').textContent;
    if (t == 'Tu contrasena aparecera aqui') { alert('genera primero'); return; }
    navigator.clipboard.writeText(t).then(function() {
      document.getElementById('copiar').textContent = 'Copiado!';
      setTimeout(function(){ document.getElementById('copiar').textContent = 'Copiar'; }, 1500);
    });
  }
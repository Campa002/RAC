# Generador de Contraseñas

Herramienta web para generar contraseñas seguras con evaluación de fuerza en tiempo real. Desarrollada en HTML, CSS y JavaScript vanilla, respetando la guía de marca de la empresa.

---

## Tabla de contenidos

- [Descripción](#descripción)
- [Funcionalidades](#funcionalidades)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Uso](#uso)
- [Integración del logo](#integración-del-logo)
- [Historial de cambios](#historial-de-cambios)

---

## Descripción

Aplicación de una sola página (`single-page`) que permite al usuario configurar y generar contraseñas aleatorias con control sobre la longitud y los tipos de caracteres incluidos. Incluye un indicador visual de fuerza que evalúa la contraseña en función de su longitud y complejidad.

No requiere dependencias externas ni servidor: funciona abriendo el archivo `.html` directamente en el navegador.

---

## Funcionalidades

- **Longitud configurable** mediante slider, entre 6 y 32 caracteres.
- **Tipos de caracteres seleccionables:**
  - Mayúsculas (A–Z)
  - Minúsculas (a–z)
  - Números (0–9)
  - Símbolos (`!@#$%^&*...`)
- **Indicador de fuerza** con barra de progreso animada y etiqueta: Débil / Media / Fuerte / Muy fuerte.
- **Copiar al portapapeles** con confirmación visual.
- **Logo de empresa** intercambiable (actualmente un placeholder genérico).
- Colores y tipografías respetan el sistema de diseño de la empresa.

---

## Estructura del proyecto

```
/
├── password-generator-dirty.html   # Commit 1: versión funcional, código sin refactorizar
├── password-generator-clean.html   # Commit 2: refactorización a código limpio
└── README.md                       # Este archivo
```

---

## Uso

1. Abrir `password-generator-clean.html` en cualquier navegador moderno.
2. Ajustar la longitud con el slider.
3. Seleccionar los tipos de caracteres deseados.
4. Hacer clic en **Generar Contraseña**.
5. Usar **Copiar** para llevar la contraseña al portapapeles.

> **Nota:** el botón Copiar requiere que el navegador tenga acceso a la Clipboard API. Funciona correctamente en Chrome, Firefox, Edge y Safari modernos.

---

## Integración del logo

El archivo incluye un placeholder circular con el texto `LOGO`. Para reemplazarlo con el logo real de la empresa:

**1. En el HTML**, reemplazar el bloque del placeholder:

```html
<!-- Antes -->
<div class="logo-placeholder" aria-label="Logo de la empresa">
  <span class="logo-placeholder__text">LOGO</span>
</div>

<!-- Después -->
<img src="tu-logo.png" alt="Nombre de la empresa" class="logo-image">
```

**2. En el CSS**, agregar la clase de imagen:

```css
.logo-image {
  width: 72px;
  height: 72px;
  object-fit: contain;
}
```

Se recomienda usar un archivo `.png` o `.svg` con fondo transparente.

---

## Historial de cambios

### Commit 2 — Refactorización: código limpio

**Archivo:** `password-generator-clean.html`

Se refactorizó por completo la versión inicial manteniendo el comportamiento y la interfaz sin cambios visibles para el usuario. El objetivo fue mejorar la legibilidad, el mantenimiento y la robustez del código.

#### Cambios en JavaScript

| Aspecto | Antes (sucio) | Después (limpio) |
|---|---|---|
| Nombres de variables | `l`, `m`, `n`, `nu`, `s`, `p`, `f` | `length`, `options`, `password`, `score` |
| Declaración de variables | `var` | `const` / `let` |
| Estructura | Toda la lógica dentro de `hacer()` | Funciones con responsabilidad única |
| Eventos | `onclick="hacer()"` inline en HTML | `addEventListener` desde el script |
| Referencias al DOM | Dispersas dentro de cada función | Centralizadas en el objeto `ui` |
| Constantes | Strings literales repetidos en el código | Extraídas en `CHARSET`, `STRENGTH_LEVELS`, `PLACEHOLDER_TEXT` |
| Manejo de errores | `alert()` sin try/catch en clipboard | `try/catch` en `handleCopy()` |

#### Funciones extraídas

```
buildCharset(options)         → construye el string de caracteres según las opciones
generatePassword(length, charset) → genera la contraseña aleatoria
calculateStrengthScore(length, options) → devuelve un puntaje de 0 a 100
getStrengthLevel(score)       → retorna el nivel de fuerza correspondiente al puntaje
updateStrengthIndicator(score) → actualiza barra y etiqueta en el DOM
readOptions()                 → lee el estado de los checkboxes
handleGenerate()              → orquesta la generación completa
handleCopy()                  → copia la contraseña al portapapeles
handleSliderInput()           → actualiza el display del slider
```

#### Cambios en HTML y CSS

- Se agregaron `lang="es"`, `meta charset` y `meta viewport` faltantes.
- Se reemplazaron IDs genéricos (`#caja`, `#res`, `#btn`) por clases BEM descriptivas (`.card`, `.password-output`, `.btn-primary`).
- Se añadieron atributos de accesibilidad: `aria-live="polite"` en el output, `role="progressbar"` con `aria-valuemin/max/now` en la barra de fuerza.
- Los colores de fuerza se extrajeron como variables CSS (`--strength-weak`, `--strength-fair`, `--strength-strong`, `--strength-vstrong`).
- Se agregó `logo-placeholder` con comentario de integración para facilitar el reemplazo por el logo real.

---

### Commit 1 — Versión inicial (código sucio)

**Archivo:** `password-generator-dirty.html`

Primera versión funcional del generador. Implementa todas las funcionalidades requeridas pero con código sin estructurar, pensada como punto de partida para la auditoría y posterior refactorización.

#### Problemas identificados

- Variables con nombres de una sola letra sin semántica (`l`, `m`, `n`, `nu`, `s`, `p`, `f`).
- Uso de `var` en lugar de `const`/`let`.
- Toda la lógica de generación y evaluación de fuerza concentrada en la función `hacer()`.
- Referencias al DOM repetidas y dispersas en cada función.
- Eventos registrados con atributos `onclick` inline en el HTML.
- IDs sin convención de nombres (`#caja`, `#res`, `#btn`, `#lon`).
- Comentarios que describen el código evidente en lugar de explicar la intención.
- Sin `lang`, sin `meta charset`, sin atributos de accesibilidad.
- Strings mágicos repetidos en distintas partes del código.
# Dirección de arte · 360° Consultores

> Fuente: **Manual de marca v1.0 (octubre de 2026)** y el encargo de la landing. No hubo carpeta `/referencias` (ver `referencias/LEEME.md`), por lo que no se tomó nada de referentes externos. Donde el encargo, el manual y las skills chocan, el orden de prioridad fue: **encargo > manual de marca > skills**.

## Concepto
«Un negocio, 360 grados»: el viaje de una Mipyme dando una vuelta completa, del nacimiento legal a la entrega en la puerta del cliente, en una tarde de 4 horas con 5 especialistas e IA. El anillo de cinco segmentos (5 × 72°, separación de 5°, relación 0,66) es el hilo visual.

## Materiales
- Vidrio esmerilado translúcido: blanco 45 %, desenfoque 24 px, borde blanco 80 %, radio 32 px (tarjetas, chips, barra de navegación).
- Objetos de vidrio iridiscente con brillo especular y sombra difusa: render 3D de Higgsfield (anillo, un objeto por eje, teléfono del Kit, escenas) más el anillo SVG interactivo.
- Luz difusa, sin sombras duras; formas redondeadas y recortes curvos entre secciones (radio 48 px).

## Paleta
| Uso | Color |
|---|---|
| Fondo principal (perla) | `#F4F3FA` |
| Texto y bloques de contraste (azul noche) | `#12204A` |
| Texto secundario (pizarra) | `#4A5275` |
| Texto sobre azul noche (niebla) | `#C9CDE6` |
| Atmósfera (lavanda) | `#E3DCFC` → celeste → rosa pálido |
| Ejes | violeta `#7C5CFF`, azul `#2D9CFF`, coral `#FF6FAE`, lima `#B6F03C`, ámbar `#FFB547` |

Reglas aplicadas: proporción 60 % perla/blanco, 25 % azul noche, 10 % atmósfera, 5 % ejes; los ejes solo como acento en degradado o vidrio, nunca como bloques planos; coral, lima y ámbar jamás como color de texto sobre fondo claro; azul noche solo en «Para la Secretaría», el cierre/contacto y el pie. Sin rojo, sin pareja azul + naranja, sin violeta plano (diferenciación del benchmarking del manual).

## Tipografía
**Sora** (titulares y cifras, pesos 200 + 700) y **Manrope** (texto e interfaz), las dos familias del manual, autohospedadas en WOFF2 variable (subconjunto latino) con `font-display: swap` y `preload`. Titulares: peso ligero + una palabra clave en negrita, interletra −2 %, alineados a la izquierda. Jerarquía: display 72 px, título 1 de 48 px, título 3 de 20 a 22 px, cuerpo 16 px con interlínea 1,6, antetítulo 12 px en versales con +16 %.
> Desvío consciente: el encargo pedía «una» fuente; se usan las dos del manual (así lo fija la marca). `landing-page-design` también limita a una; manda el manual.

## Composición
Mobile-first, contenedor de 1200 px, tarjetas de 24 a 32 px de radio, botones píldora, mucho aire. Primera mitad gráfica y emocional (hero, reto, eslogan, ejes, Kit); segunda mitad institucional (contratación, hoja de ruta, equipo, cita, FAQ). Un objeto protagonista por sección. Palabra «360°» fantasma muy translúcida detrás del hero.

## Movimiento
Curva `cubic-bezier(0.22, 1, 0.36, 1)`, 600 a 900 ms. Titulares con revelado palabra por palabra; eslogan con palabras que pasan de tono apagado a pleno según cruzan una línea; objeto flotante; el anillo de la sección de eslogan **se separa en 5 ejes con el scroll** (el hero usa el video del anillo) y los anillos de cierre se **ensamblan** al entrar; línea de tiempo horizontal con scroll pinneado (una parada por eje); chat de WhatsApp animado. Solo se animan `transform` y `opacity` (salvo el acordeón, que usa filas de rejilla). `prefers-reduced-motion`: sin pinneado, sin movimiento, solo cambios de opacidad.

## Qué no copiar
Nada de referentes externos. Evitar: fotos de stock, rostros reales o inventados, composiciones o marcas de terceros, logotipos de clientes, cifras y testimonios inventados.

## Desviaciones frente a las skills
- `landing-page-design` (B4/B5) prohíbe fondos con degradado y pide texto del hero con degradado gris; el encargo exige degradados atmosféricos y texto azul noche → manda el encargo.
- `taste-skill` (lint) marca vidrio, degradados y bordes finos: es la identidad pedida por el manual. Se respetaron sus reglas de motion, estados, `100svh`, copy realista y ausencia de relleno.
- Eslogan con palabras apagadas (skill B11): se usó `#5F678C` en lugar de 25 a 35 % de opacidad para mantener contraste AA (5,0:1).

## Ajustes de la segunda ronda (feedback del cliente)
- **Menos rosa, más serio:** atmósfera perla, lavanda y celeste; se quitó el rosa de fondos, degradados y acentos de interfaz. El coral queda solo como color del eje Talento. Bloques azul noche más profundos.
- **Íconos:** objetos 3D abstractos de vidrio (tubos, láminas, cápsulas, engranajes), en la línea de las referencias, en lugar de figuras literales. Avatares del equipo en azul noche con aro del color del eje.
- **Navegación:** barra de ancho completo que se vuelve vidrio al bajar, se oculta al hacer scroll hacia abajo y reaparece al subir; indicador blanco que se desliza entre enlaces; anillo 360° de cinco segmentos que se llena con el progreso de la página y muestra la sección actual (número y nombre); CTA con flecha que gira; en móvil, menú a pantalla completa que se abre en círculo desde el botón, con secciones numeradas, la sección actual resaltada y accesos a WhatsApp y correo.
- **Hilo conductor:** una línea vertical recorre toda la página, se dibuja con el scroll y lleva un anillo de cinco colores que gira; en cada sección se enciende un nodo y una rama conecta con el antetítulo.
- **Más movimiento:** cifras que cuentan (4 horas, 5 ejes, 30 a 100 Mipymes, 40 min), franja animada con los mecanismos de contratación, flotación de los objetos 3D, parallax en la imagen de la hoja de ruta, tarjetas que se elevan con una luz que sigue el cursor y líneas de antetítulo que se dibujan. Todo se desactiva con `prefers-reduced-motion`.

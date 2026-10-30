# Referentes visuales

Esta carpeta debía contener `ref-01.png`, `ref-02.png`, `ref-03.png` y opcionalmente `ref-04.mp4`.
**No estaban en el repositorio al construir el sitio**, así que la dirección de arte se derivó del manual de marca
y de las instrucciones del encargo (ver `docs/direccion-de-arte.md`).

Cuando los agregue, vuelva a pedir el análisis: se extraen 8 a 12 fotogramas del video con
`ffmpeg -i referencias/ref-04.mp4 -vf fps=1.5,scale=640:-1 referencias/frames/f_%02d.png`
y se ajustan prefijo de estilo, paleta y movimiento.

# guajilodev

Portafolio y blog de José Tovar, en español (`/`) y en inglés (`/en/`). HTML, CSS y JavaScript escritos a mano, sin build ni dependencias.

Ver en local: `python3 -m http.server 8000` en la raíz y abrir `http://localhost:8000`. Las rutas son absolutas, así que `file://` no sirve.

Despliegue: conectar el repositorio a Netlify o arrastrar la carpeta. No hay comando de build; `netlify.toml` publica la raíz.

Cabeceras y CSP: `_headers`. Redirecciones: `_redirects`. La CSP de `<meta>` en cada página es solo respaldo.

Al publicar un artículo: copiar `blog/_template.html`, crear su pareja en `en/blog/` y actualizar `sitemap.xml`, `feed.xml` y `en/feed.xml`.

## Antes de publicar, revisar

- El dominio del sitio es `https://guajilodev.netlify.app`. Si el nombre del sitio en Netlify es otro, hay que reemplazarlo en `canonical`, `hreflang`, `og:url`, `sitemap.xml`, `robots.txt`, `feed.xml`, `en/feed.xml`, `.well-known/security.txt` y este README.
- Los artículos del blog están en preparación: tienen la introducción y el aviso visible, pero les falta el cuerpo. Cuando se escriban, actualizar `dateModified` y la fecha del feed.
- Las figuras están reservadas con su `data-alt`; cuando exista el archivo, agregar el `<img>` con `width`, `height` y `alt`.
- Los casos no publican métrica todavía: cuando exista, se agrega el bloque «Qué cambió» con el número.

## Tarjetas sociales

`python3 tools/make-og.py` regenera las 30 imágenes de `assets/img/og/` a partir del `og:title` de cada página, con la tipografía del sitio. Necesita `fonttools`, `brotli` y `Pillow`. No se ejecuta en el despliegue: es una herramienta local.

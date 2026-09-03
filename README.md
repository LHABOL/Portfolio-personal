# Portfolio — Kaleb Lepe

Portfolio personal de **Kaleb Lepe**: ingeniero de procesos en Grupo SLI y desarrollador web front-end.
Sitio de una sola página, **100% estático**, sin backend y sin paso de build.

## Stack

- HTML5 semántico
- [Tailwind CSS](https://tailwindcss.com/) vía **Play CDN** (`<script src="https://cdn.tailwindcss.com">`), configurado inline en `index.html`
- CSS propio en `css/style.css` (componentes, animaciones, barras de progreso, terminal)
- JavaScript vanilla (ES6+) en `js/script.js` — sin dependencias
- Iconos de tecnologías vía [devicon](https://devicon.dev/) (CDN)
- Fuentes: Inter + JetBrains Mono (Google Fonts)

## Estructura

```
portfolio-kaleb-lepe/
├── index.html            # todo el markup, dividido por secciones comentadas
├── css/
│   └── style.css          # estilos propios que complementan a Tailwind
├── js/
│   └── script.js          # toda la interactividad
├── assets/
│   ├── cv-kaleb-lepe.pdf   # CV real
│   └── img/
│       ├── favicon.svg
│       ├── og-image.svg
│       ├── profile.png              # foto real (recortada del CV)
│       ├── jenny-spa.png            # screenshot real
│       ├── tierra-sana.png          # screenshot real
│       ├── mirandas-barber-shop.png # screenshot real
│       ├── galu-papeleria.png       # screenshot real
│       ├── trapillo-shop.png        # screenshot real
│       └── le-gouter.svg            # placeholder (el sitio tiene intro con scroll-jacking; ver abajo)
├── robots.txt
├── sitemap.xml
└── vercel.json
```

## Desarrollo local

No requiere instalación. Abre `index.html` con cualquier servidor estático, por ejemplo:

```bash
npx serve .
```

o la extensión *Live Server* de VS Code.

## Despliegue en Vercel

1. Sube esta carpeta como su propio repositorio en GitHub.
2. En Vercel: **Add New → Project → Import** el repo.
3. Framework Preset: **Other**. Sin build command, sin output directory (raíz).
4. Deploy. Ajusta el dominio y actualiza las URLs `https://kaleblepe.vercel.app/` en
   `index.html` (canonical + Open Graph), `robots.txt` y `sitemap.xml`.

## Qué reemplazar antes de publicar

| Elemento | Dónde | Nota |
|---|---|---|
| LinkedIn / GitHub | `index.html` (secciones Contacto y Footer) | Los `href="#"` son placeholders. Poner las URLs reales. |
| Screenshot de Le Goûter | `assets/img/le-gouter.svg` | Ver abajo. |
| **Clave del formulario de contacto** | `js/script.js` → `WEB3FORMS_ACCESS_KEY` | Ver **"Formulario de contacto"** abajo. Sin la clave, el formulario avisa en pantalla y no envía. |
| URL del dominio | `index.html`, `robots.txt`, `sitemap.xml` | Cambiar `kaleblepe.vercel.app` por el dominio final. |

### Formulario de contacto

El formulario envía los mensajes por **[Web3Forms](https://web3forms.com)** (gratis, 250
mensajes/mes, sin crear cuenta ni contraseña). Configúralo una sola vez:

1. Entra a <https://web3forms.com>.
2. Escribe tu correo (`kalebyeredlepesanchez16@gmail.com`) y pulsa **"Create Access Key"**.
3. Copia la Access Key que te llega por email.
4. Pégala en `js/script.js`, en la constante `WEB3FORMS_ACCESS_KEY` (arriba de `setupContactForm`).
5. Commit + deploy. Listo: los mensajes llegan a ese correo.

Mientras la clave siga como `PEGA-AQUI-TU-ACCESS-KEY`, el formulario muestra un aviso
honesto y no finge el envío. Si el POST falla, ofrece un enlace `mailto:` como respaldo.
Incluye un honeypot (`botcheck`) contra spam.

### Screenshots de proyectos

5 de los 6 previews son capturas reales tomadas con Chrome headless
(`chrome --headless --screenshot`, viewport 1280×800).

**Le Goûter** usa una animación de intro con *scroll-jacking* que impide capturarla
de forma automática, así que su tarjeta usa un placeholder SVG con la identidad del sitio.
Para reemplazarlo: entra a https://le-gouter-cafe.vercel.app/, pasa la intro,
toma una captura del hero real y guárdala como `assets/img/le-gouter.png`,
luego cambia la extensión en el `<img>` correspondiente de `index.html`.

Para regenerar cualquier screenshot:

```bash
chrome --headless --no-sandbox --disable-gpu --hide-scrollbars \
  --window-size=1280,800 --virtual-time-budget=25000 \
  --screenshot=assets/img/<nombre>.png "https://<url-del-sitio>/"
```

## Pasar Tailwind a un build real (opcional)

El Play CDN muestra un aviso en consola en producción. Para eliminarlo:

1. `npm init -y && npm i -D tailwindcss`
2. Mueve la config inline de `index.html` a `tailwind.config.js`.
3. Crea `src/input.css` con las directivas `@tailwind base; @tailwind components; @tailwind utilities;`
   (más el contenido actual de `css/style.css`).
4. Build: `npx tailwindcss -i src/input.css -o css/style.css --minify`
5. Quita el `<script src="https://cdn.tailwindcss.com">` y el bloque `tailwind.config` de `index.html`.

## Accesibilidad y rendimiento

- HTML semántico, `aria-*` en controles de icono, skip-link, foco visible.
- Contraste AA en modo claro y oscuro.
- `prefers-reduced-motion` respetado (typing, reveals y scroll suave se desactivan).
- Imágenes con `loading="lazy"` y `alt` descriptivo.
- Preferencia de tema persistida en `localStorage` y aplicada antes del render (sin parpadeo).

## Contenido interactivo (JS)

- Toggle de tema claro/oscuro con persistencia.
- Menú móvil hamburguesa (Escape para cerrar, se colapsa al navegar).
- Scroll suave en enlaces internos + header con sombra al hacer scroll.
- Efecto de escritura en la terminal del hero.
- Animaciones fade/slide al entrar en viewport (`IntersectionObserver`).
- Validación en vivo + envío real del formulario por Web3Forms (con estados de carga, éxito y error, y respaldo `mailto:`).
- Año dinámico en el footer.

# Portfolio — Kaleb Lepe

Portfolio personal de **Kaleb Lepe**: ingeniero de procesos y desarrollador web freelance.
Sitio de una sola página, **100% estático**, sin backend y sin paso de build. Node se usa
solo (y opcionalmente) para regenerar las previews de los proyectos.

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
├── index.html                # todo el markup, dividido por secciones comentadas
├── css/style.css             # estilos propios que complementan a Tailwind
├── js/script.js              # toda la interactividad
├── assets/
│   ├── cv-kaleb-lepe.pdf      # CV real
│   └── img/
│       ├── favicon.svg  ·  og-image.svg
│       ├── profile.png                # foto real (recortada del CV)
│       └── <slug>.jpg                 # 1 preview por proyecto (se regeneran solas, ver abajo)
├── scripts/screenshots.mjs   # regenera las previews con Playwright
├── .github/workflows/screenshots.yml  # las regenera en automático (cron + manual)
├── package.json              # devDependency: playwright (solo para las previews)
├── robots.txt  ·  sitemap.xml  ·  vercel.json
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
| URL del dominio | `index.html`, `robots.txt`, `sitemap.xml` | Cambiar `kaleblepe.vercel.app` por el dominio final. |

Ya configurado: foto y CV reales, correo de contacto, enlaces de LinkedIn y GitHub,
la Access Key de Web3Forms del formulario, y las 6 previews de proyectos (reales y
con actualización automática).

### Formulario de contacto

El formulario envía los mensajes por **[Web3Forms](https://web3forms.com)** (gratis, 250
mensajes/mes). La `WEB3FORMS_ACCESS_KEY` en `js/script.js` ya está puesta y los mensajes
llegan a `kalebyeredlepesanchez16@gmail.com`.

Para cambiarla en el futuro: consigue otra clave en <https://web3forms.com> (solo pide el
correo, sin cuenta) y reemplaza la constante `WEB3FORMS_ACCESS_KEY` (arriba de
`setupContactForm`). Si la clave se borra, el formulario muestra un aviso honesto y no
finge el envío; si el POST falla, ofrece un enlace `mailto:` como respaldo. Incluye un
honeypot (`botcheck`) contra spam.

## Previews de proyectos — actualización automática

Las 6 imágenes de `assets/img/<slug>.jpg` son **capturas reales** de cada sitio en
producción, hechas con Playwright (`scripts/screenshots.mjs`), viewport 1280×800 @1.5x
y guardadas como JPEG ligero (~35–260 KB cada una).
El script espera a que la red quede inactiva y a que terminen las animaciones de
entrada; para los sitios con intro *scroll-jacking* (Le Goûter, Trapillo) hace scroll
real y captura una sección representativa.

### Cómo se mantiene al día solo

`.github/workflows/screenshots.yml` corre en GitHub Actions:

- **Cada 6 horas** (cron) y también con el botón **"Run workflow"** en la pestaña
  *Actions → Actualizar previews de proyectos* (para verlo reflejado al instante).
- Si alguna imagen cambió respecto a la que está en git, hace commit. Vercel detecta
  el push y **redespliega el portfolio automáticamente**.

Así, cuando modificas uno de tus sitios, el portfolio se actualiza en la siguiente
corrida (o en cuanto pulsas "Run workflow").

### Regenerar en local

```bash
npm install
npx playwright install chromium
npm run screenshots        # escribe en assets/img/
```

Para añadir o cambiar un proyecto, edita el array `SITES` de `scripts/screenshots.mjs`
(y la tarjeta correspondiente en `index.html`).

### Opcional: actualización *al instante* al hacer push a un proyecto

Para que el portfolio se refresque en el momento en que publicas un cambio en un sitio
(sin esperar al cron), añade a **cada repo de proyecto** un workflow que dispare este:

```yaml
# .github/workflows/avisar-portfolio.yml  (en el repo del proyecto)
name: Avisar al portfolio
on:
  push:
    branches: [main]
jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - run: |
          curl -sf -X POST \
            -H "Authorization: Bearer ${{ secrets.PORTFOLIO_DISPATCH_TOKEN }}" \
            -H "Accept: application/vnd.github+json" \
            https://api.github.com/repos/LHABOL/Portfolio-personal/dispatches \
            -d '{"event_type":"refresh-screenshots"}'
```

`PORTFOLIO_DISPATCH_TOKEN` es un *fine-grained PAT* con permiso **Contents: read and
write** (o **Actions: write**) sobre `LHABOL/Portfolio-personal`, guardado como secret
en cada repo de proyecto. El workflow del portfolio ya escucha el evento
`refresh-screenshots`.

## Pasar Tailwind a un build real (opcional)

El Play CDN muestra un aviso en consola en producción. Para eliminarlo:

1. `npm i -D tailwindcss`
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

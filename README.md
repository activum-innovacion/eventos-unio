# 🎬 Cine de Verano · ÜNIO Madrid

Web **mobile-first** para los residentes de ÜNIO Madrid: consultar la
programación del cine de verano, **votar** películas y **proponer** nuevas.
Incluye un **panel de administración** para gestionar la cartelera y las
propuestas.

Diseño alineado con la marca **ÜNIO** (uniomadrid.es): claro y minimalista,
tipografía **Montserrat**, acento índigo, logos de ÜNIO.

Stack: **Next.js 16** (App Router) · **React 19** · **Tailwind CSS 4**.

## Funcionalidades

**Público**
- **Cartelera** — próxima proyección destacada + listado de sesiones (fecha,
  hora, duración, sinopsis, ubicación). Toca una sesión para ver detalles.
- **Votaciones** — ranking de candidatas; voto sin registro (uno por película y
  dispositivo), con recuento en vivo.
- **Proponer** — los residentes proponen películas; quedan **pendientes** hasta
  que la comisión las aprueba.

**Panel de administración** (`/admin`)
- Iniciar sesión con contraseña.
- **Cartelera**: crear, editar y eliminar sesiones (con imagen/cartel).
- **Propuestas**: aprobar o rechazar las propuestas de los residentes.
- **Votaciones**: añadir, editar y eliminar candidatas; ver votos.
- **Subida de imágenes** de las películas.

## Puesta en marcha

```bash
npm install
npm run dev        # http://localhost:3000
```

- Web pública: `http://localhost:3000`
- Panel: `http://localhost:3000/admin` (contraseña por defecto en local:
  `cine-unio`; se cambia con la variable `ADMIN_PASSWORD`).

## Configuración (variables de entorno)

Copia `.env.example` a `.env.local` y ajusta:

| Variable         | Descripción                                            |
| ---------------- | ------------------------------------------------------ |
| `ADMIN_PASSWORD` | Contraseña del panel `/admin`. Por defecto `cine-unio`.|

## Cómo editar la programación

- Desde el **panel** (`/admin`) — recomendado.
- O editando los datos iniciales en [`lib/seed.ts`](lib/seed.ts). La primera vez
  se copian a `data/db.json` (estado en ejecución, en `.gitignore`). Para
  **reiniciar** los datos, borra `data/db.json`.

Cada película usa la imagen subida desde el panel; si no tiene, se muestra un
placeholder de color con emoji.

## Tipografía

- **Montserrat** (Google Fonts) — ya activa en toda la interfaz.
- **Nexa** (marca, no está en Google Fonts): deja los ficheros en `app/fonts/`
  y se conecta a `--font-nexa` (ver [app/fonts/README.md](app/fonts/README.md)).

## Estructura

```
app/
  (public)/            Web pública (layout con cabecera + footer de marca)
    page.tsx           Cartelera
    votaciones/        Votaciones
    proponer/          Formulario de propuestas
  admin/               Panel de administración
    login/             Inicio de sesión
    page.tsx           Dashboard (protegido)
  api/
    screenings/        GET programación (público)
    candidates/        GET candidatas aprobadas · POST propuesta (pending)
    candidates/[id]/vote/
    admin/             login · logout · screenings · candidates · upload
components/            UI pública + components/admin (panel)
lib/                   seed · store (datos) · auth · types · format
```

## Despliegue en GitHub + Vercel

1. Sube el repositorio a GitHub.
2. En Vercel → **Add New → Project** → importa el repo (detecta Next.js solo).
3. En **Settings → Environment Variables** define `ADMIN_PASSWORD`.
4. Deploy. Cada `git push` genera un despliegue nuevo.

## ⚠️ Persistencia en producción (pendiente)

El almacén ([`lib/store.ts`](lib/store.ts)) y la subida de imágenes escriben en
disco. Funciona en local, pero **en Vercel el sistema de ficheros es de solo
lectura**:

- Los votos/propuestas/cambios del panel **no persisten** (el almacén cae a
  memoria como red de seguridad para no romper el sitio; se reinician).
- La **subida de imágenes falla** (devuelve un aviso claro).

Antes de usarlo en serio hay que conectar:
- una **base de datos** (Upstash Redis o Supabase, del Vercel Marketplace) para
  el almacén, y
- un **almacenamiento de imágenes** (Vercel Blob o Supabase Storage).

Todo pasa por `lib/store.ts` y `app/api/admin/upload`, así que el cambio queda
acotado. Dímelo y lo dejo listo.

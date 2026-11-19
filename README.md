# Giam Tejerina · Portafolio

React, TypeScript, Vite y Motion. Portafolio basado en Figma con Portada, Sobre mí, Mis proyectos, Museo, Personajes, EDUCA y Contacto.

Requiere Node.js 22.14 o superior.

```bash
npm install
npm run dev
```

```bash
npm run build
npm run preview
```

`npm run typecheck` comprueba los tipos. La compilación de producción se guarda en `dist/`.

## Catálogo de proyectos con Express y Supabase

La migración en `supabase/migrations/` crea el esquema privado `portfolio`, la tabla `projects` y los datos iniciales. En Supabase, aplica esa migración al proyecto del portafolio y asigna el rol `portfolio_catalog_reader` a un usuario de conexión dedicado. Ese rol solo puede leer la tabla.

Copia `.env.example` a `.env`. Completa `DATABASE_URL` con la conexión de PostgreSQL del usuario dedicado. Usa el pooler en modo sesión si la red es IPv4. El backend verifica TLS. Si la conexión usa una CA propia, indica la ruta al certificado en `DATABASE_CA_FILE`. El `.env` se excluye de Git.

Instala las dependencias con `npm ci`. Ejecuta `npm run dev:api` y `npm run dev` en dos terminales desde la raíz.

El frontend usa `/api/projects` a través del proxy de Vite. Usa `npm run build:api` para compilar Express y `npm run start:api` para ejecutar la compilación. Para comprobar el catálogo, cambia el título de un proyecto publicado en `portfolio.projects` y vuelve a cargar «Mis proyectos».

En el proyecto alojado de Giam, el esquema inicial se aplicó desde el editor SQL. La migración puede volver a ejecutarse con la CLI para registrarla en su historial sin duplicar filas ni reemplazar títulos editados.

## Estadísticas del portafolio

Abre `/admin/estadisticas` en la URL local de Vite con el frontend y el backend en ejecución. Usa la contraseña de `STATS_ADMIN_PASSWORD` del `.env` del servidor. La contraseña se mantiene en memoria durante el uso del panel y se descarta al cerrar sesión o recargar. El panel de producción debe usarse por HTTPS.

- `POST /api/events` registra una visita por carga de `/` o un clic en WhatsApp, Instagram, correo o LinkedIn. Si se reenvía el mismo ID de evento, se cuenta una sola vez. La tabla guarda el ID del evento, el tipo, el destino y la fecha.
- `GET /api/stats` requiere la contraseña del administrador y devuelve los últimos siete días, incluidos días sin actividad, en `America/La_Paz`. Las visitas representan cargas, incluidas recargas.
- La migración `create_portfolio_analytics` crea la tabla en el esquema privado `portfolio`. Express puede consultar e insertar eventos. La migración se aplicó al proyecto de Giam desde el editor SQL, igual que la del catálogo.

Para la defensa, abre el portafolio y pulsa un enlace de Contacto. Abre el panel de estadísticas en otra pestaña o pulsa **Actualizar** para ver el cambio.

## Pruebas automatizadas en `dev`

La ejecución de GitHub Actions para cada `push` y pull request a `dev` corre tres trabajos independientes. Integración y E2E usan PostgreSQL 17 de prueba, aplican las migraciones desde `supabase/migrations/` y usan el rol de la aplicación. El reporte HTML de E2E se adjunta a la ejecución.

- `npm run test:unit` valida los eventos de visita y clic.
- `npm run test:integration` comprueba el catálogo, el registro sin duplicados y las estadísticas por día de Bolivia.
- `npm run test:e2e` compila React y usa Chromium para recorrer el catálogo, registrar un clic y verificar el acceso privado.

Para ejecutar las tres suites localmente, instala dependencias con `npm ci`. Desde PowerShell, instala Chromium en `work/`, levanta una base desechable y corre las pruebas:

```powershell
$env:PLAYWRIGHT_BROWSERS_PATH = Join-Path (Get-Location).Path 'work/playwright-browsers'
npx playwright install --only-shell chromium
docker run --rm -d --name portfolio-test-db -p 127.0.0.1:55432:5432 -e POSTGRES_PASSWORD=portfolio_test -e POSTGRES_DB=portfolio_test postgres:17
docker exec portfolio-test-db pg_isready -U postgres -d portfolio_test
$env:TEST_DATABASE_URL = 'postgresql://postgres:portfolio_test@127.0.0.1:55432/portfolio_test'
npm run test:unit
npm run test:integration
npm run test:e2e
docker stop portfolio-test-db
```

Espera a que `pg_isready` indique que acepta conexiones antes de correr las dos suites que usan la base. `TEST_DATABASE_URL` solo acepta una base local llamada `portfolio_test`. La contraseña del ejemplo es exclusiva del contenedor temporal.

## Portafolio en Docker

`Dockerfile` compila React y lo sirve con Nginx. `Dockerfile.api` compila Express y arranca el servidor con Node. Compose los conecta. Nginx envía `/api/` al backend y el backend consulta Supabase mediante TLS.

Con el `.env` local configurado, ejecuta:

```powershell
docker compose up -d --build --wait
docker compose ps
```

Abre `http://127.0.0.1:8080`. El puerto de Express queda dentro de la red de Compose. `PORTFOLIO_PORT` permite cambiar el puerto local. `docker compose down` detiene el conjunto.

Cada `push` a `main` activa `.github/workflows/publicar-docker.yml`. El workflow construye para `linux/amd64` y publica `giam17/giam-tejerina-portafolio-web` y `giam17/giam-tejerina-portafolio-api` con el SHA completo del commit. Usa los secretos `DOCKERHUB_USERNAME` y `DOCKERHUB_TOKEN`. La conexión de Supabase y la contraseña de estadísticas se inyectan al arrancar los contenedores.

Para levantar una versión publicada, asigna su SHA completo a `IMAGE_TAG` en la terminal y ejecuta:

```powershell
docker compose pull
docker compose up -d --no-build --wait
```

Los despliegues automáticos de Vercel están desactivados en vercel.json para concentrar el flujo en Docker Hub y OCI.

## Imágenes y organización

`src/assets/` contiene únicamente los recursos de la web, con nombres descriptivos y carpetas por sección. Los separadores compartidos están en `src/assets/shared/` y las expresiones animadas en `src/assets/animations/`.

`design-source/originals/` conserva los 42 PNG usados para regenerar los recursos optimizados. Las capturas completas de Figma y las exportaciones sin uso están fuera del proyecto, en `D:/Proyectos/FotosUsadasPort/references/` y `D:/Proyectos/FotosUsadasPort/unused/`. No se necesitan esas carpetas externas para compilar ni publicar la web.

Para regenerar las imágenes después de cambiar un original:

```bash
npm run assets:optimize
npm run build
```

El proceso genera WebP sin pérdida, variantes para diferentes densidades de pantalla y un catálogo de rutas. Comprueba los píxeles visibles y el canal alfa de las copias a resolución completa. El navegador selecciona el tamaño adecuado mediante `srcset`; las imágenes fuera de la primera vista se cargan al acercarse a ellas. La composición de escritorio conserva el diseño original.

La configuración está en `scripts/assets.json`; el informe de pesos y variantes, en `reports/assets.json`. No es necesario regenerarlas para cada compilación.

## Versión móvil

Hasta 900 px, las siete secciones se reorganizan en una composición vertical con texto legible, tarjetas, galerías y controles táctiles. Conservan los colores, tipografías, ilustraciones, separadores y animaciones de escritorio. La adaptación vive en `src/mobile.css`; los estilos originales de cada sección permanecen intactos. Detalles y comprobaciones en [MOBILE.md](MOBILE.md).

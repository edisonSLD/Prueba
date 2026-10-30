# La Aurora

Aplicación de monitoreo industrial con Next.js, React, TypeScript, Tailwind, servidor Node.js y Socket.IO. Diseño B aprobado: fondo claro, navegación azul y cinco tarjetas FM1–FM5. Todas las cifras iniciales son datos de prueba.

## Ejecutar

Node.js 24. En el directorio del repositorio:

```sh
npm ci
npm run build
npm start
```

Para desarrollo: `npm run dev`. Puerto 3000. El usuario inicial es `admin`; en el primer arranque se genera una contraseña aleatoria en `.data/initial-admin-password` (permisos 0600), o se toma `ADMIN_PASSWORD` del entorno. No compartir ni versionar este archivo. Las cuentas adicionales se crean desde Administración. Las variables se pasan al proceso; el servidor no carga automáticamente `.env`.

Sin DATABASE_URL usa PostgreSQL embebido (PGlite) persistente en `.data/db`. Para un servidor PostgreSQL independiente, proporcionar DATABASE_URL al proceso antes del primer arranque. No hay migración automática entre ambos almacenes. El esquema se crea de manera idempotente en `lib/store.mjs`: documents (estado e históricos JSONB), users (contraseñas scrypt) y sessions (sesiones de ocho horas). Una sola instancia de aplicación escribe en el almacén; no ejecutar varias réplicas con este modelo.

## Funciones implementadas

- Resumen y filtros por área/estado; detalles de equipo y auditoría.
- Cinco tarjetas FM; seis GD y cinco PROTOS de ejemplo. Asignación inicial demostrativa, no inventario confirmado de la fábrica.
- Registro manual de unidades, estado y causa; simulador de contadores con WebSocket cada cinco segundos.
- Solicitudes con especialidad, prioridad, descripción y fotografía; técnico asignado, notas de intervención, estados, respuesta y reparación.
- Crear áreas, líneas y máquinas; mover y archivar máquinas sin eliminar históricos.
- Cierre de turno con copia histórica y nuevos contadores; exportación del estado actual a Excel/PDF.
- Autenticación, roles comprobados en el servidor, sesiones HttpOnly, validación, limitación de intentos de acceso y auditoría.

## Pruebas

`npm test` verifica credenciales, permisos y persistencia al reabrir la base. `npm run build` verifica la compilación y TypeScript. `node tests/api-smoke.mjs` verifica el servidor en ejecución utilizando la credencial local, sin imprimirla. Ejecutar únicamente en una base de prueba: añade registros.

## Alcance pendiente antes de producción

Esta entrega es una base funcional, no la totalidad del pliego: faltan gestión completa de áreas y archivado/restauración de líneas desde la interfaz, administración completa de usuarios (baja y recuperación), exportación de consultas históricas, métricas temporales de disponibilidad/MTBF/OEE, interfaz para el registro estructurado de repuestos y llegada del técnico, servicio independiente de integración PLC y detección de pérdida de comunicación. Se añadieron edición de producto/velocidad/orden de máquinas, código/meta de líneas, catálogos de productos/turnos/causas/colores, notas de calendario, cambio de contraseña y roles, consulta histórica por fecha/producto/turno y tipo de solicitud. Los calendarios son notas de configuración; no un planificador automático. El estado «Sin comunicación» puede asignarse manualmente. No se controla ningún equipo industrial.

Los datos crecen en un documento JSONB; se requiere normalizar históricos y adjuntos antes de un despliegue de gran volumen. Los permisos actuales son por rol, no por área. Las asignaciones de técnicos son texto libre. Los cambios de estado guardan causa en auditoría, aún no en un catálogo estructurado. El simulador genera unidades; no simula averías.

Para producción: configurar HTTPS en el proxy de entrada y COOKIE_SECURE=true, usar PostgreSQL externo y definir una política de respaldo/restauración. El desarrollo local usa HTTP. No se han instalado certificados ni desplegado en la red industrial. Para respaldar PGlite detener el proceso y copiar `.data/db`; para PostgreSQL usar pg_dump. Proteger los respaldos porque contienen usuarios y fotografías. Verificar una restauración antes de uso real.

## Vista web en GitHub Pages

`preview/index.html` es una demostración independiente y responsiva que funciona sin instalación: navegación, filtro por área, detalle de máquinas, cambios de estado, producción simulada, solicitudes y exportación CSV. Usa datos locales del navegador. No contiene cuentas, contraseñas ni datos de la base del servidor. No equivale a la aplicación completa.

La vista se publica desde la rama `gh-pages`. En GitHub, Settings → Pages → Source: Deploy from a branch → gh-pages → / (root) → Save. Después de modificar preview, subir main y actualizar la rama de publicación con `git subtree push --prefix preview origin gh-pages`. Un push a main por sí solo no actualiza la vista. La aplicación Next.js con servidor Node y PostgreSQL requiere un alojamiento compatible; GitHub Pages solo admite archivos estáticos.

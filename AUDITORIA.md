# Auditoria tecnica - Factrion

Fecha: 2026-07-28

## Alcance

Auditoria del proyecto Expo/React Native local generado en este repositorio. Se reviso:

- Configuracion Expo, TypeScript y dependencias.
- Arquitectura `app/` y `src/`.
- Persistencia SQLite, migraciones, semilla y repositorio.
- Validaciones de facturas, calculos y reglas de negocio.
- Flujo de pantallas: Inicio, Facturas, Nueva factura, Detalle, Editar y Resumen.
- Cumplimiento del alcance: solo factura, IVA, pago IVA, TAG, contador, ahorro y saldo restante.
- Riesgos de seguridad, mantenibilidad y experiencia de usuario.

## Resultado ejecutivo

El proyecto esta en buen estado base: compila con TypeScript estricto, Expo Doctor no detecta problemas, no hay llamadas de red ni modulos fuera del alcance en `app/` o `src/`, y la persistencia esta correctamente aislada en un repositorio SQLite llamado `facturion.db`.

Los riesgos principales pendientes son la falta de pruebas automatizadas y las vulnerabilidades moderadas reportadas por `npm audit` en dependencias transitivas de Expo. Los hallazgos de validacion defensiva y manejo de errores de edicion/eliminacion fueron corregidos.

## Verificaciones ejecutadas

```bash
npm run typecheck
```

Resultado: OK. `tsc --noEmit` finalizo sin errores.

```bash
npx expo install --check
```

Resultado: OK. Dependencias compatibles con Expo SDK 57.

```bash
npx expo-doctor
```

Resultado: OK. 20/20 checks passed.

```bash
npm audit --json
```

Resultado: 10 vulnerabilidades moderadas, todas en dependencias transitivas ligadas principalmente a `expo`, `@expo/*`, `xcode` y `uuid`.

```bash
rg -n "RUT|gasto|proveedor|inventario|transferencia|meta|firebase|supabase|backend|fetch|axios|console.log" app src package.json app.json tsconfig.json
```

Resultado: OK. No se encontraron campos prohibidos, integraciones externas ni llamadas de red en el codigo fuente de la app.

## Hallazgos

### Resuelto - Validacion defensiva en el repositorio

Referencia: `src/infrastructure/repositories/SQLiteInvoiceRepository.ts:94`

`normalizeInvoiceInput` recalcula IVA y total, bloquea separaciones mayores al total y ahora valida tambien:

- `netAmount <= 0`
- fechas invalidas
- `invoiceNumber` o `clientName` vacios despues de `trim`
- montos negativos en `taxPayment`, `tagAmount`, `accountantAmount` o `savingsAmount`

Estado: corregido.

### Resuelto - Edicion captura errores de carga desde SQLite

Referencia: `app/facturas/editar/[id].tsx:372`

`loadInvoice` en la pantalla de edicion ahora usa `try/catch/finally`, limpia el estado de carga y muestra un estado de error si SQLite falla.

Estado: corregido.

### Resuelto - Eliminacion maneja fallos de base de datos

Referencia: `app/facturas/[id].tsx:97`

`deleteInvoice` ahora captura errores, muestra feedback y deshabilita el boton mientras elimina.

Estado: corregido.

### Bajo - Si falta `id` en rutas dinamicas, la pantalla puede quedar cargando

Referencias:

- `app/facturas/[id].tsx:71`
- `app/facturas/editar/[id].tsx:372`

Ambas pantallas retornan temprano si no existe `invoiceId`, pero no siempre limpian `isLoading`.

Impacto: poco probable con Expo Router, pero posible ante enlaces corruptos o parametros manuales.

Recomendacion: si falta `invoiceId`, setear `isLoading` en `false` y mostrar estado "Factura no encontrada".

### Resuelto - Duplicidad de numero traduce errores SQLite

Referencia: `src/infrastructure/repositories/SQLiteInvoiceRepository.ts:134`

El flujo mantiene el indice unico y ahora traduce errores de constraint `UNIQUE` a un mensaje de negocio.

Estado: corregido.

### Bajo - Filtros de mes/anio aceptan valores incompletos o imposibles

Referencia: `app/(tabs)/facturas.tsx:358`

El filtro acepta `0`, `99` o anios incompletos. No rompe datos, pero puede devolver listas vacias confusas.

Impacto: UX.

Recomendacion: validar mes entre `01` y `12`; aplicar anio solo con 4 digitos.

### Bajo - No hay pruebas automatizadas

Referencia: `package.json`

No existe runner de tests ni pruebas para calculos, schema, repositorio o filtros.

Impacto: cambios futuros pueden romper reglas importantes sin aviso.

Recomendacion minima:

- Tests unitarios para `calculateTax`, `calculateInvoiceTotal`, `calculateRemainingAmount`.
- Tests de Zod para fechas, negativos y separaciones mayores al total.
- Tests de repositorio con base SQLite temporal si el entorno lo permite.

### Bajo - `npm audit` reporta vulnerabilidades moderadas transitivas

Referencia: `package-lock.json`

`npm audit` reporta 10 vulnerabilidades moderadas en dependencias transitivas de Expo/xcode/uuid. La correccion sugerida por npm apunta a un cambio mayor incompatible (`expo@46.0.21`), por lo que no debe aplicarse automaticamente.

Impacto: principalmente cadena de tooling/desarrollo; no se detectaron dependencias directas vulnerables de la app.

Recomendacion: monitorear actualizaciones de Expo SDK 57 y evitar `npm audit fix --force`.

## Cumplimiento de requisitos

Cumple:

- React Native, Expo, TypeScript estricto, Expo Router.
- `expo-sqlite` con `PRAGMA foreign_keys = ON` y `journal_mode = WAL`.
- Tabla `invoices` e indice unico `idx_invoice_number`.
- Base SQLite local configurada como `facturion.db`.
- Repositorio SQLite separado de pantallas.
- Consultas parametrizadas.
- Calculo automatico de IVA 19%.
- Calculo automatico de total y restante.
- Validacion de formulario con Zod.
- Crear, editar, eliminar, buscar y filtrar facturas.
- Resumen general y resumen mensual.
- Datos locales sin backend.
- Sin RUT, gastos, proveedores, inventario, transferencias, metas, Firebase, Supabase ni llamadas HTTP.

Cumple con observacion:

- Datos iniciales: se incluyen 13 facturas reales extraidas del Excel como semilla local. El Excel contenia algunas celdas calculadas inconsistentes; la app recalcula IVA y total segun la regla del prompt.
- Persistencia: SQLite guarda localmente y mantiene datos despues de cerrar la app, sujeto a comportamiento normal del sandbox de la aplicacion.

No cubierto aun:

- Pruebas automatizadas.
- Prueba manual documentada en dispositivo fisico o emulador.

## Arquitectura

Fortalezas:

- Separacion clara entre dominio, infraestructura, hooks, componentes y rutas.
- Las pantallas no contienen SQL directo.
- Los calculos estan centralizados en `src/services/invoiceCalculations.ts`.
- El form reutilizable evita duplicar pantalla de crear/editar.
- Los resumenes usan agregacion SQL eficiente.

Riesgos:

- Hay dos fuentes de validacion: Zod en formulario y validacion parcial en repositorio.
- La semilla esta embebida en codigo; es correcto para una app local con datos del Excel, pero cualquier cambio del Excel requiere nueva migracion o herramienta de importacion.

## Seguridad y privacidad

Fortalezas:

- No hay backend.
- No hay llamadas de red.
- No hay Firebase/Supabase.
- No se almacenan datos sensibles fuera de los campos del Excel.
- SQL parametrizado en operaciones con entrada de usuario.

Riesgos:

- No hay cifrado de base SQLite. Para datos de facturacion local puede ser aceptable, pero si se requiere proteccion ante acceso fisico al dispositivo habria que evaluar cifrado o almacenamiento protegido.

## Datos y calculos

Fortalezas:

- Montos como enteros.
- IVA con `Math.round(netAmount * 0.19)`.
- Total como neto + IVA.
- Restante como total - pago IVA - TAG - contador - ahorro.

Observaciones:

- La app recalcula los totales aunque el Excel tenga valores divergentes. Esto mantiene coherencia con la especificacion.
- El indice unico por `invoice_number` evita duplicados exactos, pero no normaliza variantes como `001` y `1`.

## UI/UX

Fortalezas:

- Interfaz simple y movil.
- Botones grandes.
- Estados vacios.
- Indicadores de carga.
- Confirmacion antes de eliminar.
- Campos de IVA y total de solo lectura.

Mejoras recomendadas:

- Agregar feedback de error en eliminacion.
- Validar visualmente filtros de mes/anio.
- Considerar selector de fecha nativo en el futuro si se permite agregar dependencia o modulo Expo correspondiente.

## Prioridad sugerida de correccion

1. Agregar pruebas unitarias para calculos y schema.
2. Mejorar filtros de mes/anio.
3. Revisar vulnerabilidades transitivas al actualizar Expo.
4. Documentar una prueba manual en dispositivo fisico o emulador.

## Conclusion

El proyecto esta apto como primera version funcional local. La base tecnica es razonable y el alcance esta bien contenido. Antes de considerarlo listo para uso prolongado, conviene cubrir reglas de negocio con pruebas y documentar una prueba manual en dispositivo fisico o emulador.

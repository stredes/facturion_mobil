# PLAN DE MEJORAS Y DEBUGGING — FACTURION-MOBIL

Fecha: 2026-07-31
Estado verificado: typecheck OK (3 PCs) | 23 tests (5 suites) | expo-doctor 18/18

## Fase 1 — DEBUGGING FUNCIONAL (Kali, skill: token-optimization)
Auditar bugs reales en tiempo de ejecucion. Formato de reporte: tabla
(archivo:linea, bug, severidad, fix). MAX 10 hallazgos criticos.

Areas:
1. Hooks: useInvoices.ts, usePaymentSummary.ts, useInvoiceSummary.ts,
   useGeneralPayments.ts, useTaxPayments.ts (estados, refresh, memoizacion)
2. SQLite repos: SQLiteInvoiceRepository (324l), SQLiteGeneralPaymentRepository,
   SQLiteTaxPaymentRepository (transacciones, N+1, filtros fecha, orden)
3. Schemas Zod: fechas, montos, decimales, rangos, superRefine
4. Dominio: invoiceCalculations (redondeo IVA 19%), money (validacion)
5. UI: MoneyInput (parseo decimales/centavos), DateInput

Entregables:
- Tabla hallazgos + fixes SOLO de bugs confirmados (High/Medium)
- typecheck + tests OK
- Reporte en PLAN_MEJORAS.md seccion RESULTADO_FASE1

## Fase 2 — CLEAN CODE & DRY (Arch, skill: clean-code)
1. Reducir app/(tabs)/resumen.tsx (376 lineas): extraer componentes (secciones/cards)
2. Desduplicar formularios: GeneralPaymentForm/TaxPaymentForm/InvoiceForm
   (extraer campos comunes: MoneyField, DateField, campo seccion)
3. Eliminar codigo muerto: exports sin uso, imports duplicados, props sin uso
4. Naming: booleanos is/has/can, funciones verbo+sustantivo, const UPPER_SNAKE
5. Funciones < 20 lineas, early returns, sin side effects

Entregables:
- Refactor aplicado, commits descriptivos
- typecheck + tests OK
- Reporte en PLAN_MEJORAS.md seccion RESULTADO_FASE2

## Fase 3 — SOLID & ARQUITECTURA (Ubuntu Server, skill: solid)
1. SRP: separar responsabilidades en services/repositories/hooks que mezclan logica
2. DIP: verificar ServiceContext (DI) — todo depende de interfaces de domain/
3. ISP: interfaces de repositorio pequenas (Reader/Writer segregadas si aplica)
4. Repo hygiene: git rm --cached facturion.db + agregar a .gitignore
5. Tests faltantes: repositorios (mock expo-sqlite) y hooks — MIN 3 suites nuevas

Entregables:
- Refactor arquitectura aplicado
- facturion.db fuera de git
- Tests nuevos + typecheck OK
- Reporte en PLAN_MEJORAS.md seccion RESULTADO_FASE3

## Fase 4 — INTEGRACION (orquestador)
- Merge ramas feature/* -> main
- Sync 3 maquinas, typecheck + tests en todas
- Actualizar AUDITORIA.md y PLAN.json

## RESULTADO_FASE1 — REPORTE DE DEBUGGING (2026-07-31)

Verificado: `npx tsc --noEmit` OK | `npm test -- --watch=false` 34 tests / 7 suites OK
Fixes aplicados SOLO a bugs High/Medium confirmados con tests nuevos.

| archivo:linea | bug | severidad | fix |
|---|---|---|---|
| src/hooks/useInvoices.ts:33-37, useGeneralPayments.ts:47-51, useTaxPayments.ts:38-42 | `refresh` solo se dispara en `useFocusEffect`; cambiar filtros con la pantalla enfocada no recarga datos (busqueda rota en facturas.tsx, chips de categoria en pagos/index.tsx) | HIGH | refresh depende de clave serializada de filtros (`filtersToKey`) via useMemo; aplicar en los 3 hooks |
| src/components/MoneyInput.tsx:31 | `parseInt(text.replace(/[^\d]/g, ""))` mezcla decimales/centavos: "1500.50" -> 150050, "1.500,75" -> 150075 | MEDIUM | extraer `parseMoneyInput`/`formatMoneyInput` (src/utils/moneyInput.ts): separadores de miles validos se quitan, parte decimal se descarta |
| src/hooks/useInvoices.ts:16-31, useGeneralPayments.ts:26-45, useTaxPayments.ts:17-36 | refrescos solapados: respuesta lenta de un refresh anterior sobrescribe la reciente (stale data) | MEDIUM | guard con `requestIdRef` (solo el ultimo request aplica estado) |
| src/infrastructure/repositories/SQLiteInvoiceRepository.ts:233,249 | `ORDER BY CAST(invoice_number AS INTEGER) DESC` -> numeros de factura no numericos ("FAC-001") castean a 0, orden inestable en empates de fecha | LOW | NO fijado (fase 2): usar `created_at DESC` como tiebreaker |
| src/application/InvoiceService.ts:25-48 | filtros month/year aplicados en memoria: `findAll` trae todas las filas y filtra en JS (perf) | LOW | NO fijado (fase 3): mover filtros a SQL |
| src/infrastructure/repositories/SQLiteInvoiceRepository.ts:129-218 | TOCTOU en `existsByInvoiceNumber` + INSERT sin transaccion (mitigado por indice UNIQUE); SELECT extra post-write (N+1) | LOW | NO fijado (fase 3): envolver en `withTransactionAsync` |
| src/components/MoneyInput.tsx:18-20 | value 0 se muestra vacio (no distinguible de campo sin valor) | LOW | NO fijado: placeholder "0" ya cubre el caso |

Zod (v4.4.3): sin bugs confirmados — `.int()` ya rechaza NaN/Infinity/no-safe-integers/0.
Redondeo IVA (`Math.round(netAmount * 0.19)`): sin divergencias vs. aritmetica entera en 1..1M; comportamiento correcto.

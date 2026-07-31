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

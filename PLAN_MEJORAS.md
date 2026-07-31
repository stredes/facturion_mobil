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

## RESULTADO_FASE2 — CLEAN CODE & DRY (Arch, skill: clean-code)

### 1. Resumen (app/(tabs)/resumen.tsx: 376 -> 126 lineas)
- `src/hooks/useMonthlySummary.ts` — orquesta los 3 servicios + estado (loading/error)
- `src/utils/monthlySummary.ts` — logica pura de union/orden (testeada)
- `src/components/summary/MonthlySummaryCard.tsx` — card mensual extraida
- `src/components/summary/MonthlySummarySkeleton.tsx` — skeleton extraido
- 4 tests nuevos para `combineMonthlySummaries` (src/utils/__tests__/monthlySummary.test.ts)

### 2. Formularios desduplicados (DRY)
Nuevos componentes compartidos en `src/components/form/`:
- `FormScaffold.tsx` — KeyboardAvoidingView + ScrollView + error de submit + footer sticky
- `FormSection.tsx` — seccion con icono + titulo (antes solo en InvoiceForm)
- `MoneyField.tsx` / `DateField.tsx` / `TextField.tsx` — campos ligados a react-hook-form (useController)
- `useFormWithReset.ts` — hook useForm + reset de defaults
- GeneralPaymentForm 254->173, TaxPaymentForm 239->120, InvoiceForm 347->200 (neto)

### 3. Codigo muerto eliminado
- `src/components/SecondaryButton.tsx` (sin uso)
- `src/hooks/useInvoiceSummary.ts`, `src/hooks/usePaymentSummary.ts` (sin uso)
- `SummaryCardSkeleton` de LoadingSkeleton (sin uso)
- theme/animations.ts: se eliminaron exports sin uso (animationDuration, easing, createFadeIn, cardEnterAnimation); queda springConfig
- Imports sin uso: React/spacing/typography en (tabs)/index.tsx, Text en facturas/editar/[id].tsx
- `styles: any` -> StyleSheet.create en (tabs)/index.tsx; `width as any` -> tipo `number | \`${number}%\`` en LoadingSkeleton
- `contentContainerStyle?: object` -> StyleProp<ViewStyle> en ScreenContainer
- Se mantienen por diseno: `findRecent` y `validateMoney` (contrato de puerto/dominio con tests)

### 4. Naming
- Booleanos is/has/can: `initialLoading`->`isInitialLoading`, `refreshing`->`isRefreshing`, `showDeleteDialog`->`isDeleteDialogVisible`
- Funciones verbo+sustantivo: `categoryLabel`->`formatCategoryLabel`
- Constantes ya usaban UPPER_SNAKE (CATEGORIES, CATEGORY_FILTERS, TAX_PERIOD_PATTERN, ICON)

### 5. Funciones cortas y early returns
- `refresh` de useMonthlySummary (< 20 lineas), `combineMonthlySummaries`/`buildCombinedMonth` separadas
- Componentes de form con handlers `submit` <= 15 lineas
- Pendiente (fuera de alcance Fase 2): refactor de (tabs)/index.tsx (389 lineas, calculos + JSX mezclados)

### Infra de tests
- `jest.config.js` (preset ts-jest) + script `npm test` (jest@29 + ts-jest@29)
- Antes: no habia runner ni script (npm test fallaba). Ahora: 6 suites, 27 tests

### Verificacion
- `npx tsc --noEmit` OK
- `npm test -- --watch=false` OK (27 tests, 6 suites)
- Commits: test runner, refactor resumen, refactor formularios, dead code, naming
- Rama: feat/phase2-clean

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

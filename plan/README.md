# PLAN DE MEJORA UI — FACTURIION

## Fases

### ✅ FASE 0 — Tema y Componentes Base (Completada en Local)
Archivos creados/modificados:
- `src/theme/colors.ts` — Paleta de colores completa
- `src/theme/spacing.ts` — Sistema de espaciado
- `src/theme/typography.ts` — Jerarquía tipográfica
- `src/theme/radius.ts` — Bordes consistentes
- `src/theme/shadows.ts` — Sombras Android/iOS
- `src/theme/index.ts` — Export unificado
- `src/components/ScreenContainer.tsx` — Contenedor con safe area
- `src/components/AppHeader.tsx` — Encabezado reutilizable
- `src/components/StatusBadge.tsx` — Indicador de estado (pagada/pendiente)
- `src/components/AmountRow.tsx` — Fila label + valor
- `src/components/TextInputField.tsx` — Input con label visible
- `src/components/DateInput.tsx` — Input de fecha
- `src/components/SectionTitle.tsx` — Título de sección
- `src/components/PrimaryButton.tsx` — Botón principal
- `src/components/SecondaryButton.tsx` — Botón secundario
- `src/components/SearchInput.tsx` — Búsqueda con lupa
- `src/components/FilterChip.tsx` — Chip de filtro
- `src/components/LoadingState.tsx` — Skeletons animados
- `src/components/ErrorState.tsx` — Mensaje de error
- `src/components/ConfirmModal.tsx` — Modal de confirmación
- `src/components/SummaryCard.tsx` — Refactorizado con theme
- `src/components/InvoiceCard.tsx` — Refactorizado con StatusBadge
- `src/components/EmptyState.tsx` — Mejorado con botón acción
- `src/components/FloatingActionButton.tsx` — Refactorizado con theme
- `src/components/MoneyInput.tsx` — Refactorizado con $ y readonly

### 🔄 FASE 1 — Home, Facturas y Navegación (Mint - 192.168.1.90)
Pendiente:
- Refactor `app/(tabs)/_layout.tsx` con theme
- Refactor `app/(tabs)/index.tsx` con nueva jerarquía
- Refactor `app/(tabs)/facturas.tsx` con SearchInput, FilterChip, etc.

### 🔄 FASE 2 — Formulario, Detalle, Resumen y Estados (Kali - 192.168.1.100)
Pendiente:
- Refactor `src/components/InvoiceForm.tsx` con SectionTitle, campos readonly
- Refactor `app/facturas/[id].tsx` con AmountRow, StatusBadge, ConfirmModal
- Refactor `app/(tabs)/resumen.tsx` con SummaryCards verticales
- Refactor `app/facturas/nueva.tsx` y `editar/[id].tsx`

### ❓ FASE 3 — Verificación
- `npx tsc --noEmit` en las 3 máquinas
- Verificar consistencia

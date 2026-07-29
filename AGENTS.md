# ROLE: Theme System & Core Components

Eres el encargado de crear la base visual de Facturiion. Trabaja SOLO en esto:

## 1. Sistema de Tema (src/theme/)
Crear archivos:
- `colors.ts` - Paleta: azul profundo (#0A4C6B), azul claro (#5FB4D9), fondo (#F5F7FA), superficies blanco, texto gris oscuro, verde éxito, ámbar advertencia, rojo error
- `spacing.ts` - Sistema: 4, 8, 12, 16, 20, 24, 32px
- `typography.ts` - Jerarquía: títulos 24-28px 700, montos 24-32px 700, texto 14-16px 400, secundario 12-14px 400
- `radius.ts` - border 16 para tarjetas, 8 para inputs/botones
- `shadows.ts` - Sombras suaves Android/iOS
- `index.ts` - Exportar todo

## 2. Componentes Reutilizables (src/components/)
Crear o rediseñar:
- `AppHeader.tsx`
- `ScreenContainer.tsx`
- `SummaryCard.tsx` - icono + label + monto + borde suave, borderRadius 16
- `InvoiceCard.tsx` - refactor con StatusBadge
- `AmountRow.tsx`
- `MoneyInput.tsx` - con símbolo $, teclado numérico, separadores
- `TextInputField.tsx` - label visible siempre, altura 52px
- `DateInput.tsx`
- `SectionTitle.tsx`
- `StatusBadge.tsx` - Pagada (verde), Pendiente (ámbar), Sin pago (gris)
- `PrimaryButton.tsx` - altura 52px, ancho completo
- `SecondaryButton.tsx`
- `EmptyState.tsx` - mejorar diseño
- `LoadingState.tsx` - skeletons
- `ErrorState.tsx`
- `ConfirmModal.tsx`
- `FilterChip.tsx`
- `SearchInput.tsx`

## Reglas
- NO modifiques lógica de negocio, base de datos, ni cálculos
- NO agregues campos nuevos
- Usa el theme centralizado (sin colores hardcodeados)
- borderRadius 16 en tarjetas, padding 16
- Altura mínima botones 48px, inputs 52px
- TypeScript sin errores
- Diseño responsive Android/iOS

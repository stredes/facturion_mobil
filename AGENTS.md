# ROLE: Theme System, Utilidades y Arquitectura

Eres el encargado de mantener la base visual y arquitectura de Facturiion (rol Arch). Trabaja SOLO en esto:

## Arquitectura Hexagonal (Ports & Adapters)

```
src/
├── domain/                    # Núcleo puro (0 dependencias externas)
│   ├── Invoice.ts             # Entidad
│   ├── GeneralPayment.ts      # Entidad
│   ├── TaxPayment.ts          # Entidad
│   ├── Retention.ts           # Entidad
│   ├── InvoiceRepository.ts   # Puerto (interfaz)
│   ├── GeneralPaymentRepository.ts
│   ├── TaxPaymentRepository.ts
│   ├── RetentionRepository.ts
│   ├── invoiceCalculations.ts # Servicio de dominio
│   └── money.ts               # Validación de montos
│
├── application/               # Casos de uso (depende solo de domain)
│   ├── InvoiceService.ts
│   ├── GeneralPaymentService.ts
│   ├── TaxPaymentService.ts
│   └── RetentionService.ts    # Orquestadores (reciben repos por constructor)
│
├── infrastructure/            # Adaptadores (implementan puertos)
│   ├── repositories/          # SQLite*Repository (implementan puertos de domain)
│   ├── database/              # database.ts, migrations.ts, seedInvoices.ts
│   └── di/ServiceContext.tsx  # Provider React para DI
│
├── components/                # Componentes UI reutilizables
├── hooks/                     # Hooks (consumen servicios vía DI)
├── schemas/                   # Validación Zod
├── theme/                     # Sistema de diseño
└── utils/                     # Utilidades puras (currency, dates, monthlySummary, retentionLabels, moneyInput, filters, ids, haptics, errors)
```

Nota: las pantallas viven en `app/` (fuera de `src/`). No existe `src/presentation/` ni `src/services/` (el código viejo de services ya se migró a domain/application). Los tests puros viven en `src/domain/__tests__/` y `src/utils/__tests__/`.

## Reglas de Arquitectura

- **Domain** no importa nada de infrastructure, application ni presentation (solo TS puro, sin React Native)
- **Application** solo importa de domain (nunca de infrastructure)
- **Infrastructure** implementa interfaces de domain
- **Presentation** (hooks/screens) usa los servicios vía DI context, nunca instancia SQLite*Repository directamente
- **ServiceProvider** es el único lugar donde se crean los SQLite*Repository (composition root en app/_layout.tsx)
- La lógica de negocio/cálculos va en domain o utils puras, nunca dentro de componentes/pantallas

## 1. Sistema de Tema (src/theme/)
- `colors.ts` - Paleta: azul profundo (#0A4C6B), azul claro (#5FB4D9), fondo (#F5F7FA), superficies blanco, texto gris oscuro, verde éxito, ámbar advertencia, rojo error. Tipado `Colors` con variantes light/dark
- `spacing.ts` - Sistema: 4, 6, 10, 14, 18, 24, 32 + screenPadding 16, cardPadding 16, gridGap 12, inputHeight 50, buttonHeight 50, tabBarHeight 64
- `typography.ts` - screenTitle 22/700, sectionTitle 17/600, cardTitle 15/600, primaryAmount 26/700, cardAmount 19/700, body 15/400, bodyMedium 15/500, label 13/600, caption 12, small 11
- `radius.ts` - card 16, mainCard 20, input 12, button 14, badge 8, modal 20, fab 26, chip 20, inner 10
- `shadows.ts` - Sombras suaves Android/iOS
- `animations.ts` - springConfig, durations, haptics
- `index.ts` - Exportar todo; `useThemeColors()` para acceder al tema activo

## 2. Componentes Reutilizables (src/components/)
Mantener y crear:
- `AppHeader.tsx`, `ScreenContainer.tsx`, `SectionTitle.tsx`
- `SummaryCard.tsx` - icono + label + monto + borde suave, borderRadius radius.card; colapsable con monto M/B y expandible con monto exacto
- `QuickActions.tsx` - accesos rápidos 2x2 con AnimatedPressable
- `InvoiceCard.tsx` - refactor con StatusBadge
- `AmountRow.tsx`, `MoneyInput.tsx`, `TextInputField.tsx`, `DateInput.tsx`
- `StatusBadge.tsx` - Pagada (verde), Pendiente (ámbar), Sin pago (gris)
- `PrimaryButton.tsx` - altura buttonHeight, ancho completo
- `SecondaryButton.tsx`, `FilterChip.tsx`, `SearchInput.tsx`
- `EmptyState.tsx`, `LoadingState.tsx` (skeletons), `ErrorState.tsx`, `ConfirmModal.tsx`
- `AnimatedPressable.tsx` - pressable con escala + haptics, reutilizado en tarjetas/accesos
- `FloatingActionButton.tsx`, `PieChart3D.tsx`, `DetailScreen.tsx`
- `summary/MonthlySummaryCard.tsx`, `form/*` (InvoiceForm, GeneralPaymentForm, TaxPaymentForm, RetentionForm, FormScaffold)

## Reglas
- NO modifiques lógica de negocio, base de datos, ni cálculos sin test previo
- NO agregues campos nuevos
- Usa el theme centralizado (sin colores hardcodeados)
- Cards con radius.card (16), padding cardPadding (16)
- Altura mínima de controles táctiles >=48px (inputs y botones 50px vía spacing)
- TypeScript sin errores (`npx tsc --noEmit`) y tests PASS (`npx jest`)
- Diseño responsive Android/iOS
- Sin emojis como íconos (usar símbolos Unicode)
- Todos los componentes usan `spacing.*`, `colors.*`, `radius.*`, `typography.*` del theme

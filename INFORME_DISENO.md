# Informe de diseño — Facturiion

## 1. Identidad visual actual

Facturiion utiliza una interfaz financiera sobria, clara y funcional. El diseño prioriza la lectura de montos, facturas, pagos e información tributaria sobre los elementos decorativos.

La aplicación combina:

- fondos gris muy claro;
- tarjetas blancas;
- azul petróleo como color principal;
- turquesa como acento secundario;
- bordes suaves y sombras discretas;
- tipografía nativa del sistema;
- cifras con ancho tabular para facilitar la comparación de montos.

El estilo general puede definirse como **aplicación financiera moderna, minimalista y profesional**.

El nuevo icono introduce una identidad más tecnológica: fondo oscuro, azules eléctricos, brillo neón y un símbolo que combina una `F` con una factura. Actualmente, el interior de la aplicación conserva una apariencia más clara y corporativa que el icono.

## 2. Tecnología utilizada para el diseño

La interfaz está construida con:

- React Native;
- Expo SDK 54;
- Expo Router;
- `StyleSheet` de React Native;
- componentes visuales propios;
- animaciones nativas con `Animated`;
- adaptación a áreas seguras mediante `react-native-safe-area-context`.

No se utiliza una biblioteca de interfaz como NativeBase, React Native Paper, Tamagui o Material UI. Tampoco existe actualmente una biblioteca dedicada de iconos. Los iconos de navegación y varias acciones se representan mediante caracteres Unicode.

Esto significa que Facturiion posee un sistema visual propio y controlado directamente desde el código.

## 3. Paleta de colores

Fuente principal: `src/theme/colors.ts`.

### Colores de marca

| Uso | Color | Valor |
|---|---|---|
| Primario | Azul petróleo | `#123B5D` |
| Primario claro | Azul grisáceo claro | `#E8F1F7` |
| Primario oscuro | Azul profundo | `#0D2A42` |
| Acento | Turquesa | `#2B8C9E` |
| Acento claro | Turquesa claro | `#65C7C9` |

### Fondos y superficies

| Uso | Valor |
|---|---|
| Fondo principal | `#F6F8FA` |
| Fondo secundario | `#FFFFFF` |
| Fondo terciario | `#EEF2F5` |
| Tarjetas y superficies | `#FFFFFF` |
| Superficie secundaria | `#F8FAFC` |

### Texto

| Uso | Valor |
|---|---|
| Texto principal | `#17212B` |
| Texto secundario | `#66727E` |
| Texto terciario | `#8A949E` |
| Texto inverso | `#FFFFFF` |
| Texto deshabilitado | `#CBD5E1` |

### Estados

| Estado | Color principal | Fondo claro |
|---|---|---|
| Éxito | `#2E8B57` | `#E7F5EC` |
| Advertencia | `#C78316` | `#FFF4D8` |
| Error | `#C84646` | `#FDECEC` |
| Información | `#3277A8` | `#E8F2F9` |

### Bordes

- borde claro: `#DDE3E8`;
- borde medio: `#CBD5E1`;
- borde oscuro: `#8A949E`.

## 4. Tipografía

Fuente principal: `src/theme/typography.ts`.

Se utiliza la fuente nativa del sistema operativo. No hay una fuente externa instalada.

| Estilo | Tamaño | Interlineado | Peso |
|---|---:|---:|---:|
| Título de pantalla | 22 | 28 | 700 |
| Título de sección | 17 | 22 | 600 |
| Título de tarjeta | 15 | 20 | 600 |
| Monto principal | 26 | 32 | 700 |
| Monto en tarjeta | 19 | 24 | 700 |
| Texto normal | 15 | 21 | 400 |
| Texto medio | 15 | 21 | 500 |
| Etiqueta | 13 | 18 | 600 |
| Descripción | 12 | 16 | 400 |
| Texto pequeño | 11 | 14 | 400 |

Los estilos para montos usan números tabulares. Esto mantiene todos los dígitos con un ancho uniforme y mejora la alineación visual de valores monetarios.

## 5. Espaciado

Fuente principal: `src/theme/spacing.ts`.

La escala base es:

| Token | Valor |
|---|---:|
| `xxs` | 4 px |
| `xs` | 6 px |
| `sm` | 10 px |
| `md` | 14 px |
| `lg` | 18 px |
| `xl` | 24 px |
| `xxl` | 32 px |

Medidas estructurales:

- margen horizontal de pantalla: 16 px;
- relleno de tarjetas: 16 px;
- separación de cuadrícula: 12 px;
- separación entre secciones: 22 px;
- altura de campos: 50 px;
- altura de botones: 50 px;
- altura base de navegación inferior: 64 px;
- altura del encabezado: 56 px.

## 6. Bordes y formas

Fuente principal: `src/theme/radius.ts`.

| Elemento | Radio |
|---|---:|
| Tarjeta normal | 14 px |
| Tarjeta principal | 18 px |
| Campo de entrada | 12 px |
| Botón | 13 px |
| Etiqueta o badge | 6 px |
| Modal | 16 px |
| Botón flotante | 28 px |
| Chip de filtro | 18 px |
| Contenedor interior | 8 px |

El lenguaje visual utiliza esquinas redondeadas moderadas. Las tarjetas no son completamente planas, pero tampoco adoptan un aspecto excesivamente redondo.

## 7. Sombras y profundidad

Fuente principal: `src/theme/shadows.ts`.

Las sombras son suaves:

- tarjetas: elevación 1 en Android;
- elementos destacados: elevación 3;
- botón flotante: elevación 5;
- modales: elevación 8.

En iOS se utilizan sombras negras con opacidad entre `0.05` y `0.12`. El objetivo es separar superficies sin producir una interfaz pesada.

## 8. Animaciones

Fuente principal: `src/theme/animations.ts`.

Duraciones:

- rápida: 120 ms;
- normal: 200 ms;
- lenta: 280 ms.

Los elementos presionables reducen levemente su escala al tocarlos y regresan mediante una animación de resorte. Las tarjetas pueden entrar con una aparición progresiva y retrasos escalonados de hasta 200 ms.

La interacción busca sentirse ágil y discreta.

## 9. Componentes visuales principales

El sistema incluye componentes propios para:

- encabezados de pantalla;
- contenedores con área segura;
- tarjetas de facturas;
- tarjetas de resumen;
- filas de montos;
- campos de texto;
- campos monetarios;
- selector de fecha;
- botones primarios y secundarios;
- chips de filtros;
- botón flotante de creación;
- estados vacíos;
- estados de error;
- estados de carga y skeletons;
- diálogos y modales de confirmación.

### Tarjetas

Las tarjetas usan fondo blanco, borde gris claro de 1 px, radio de 14 px y sombra leve. Los totales y montos importantes se destacan con azul petróleo.

### Botón primario

Fondo azul petróleo, texto blanco, altura mínima de 50 px y radio de 13 px.

### Botón secundario

Fondo blanco, borde gris claro y texto azul petróleo.

### Campos

Fondo blanco, borde gris claro, altura mínima de 50 px y radio de 12 px. Los errores cambian el borde y el mensaje auxiliar a rojo.

### Filtros

Los chips no seleccionados son blancos. El chip activo utiliza fondo azul petróleo y texto blanco.

## 10. Navegación

La aplicación usa cuatro pestañas inferiores:

1. Inicio;
2. Facturas;
3. Pagos;
4. Resumen.

La barra inferior utiliza fondo blanco, borde superior claro y azul petróleo para la opción activa.

Las pantallas secundarias se abren mediante navegación tipo Stack:

- crear factura;
- detalle de factura;
- editar factura;
- crear o editar pago general;
- crear o editar pago de IVA.

## 11. Patrones por pantalla

### Inicio

Presenta información financiera de alto nivel mediante tarjetas de resumen, actividad reciente y acceso a registros. Los valores más importantes tienen mayor tamaño y peso tipográfico.

### Facturas

Usa búsqueda, tarjetas individuales y un botón flotante para crear registros. Cada tarjeta separa neto, IVA y total.

### Pagos

Utiliza control segmentado para separar pagos generales e IVA. Los pagos generales permiten filtrar por TAG, contador y ahorro.

### Resumen

Organiza la información por mes. Cada periodo puede expandirse para mostrar facturación, pagos y reserva de IVA. El bloque de total facturado usa fondo azul sólido para crear jerarquía.

### Formularios

Los formularios siguen una disposición vertical con etiquetas visibles, campos blancos y botones de acción al final.

## 12. Adaptación y accesibilidad

El diseño contempla:

- áreas seguras para cámaras y barras del sistema;
- campos y botones de aproximadamente 50 px de altura;
- reducción automática del tamaño de montos largos;
- diseños especiales para pantallas menores a 360 px;
- etiquetas de accesibilidad en varias acciones;
- colores específicos para éxito, advertencia y error;
- carga mediante skeletons y estados explícitos.

La aplicación está configurada actualmente en modo claro. No existe un tema oscuro para el interior.

## 13. Diferencias e inconsistencias detectadas

Aunque existe un tema central, algunas pantallas todavía definen medidas y estilos locales en vez de reutilizar los componentes:

- hay más de una implementación del botón flotante;
- algunos iconos son caracteres Unicode y pueden verse distintos entre dispositivos;
- ciertos tamaños, radios y separaciones están escritos directamente en las pantallas;
- algunas tarjetas de pagos repiten estilos que podrían convertirse en un componente;
- el icono azul neón tiene una personalidad visual más oscura y tecnológica que la interfaz clara actual;
- existen valores repetidos entre `spacing.ts` y `radius.ts`.

Estas diferencias no impiden usar la aplicación, pero dificultan mantener una identidad completamente uniforme.

## 14. Definición breve para reutilizar como contexto

> Facturiion es una aplicación móvil financiera para administrar facturas, pagos generales e IVA. Su interfaz utiliza React Native y Expo con un sistema de diseño propio. El estilo es moderno, limpio, profesional y orientado a datos. Usa fondo gris muy claro, superficies blancas, azul petróleo `#123B5D` como color principal, turquesa `#2B8C9E` como acento, bordes suaves, sombras discretas, tipografía nativa y cifras tabulares. Las tarjetas tienen radios de 14 a 18 px; botones y campos miden aproximadamente 50 px de alto. La navegación inferior contiene Inicio, Facturas, Pagos y Resumen. Se debe priorizar legibilidad, jerarquía de montos, consistencia, accesibilidad y rapidez de uso.

## 15. Dirección visual recomendada

Para conservar la base actual y acercarla al nuevo icono:

- mantener el modo claro como experiencia principal;
- evolucionar el azul petróleo hacia un azul más eléctrico solo en acentos destacados;
- usar el cian del icono con moderación para acciones o datos clave;
- reemplazar caracteres Unicode por una familia consistente de iconos;
- unificar tarjetas de facturas, pagos y resúmenes;
- centralizar todos los valores visuales en el tema;
- evitar brillos intensos dentro de pantallas de trabajo para proteger la legibilidad;
- reservar el efecto neón para identidad de marca, pantalla de inicio o elementos promocionales.

El objetivo debe ser conectar el nuevo icono con la aplicación sin perder el carácter profesional y contable de la interfaz.

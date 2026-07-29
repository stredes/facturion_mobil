# ROL: Arquitectura, Calidad y DRY

Analiza el proyecto facturion-mobil en ~/Workspace/facturion-mobil con este enfoque:

1. **ARQUITECTURA**: Evalúa la separación de capas (domain, infrastructure, presentation). ¿Sigue clean architecture? ¿Hay dependencias circulares?
2. **DRY**: Detecta código duplicado o lógica repetida entre componentes y screens.
3. **TYPESTAMP**: ¿El TypeScript strict está bien aprovechado? ¿Hay "any", tipos perdidos, o inferencia insuficiente?
4. **COMPONENTES**: ¿Los componentes son reutilizables? ¿Hay mezcla de lógica y presentación?
5. **MANTENIBILIDAD**: Complejidad ciclomática, funciones muy largas, responsabilidades mezcladas.

Devuelve un reporte estructurado con hallazgos críticos, medios y sugerencias.

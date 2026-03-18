# FF Speed Cars — Guía del Panel de Administración

**URL:** `/admin`
**Acceso:** Solo con usuario y contraseña del administrador

---

## Acceso y Login

Para ingresar al panel, visitá `/admin` e ingresá con tu email y contraseña de administrador.
Si es la primera vez que lo usás, el usuario inicial se crea entrando a `/api/admin/setup` una sola vez.

> Nunca compartás tus credenciales. Si necesitás dar acceso al equipo de ventas, usá la sección **Vendedores** (tienen su propio acceso independiente).

---

## 1. Dashboard

**Qué es:** La pantalla de inicio del panel. Muestra un resumen rápido del estado del negocio.

**Para qué sirve:**
- Ver la cantidad de vehículos activos en el catálogo
- Revisar los últimos vehículos cargados con su marca, modelo, año, precio y tipo de combustible

**Cómo usarlo:**
- Es una pantalla de solo lectura, no requiere acción
- Usala como punto de partida cada vez que entrés al panel para tener una foto rápida del inventario

---

## 2. Vehículos

**Qué es:** El inventario completo. Desde acá cargás, editás y eliminás los autos del catálogo público.

**Para qué sirve:**
- Agregar nuevos vehículos al sitio web
- Actualizar precio, descripción o imágenes de un vehículo existente
- Cambiar el estado de un vehículo (Disponible, Reservado, Vendido, Retirado)
- Marcar un vehículo como **Destacado** para que aparezca en la sección principal del sitio

**Cómo cargar un vehículo nuevo:**
1. Clic en **Nuevo vehículo**
2. Completar: Marca, Modelo, Año, Precio, Tipo de carrocería, Kilometraje, Combustible, Transmisión, Color
3. Subir las fotos (arrastrá o hacé clic en el área de imágenes)
4. Agregar descripción y características opcionales
5. Guardar — el vehículo aparece de inmediato en el catálogo público

**Estados disponibles:**
| Estado | Qué significa |
|---|---|
| Disponible | Visible y disponible para compra |
| Reservado | Visible pero con indicador de reserva |
| Vendido | Se muestra como vendido |
| Retirado | Oculto del catálogo público |

**Notas importantes:**
- El campo **Millaje** se ingresa y se muestra siempre en millas (mi), tanto en el panel como en el sitio público.
- El precio se muestra en dólares.
---

## 3. Citas (Turnos)

**Qué es:** El sistema de agenda para reservas de visitas al local.

**Para qué sirve:**
- Ver todos los turnos agendados por los clientes desde el sitio web
- Gestionar el estado de cada cita
- Revisar la agenda del día de forma visual

**Tiene dos vistas:**

### Vista Historial
Lista completa de todas las citas con filtros por:
- Nombre del cliente
- Vehículo de interés
- Vendedor asignado
- Estado (Pendiente / Confirmado / Cancelado / Completado)
- Fecha

Desde acá podés cambiar el estado de cada cita haciendo clic en el badge de estado.

### Vista Agenda
Muestra el día seleccionado con los bloques horarios y qué citas hay en cada uno.
- Los horarios de semana son de 9 AM a 6 PM
- Los domingos de 10 AM a 4 PM
- Cada bloque muestra cuántas citas hay y quién agendó

**Cómo gestionar un turno:**
1. Encontrá la cita en el Historial
2. Hacé clic en su estado actual (ej: "Pendiente")
3. Seleccioná el nuevo estado del menú
4. El cambio se guarda automáticamente

**Tip:** Podés copiar el teléfono o email del cliente directo desde la tabla para contactarlo rápido.

---

## 4. Vendedores

**Qué es:** Gestión del equipo de ventas. Cada vendedor tiene su propio acceso y link de referido.

**Para qué sirve:**
- Crear cuentas para los miembros del equipo de ventas
- Ver quién está activo
- Eliminar accesos cuando alguien deja el equipo
- Cada vendedor tiene un **link único** que pueden compartir con clientes. Las visitas y citas generadas por ese link quedan registradas bajo su nombre.

**Cómo crear un vendedor:**
1. Completar: Nombre completo, Usuario (sin espacios, en minúsculas), Contraseña, Email (opcional)
2. Guardar — el vendedor puede ingresar de inmediato en `/seller/login`

**El acceso del vendedor le permite:**
- Ver las citas y leads que vienen de su link
- Compartir vehículos específicos con sus clientes

**Importante:** Si eliminás un vendedor, sus datos históricos (citas, leads) se conservan pero ya no puede ingresar al sistema.

---

## 5. Leads

**Qué es:** Registro automático de clientes potenciales que completaron el formulario de contacto del sitio.

**Para qué sirve:**
- Ver todos los contactos que llegaron a través del sitio
- Filtrar por vendedor (para saber qué leads trajo cada uno), vehículo de interés y fecha
- Tener el nombre, teléfono y email del cliente para hacer seguimiento

**Cómo usarlo:**
- Es una pantalla de solo lectura — los leads se generan automáticamente cuando un cliente llena el formulario de contacto del sitio
- Usá los filtros para buscar por vendedor o rango de fechas
- Exportá o anotá los datos de los clientes que quieras contactar

---

## 6. Referidos

**Qué es:** Panel de estadísticas de rendimiento por vendedor.

**Para qué sirve:**
- Ver cuántas visitas trajo cada vendedor a través de su link
- Ver cuántos vehículos distintos visitaron esos clientes
- Medir la tasa de conversión (cuántas visitas se convirtieron en citas)

**Métricas que muestra:**
| Métrica | Qué significa |
|---|---|
| Vistas totales | Cuántas veces abrieron el sitio con su link |
| Vehículos únicos | Cuántos autos distintos vieron |
| Citas | Cuántas citas agendaron desde su link |
| Conversión | % de visitas que terminaron en cita |

**Colores de conversión:**
- 🟢 Verde: más del 20% de conversión (excelente)
- 🟡 Amarillo: entre 10% y 20% (normal)
- 🔴 Rojo: menos del 10% (bajo)

---

## Preguntas frecuentes del panel

**¿Cómo actualizo el precio de un auto?**
Vehículos → clic en el lápiz (editar) → cambiar precio → Guardar.

**¿Cómo marco un auto como vendido?**
Vehículos → editar → cambiar Estado a "Vendido" → Guardar. También podés usar el botón de acción rápida en la lista.

**¿Los clientes pueden agendar fuera del horario de atención?**
No. El sistema solo muestra los horarios disponibles según el día (lun-sáb 9-18, dom 10-16). Las horas ya ocupadas tampoco aparecen.

**¿Qué pasa si borro un vehículo?**
Se elimina del catálogo de forma permanente junto con sus imágenes. Si lo querés ocultar temporalmente, usá el estado "Retirado" en vez de borrarlo.

**¿Cómo cambio mi contraseña de administrador?**
Por ahora se hace directamente desde la consola de Firebase Authentication. Próximamente desde el panel.

---

*FF Speed Cars — Panel interno. No compartir este documento.*

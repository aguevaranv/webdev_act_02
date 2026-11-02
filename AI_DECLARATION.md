# Declaración de uso de Inteligencia Artificial

**Proyecto:** Lista de Tareas - Actividad Integradora 2  
**Estudiante:** Angel Mauricio Guevara Chinchero  
**Materia:** Programación de Sistemas Web - Universidad ECOTEC

## 1. ¿Qué herramientas de IA utilicé y en qué momentos?

Utilicé **Claude (Anthropic)** durante todo el desarrollo, en estos momentos:

| Momento | Para qué la usé |
|---|---|
| Antes de empezar | Le pedí una guía para hacer la actividad desde cero. Me entregó una aplicación de referencia y una guía en PDF dividida en 8 etapas (una por commit), con los conceptos de cada etapa. |
| Etapas 3 a 7 (desarrollo) | Escribí el código siguiendo las etapas. Cuando algo no funcionaba, le mostraba mi código para que me explicara qué faltaba o por qué fallaba. |
| Etapa 7 (investigación) | Me explicó cómo dividir mi `app.js` en módulos ES6 y por qué hay que evitar las dependencias circulares. |
| Documentación | Me ayudó a redactar el informe PDF, el `README.md` y esta declaración, que después revisé. |

## 2. Prompts clave utilizados

1. > "Ayúdame con la actividad integradora 2. Ayúdame a desarrollar una guía para utilizarla en un proyecto que lo haré desde cero."

2. > "En la etapa de crud no entiendo cómo hacer esto [...] estoy poniéndole así: [mi función renderizarLista]"

3. > "Estoy en la etapa de persistencia de datos pero no me deja ni crear las tareas o no se ven en la lista."

4. > "Estoy tratando de utilizar los filtros y de ordenar las listas pero no hace ninguna de las dos cosas. ¿Puedes revisar qué puede estar faltando?"

5. > "¿Cómo puedo separar mi archivo app.js para tener una arquitectura modular ES6?"

## 3. ¿Qué partes del código sugerido contenían errores o requirieron ajustes manuales?

El código de la aplicación de referencia ya estaba organizado en módulos, pero yo lo construí en un solo archivo hasta la etapa 7. Por eso varias partes no encajaban directamente con mi proyecto y tuve que ajustarlas:

1. **Botones de cada tarea.** El código de referencia usaba `acciones.alternar(tarea.id)`, pero en mi versión de un solo archivo el objeto `acciones` no existía. Tuve que cambiarlo por la llamada directa `alternarTarea(tarea.id)`. En la etapa 7, al separar los módulos, volví a usar `acciones` como parámetro.

2. **Función faltante en el dashboard.** `actualizarVista()` llamaba a `actualizarDashboard()`, que no estaba en mi archivo. Al marcar o eliminar una tarea, la consola mostraba `actualizarDashboard is not defined`, así que tuve que crear la función.

3. **Las tareas no se dibujaban.** Al integrar el código de edición en el `submit`, borré las líneas que redibujaban la lista. Las tareas se guardaban en el arreglo, pero no aparecían en pantalla. Agregué `cancelarEdicion()` y `actualizarVista()` al final del evento.

4. **Error de inicialización.** Puse el código de inicio (`tareas = cargarTareas()`) al principio del archivo, pero la constante `CLAVE` estaba declarada al final. Esto provocaba `ReferenceError: Cannot access 'CLAVE' before initialization` y detenía todo el script, por lo que el formulario dejó de funcionar. Lo solucioné moviendo el inicio al final del archivo.

5. **Filtros y ordenamiento sin efecto.** En el codigo sugerido tuve que agregar `addEventListener` del buscador y de los dos `select`. El objeto `filtros` nunca cambiaba, así que la lista siempre se veía igual. Agregué los tres eventos (`input` y `change`).

6. **Separación en módulos.** Al dividir `app.js`, los botones creados en `ui.js` necesitaban funciones que quedaron en `app.js`. Importarlas habría creado una dependencia circular, así que `app.js` le pasa un objeto `acciones` a `renderizarLista()`. También separé la parte visual de la edición en `cargarEnFormulario()` y `limpiarFormulario()`.

## 4. Reflexión

La IA me sirvió como guía y como apoyo para encontrar errores, pero la mayoría de los problemas aparecieron al **integrar** el código en mi propio proyecto: funciones que faltaban, el orden de las declaraciones y eventos que no estaban conectados. Resolverlos me ayudó a entender cómo se ejecuta JavaScript de arriba hacia abajo, cómo funcionan los eventos del DOM y por qué conviene separar el código en módulos.

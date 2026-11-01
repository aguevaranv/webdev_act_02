// ==========================================
// MODULO DE LA API (JSONPlaceholder)
// ==========================================

const URL_API = 'https://jsonplaceholder.typicode.com/todos?_limit=12';

const PRIORIDADES = ['Alta', 'Media', 'Baja'];

// La API no tiene prioridad ni fecha, así que se las asignamos
function convertirTarea(todo) {
    const unaHora = 60 * 60 * 1000;

    return {
        id: todo.id,
        titulo: todo.title,
        completada: todo.completed,
        prioridad: PRIORIDADES[todo.id % 3],
        fechaCreacion: new Date(Date.now() - todo.id * unaHora).toISOString()
    };
}

// Pide las tareas a la API. Si algo falla, lanza un error.
export async function obtenerTareasAPI() {
    const respuesta = await fetch(URL_API);

    // fetch NO lanza error con 404 o 500: hay que revisarlo a mano
    if (!respuesta.ok) {
        throw new Error('El servidor respondió con el código ' + respuesta.status);
    }

    const datos = await respuesta.json();
    return datos.map(convertirTarea);
}

// ==========================================
// MODULO DE LOGICA DE TAREAS
// (funciones que no tocan el DOM ni localStorage)
// ==========================================

// Crea un objeto tarea nuevo
export function crearTarea(titulo, prioridad) {
    return {
        id: Date.now(),
        titulo: titulo,
        completada: false,
        prioridad: prioridad,
        fechaCreacion: new Date().toISOString()
    };
}

// Revisa los datos del formulario. Devuelve el mensaje de error o "" si está bien.
export function validarTarea(titulo, prioridad) {
    if (titulo.trim() === '') {
        return 'El título no puede estar vacío.';
    }
    if (titulo.trim().length < 3) {
        return 'El título debe tener al menos 3 caracteres.';
    }
    if (prioridad === '') {
        return 'Selecciona una prioridad.';
    }
    return '';
}

// Filtra por estado y por texto del título
export function filtrarTareas(tareas, estado, texto) {
    const busqueda = texto.trim().toLowerCase();

    return tareas.filter(function (tarea) {
        let cumpleEstado = true;
        if (estado === 'pendientes') {
            cumpleEstado = !tarea.completada;
        } else if (estado === 'completadas') {
            cumpleEstado = tarea.completada;
        }

        const cumpleTexto = tarea.titulo.toLowerCase().includes(busqueda);

        return cumpleEstado && cumpleTexto;
    });
}

const VALOR_PRIORIDAD = { Alta: 1, Media: 2, Baja: 3 };

// Ordena una COPIA de la lista (sort modifica el arreglo original)
export function ordenarTareas(tareas, criterio) {
    const copia = [...tareas];

    if (criterio === 'fecha-desc') {
        copia.sort(function (a, b) {
            return new Date(b.fechaCreacion) - new Date(a.fechaCreacion);
        });
    } else if (criterio === 'fecha-asc') {
        copia.sort(function (a, b) {
            return new Date(a.fechaCreacion) - new Date(b.fechaCreacion);
        });
    } else if (criterio === 'prioridad') {
        copia.sort(function (a, b) {
            return VALOR_PRIORIDAD[a.prioridad] - VALOR_PRIORIDAD[b.prioridad];
        });
    }

    return copia;
}

// Calcula los números del dashboard
export function calcularMetricas(tareas) {
    const completadas = tareas.filter(function (tarea) {
        return tarea.completada;
    }).length;

    return {
        total: tareas.length,
        completadas: completadas,
        pendientes: tareas.length - completadas
    };
}
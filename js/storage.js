// ==========================================
// MODULO DE ALMACENAMIENTO (localStorage)
// ==========================================

const CLAVE = 'taskmanager_tareas';

// ¿Ya se guardó algo antes? (aunque sea una lista vacía)
export function hayDatosGuardados() {
    return localStorage.getItem(CLAVE) !== null;
}

// Lee las tareas guardadas. Si no hay nada, devuelve un arreglo vacío.
export function cargarTareas() {
    const texto = localStorage.getItem(CLAVE);

    if (texto === null) {
        return [];
    }

    try {
        return JSON.parse(texto);
    } catch (error) {
        console.error('Los datos guardados están dañados:', error);
        return [];
    }
}

// Guarda todas las tareas como texto JSON
export function guardarTareas(tareas) {
    localStorage.setItem(CLAVE, JSON.stringify(tareas));
}

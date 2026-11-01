import { obtenerTareasAPI } from './api.js';
import { cargarTareas, guardarTareas, hayDatosGuardados } from './storage.js';
import { crearTarea, validarTarea, filtrarTareas, ordenarTareas, calcularMetricas } from './tareas.js';
import { renderizarLista, actualizarDashboard, mostrarCargando, mostrarNotificacion, cargarEnFormulario, limpiarFormulario } from './ui.js';


let tareas = [];
let idEnEdicion = null;   // null = modo crear · un número = modo editar

const filtros = {
    estado: 'todas',
    texto: '',
    orden: 'fecha-desc'
};

const acciones = {
    alternar: alternarTarea,
    editar: empezarEdicion,
    eliminar: eliminarTarea
};

//escuchar el submit
document.getElementById("formulario").addEventListener("submit", function (evento) {
    evento.preventDefault();

    const titulo = document.getElementById("titulo").value;
    const prioridad = document.getElementById("prioridad").value;
    const error = validarTarea(titulo, prioridad);

    const p = document.getElementById("error-formulario");
    if (error !== "") {
        p.textContent = error;
        p.hidden = false;
        return;
    }
    p.hidden = true;

    if (idEnEdicion === null) {
        // CREAR
        tareas.push(crearTarea(titulo.trim(), prioridad));
    } else {
        // EDITAR: busca la tarea y le cambia los datos
        const tarea = tareas.find(function (t) {
            return t.id === idEnEdicion;
        });
        tarea.titulo = titulo.trim();
        tarea.prioridad = prioridad;
    }

    cancelarEdicion();    // ← vuelve al modo crear y limpia el formulario
    guardarYActualizar();    // ← dibuja la lista y actualiza el dashboard
});


//Actualizar todo
function actualizarVista() { 
    const filtradas = filtrarTareas(tareas, filtros.estado, filtros.texto);
    const visibles = ordenarTareas(filtradas, filtros.orden);
    renderizarLista(visibles, acciones);   // se dibujan las VISIBLES
    actualizarDashboard(calcularMetricas(tareas)); // las métricas usan TODAS
}

//Completar, eliminar y editar tareas
function alternarTarea(id) { 
    const tarea = tareas.find(function (t) { return t.id === id; }); 
    tarea.completada = !tarea.completada; // true ↔ false 
    guardarYActualizar();
}

function eliminarTarea(id) { 
    if (!confirm("¿Eliminar esta tarea?")) { 
        return; 
    } 
    tareas = tareas.filter(function (t) { return t.id !== id; }); // todas MENOS esa 
    if (idEnEdicion === id) {
        cancelarEdicion();
    }
    guardarYActualizar();
}

function empezarEdicion(id) {
    const tarea = tareas.find(function (t) {
        return t.id === id;
    });

    idEnEdicion = id;
    cargarEnFormulario(tarea);
}

function cancelarEdicion() {
    idEnEdicion = null;
    limpiarFormulario();
}

document.getElementById("btn-cancelar").addEventListener("click", cancelarEdicion);

// ----- Filtros, búsqueda y orden -----
document.getElementById("buscar").addEventListener("input", function (evento) {
    filtros.texto = evento.target.value;     // lo que escribió el usuario
    actualizarVista();
});

document.getElementById("filtro-estado").addEventListener("change", function (evento) {
    filtros.estado = evento.target.value;    // "todas", "pendientes" o "completadas"
    actualizarVista();
});

document.getElementById("orden").addEventListener("change", function (evento) {
    filtros.orden = evento.target.value;     // "fecha-desc", "fecha-asc" o "prioridad"
    actualizarVista();
});

function guardarYActualizar() { 
    guardarTareas(tareas); 
    actualizarVista();
}


// ----- Inicio -----
async function iniciar() {
    tareas = cargarTareas();
    actualizarVista();

    // Solo se importa de la API la primera vez (localStorage vacío): así no se duplican
    if (hayDatosGuardados()) {
        return;
    }

    mostrarCargando(true);
    try {
        const tareasAPI = await obtenerTareasAPI();

        // Se agregan solo las que no existen (por si el usuario creó alguna mientras cargaba)
        const nuevas = tareasAPI.filter(function (tareaAPI) {
            return !tareas.some(function (t) {
                return t.id === tareaAPI.id;
            });
        });
        tareas = tareas.concat(nuevas);
        guardarYActualizar();
        mostrarNotificacion('Se importaron ' + nuevas.length + ' tareas de ejemplo desde la API.', 'exito');
    } catch (error) {
        console.error('Error al cargar la API:', error);
        mostrarNotificacion('No se pudieron cargar las tareas de ejemplo. Revisa tu conexión a internet; puedes seguir creando tareas.', 'error');
    } finally {
        mostrarCargando(false);
    }
}

iniciar();


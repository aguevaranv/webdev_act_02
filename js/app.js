import { obtenerTareasAPI } from './api.js';

let tareas = [];
let idEnEdicion = null;   // null = modo crear · un número = modo editar

const filtros = {
    estado: 'todas',
    texto: '',
    orden: 'fecha-desc'
};

const cargando = document.getElementById("cargando");
const notificacion = document.getElementById("notificacion");

//el estado y la función que crea una tarea
function crearTarea(titulo, prioridad) {
    return { 
        id: Date.now(),
        titulo: titulo, 
        completada: false, 
        prioridad: prioridad, 
        fechaCreacion: new Date().toISOString() 
    };
}

//validar (estricto, desde JavaScript)
function validarTarea(titulo, prioridad) {
    if (titulo.trim() === '') {
        return 'El título no puede estar vacío.';
    }
    if (titulo.trim().length < 3) {
        return 'El título debe tener al menos 3 caracteres.';
    }
    if (prioridad === '') {
        return 'Debe seleccionar una prioridad.';
    }
    return '';
}

//dibujar la lista con createElement
function renderizarLista(lista) {
    const ul = document.getElementById("lista");
    ul.innerHTML = '';

    lista.forEach(function (tarea) {
            const li = document.createElement("li");
            li.className = "tarea";
            if (tarea.completada) {
                li.classList.add("completada");      // el CSS la tacha
            }

            // Checkbox
            const check = document.createElement('input');
            check.type = 'checkbox';
            check.checked = tarea.completada;
            check.addEventListener('change', function () {
                alternarTarea(tarea.id);
            });

            // Titulo y prioridad
            const titulo = document.createElement("span");
            titulo.className = "tarea-titulo";
            titulo.textContent = tarea.titulo; // textContent, NO innerHTML para evitar XSS

            const prioridad = document.createElement("span");
            prioridad.className = "prioridad prioridad-" + tarea.prioridad;
            prioridad.textContent = tarea.prioridad;

            // Botón Editar
            const btnEditar = document.createElement("button");
            btnEditar.textContent = "Editar";
            btnEditar.className = "boton-pequeno";
            btnEditar.addEventListener("click", function () {
                empezarEdicion(tarea.id);
            });

            // Botón Eliminar
            const btnEliminar = document.createElement("button");
            btnEliminar.textContent = "Eliminar";
            btnEliminar.className = "boton-pequeno boton-eliminar";
            btnEliminar.addEventListener("click", function () {
                eliminarTarea(tarea.id);
            });

            li.append(check, titulo, prioridad, btnEditar, btnEliminar);
            ul.appendChild(li);
        });
}

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

//Actualizar todo
function actualizarVista() { 
    const filtradas = filtrarTareas(tareas, filtros.estado, filtros.texto);
    const visibles = ordenarTareas(filtradas, filtros.orden);
    renderizarLista(visibles); // se dibujan las VISIBLES
    actualizarDashboard(calcularMetricas(tareas)); // las métricas usan TODAS
}

function calcularMetricas(tareas) { 
    const completadas = tareas.filter(function (tarea) { 
        return tarea.completada; 
    }).length; 
    
    return { 
        total: tareas.length, 
        completadas: completadas, 
        pendientes: tareas.length - completadas 
    };
}

function actualizarDashboard(metricas) {
    document.getElementById("total").textContent = metricas.total;
    document.getElementById("pendientes").textContent = metricas.pendientes;
    document.getElementById("completadas").textContent = metricas.completadas;
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
    document.getElementById("titulo").value = tarea.titulo;
    document.getElementById("prioridad").value = tarea.prioridad;
    document.getElementById("titulo-formulario").textContent = "Editar tarea";
    document.getElementById("btn-guardar").textContent = "Guardar cambios";
    document.getElementById("btn-cancelar").hidden = false;
}

function cancelarEdicion() {
    idEnEdicion = null;
    document.getElementById("formulario").reset();
    document.getElementById("titulo-formulario").textContent = "Nueva tarea";
    document.getElementById("btn-guardar").textContent = "Agregar tarea";
    document.getElementById("btn-cancelar").hidden = true;
    document.getElementById("error-formulario").hidden = true;
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

const CLAVE = 'taskmanager_tareas';

// ¿Ya se guardó algo antes? (aunque sea una lista vacía)
function hayDatosGuardados() { 
    return localStorage.getItem(CLAVE) !== null;
}

// Lee las tareas guardadas. Si no hay nada, devuelve un arreglo vacío.
function cargarTareas() { 
    const texto = localStorage.getItem(CLAVE); 
    
    if (texto === null) { 
        return []; 
    } 
    
    try { 
        return JSON.parse(texto); 
    } 
    catch (error) { 
        console.error('Los datos guardados están dañados:', error); 
        return []; 
    }
}

// Guarda todas las tareas como texto JSON
function guardarTareas(tareas) { 
    localStorage.setItem(CLAVE, JSON.stringify(tareas));
}

function guardarYActualizar() { 
    guardarTareas(tareas); 
    actualizarVista();
}

export function mostrarCargando(visible) {
    cargando.hidden = !visible;
}

let temporizador;

// tipo: "error" o "exito". Se oculta sola después de unos segundos.
export function mostrarNotificacion(mensaje, tipo) {
    notificacion.textContent = mensaje;
    notificacion.className = 'notificacion notificacion-' + tipo;
    notificacion.hidden = false;

    clearTimeout(temporizador);
    temporizador = setTimeout(function () {
        notificacion.hidden = true;
    }, 6000);
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


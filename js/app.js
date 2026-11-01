let tareas = [];
let idEnEdicion = null;   // null = modo crear · un número = modo editar

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

//Actualizar todo
function actualizarVista() { 
    renderizarLista(tareas); 
    actualizarDashboard(calcularMetricas(tareas));
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

// Al iniciar:
tareas = cargarTareas();
actualizarVista();


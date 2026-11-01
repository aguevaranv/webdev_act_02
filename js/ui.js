// ==========================================
// MODULO DE INTERFAZ (todo lo que toca el DOM)
// ==========================================

const lista = document.getElementById('lista');
const listaVacia = document.getElementById('lista-vacia');
const cargando = document.getElementById('cargando');
const notificacion = document.getElementById('notificacion');

const inputTitulo = document.getElementById('titulo');
const selectPrioridad = document.getElementById('prioridad');
const errorFormulario = document.getElementById('error-formulario');
const tituloFormulario = document.getElementById('titulo-formulario');
const btnGuardar = document.getElementById('btn-guardar');
const btnCancelar = document.getElementById('btn-cancelar');

// Crea el <li> de una tarea. Se usa textContent (no innerHTML) para evitar XSS.
function crearElementoTarea(tarea, acciones) {
    const li = document.createElement('li');
    li.className = 'tarea';
    if (tarea.completada) {
        li.classList.add('completada');
    }

    const check = document.createElement('input');
    check.type = 'checkbox';
    check.checked = tarea.completada;
    check.setAttribute('aria-label', 'Marcar como completada');
    check.addEventListener('change', function () {
        acciones.alternar(tarea.id);
    });

    const info = document.createElement('div');
    info.className = 'tarea-info';

    const titulo = document.createElement('span');
    titulo.className = 'tarea-titulo';
    titulo.textContent = tarea.titulo;

    const fecha = document.createElement('span');
    fecha.className = 'tarea-fecha';
    fecha.textContent = 'Creada: ' + new Date(tarea.fechaCreacion).toLocaleString('es-EC');

    info.appendChild(titulo);
    info.appendChild(fecha);

    const prioridad = document.createElement('span');
    prioridad.className = 'prioridad prioridad-' + tarea.prioridad;
    prioridad.textContent = tarea.prioridad;

    const btnEditar = document.createElement('button');
    btnEditar.className = 'boton-pequeno';
    btnEditar.textContent = 'Editar';
    btnEditar.addEventListener('click', function () {
        acciones.editar(tarea.id);
    });

    const btnEliminar = document.createElement('button');
    btnEliminar.className = 'boton-pequeno boton-eliminar';
    btnEliminar.textContent = 'Eliminar';
    btnEliminar.addEventListener('click', function () {
        acciones.eliminar(tarea.id);
    });

    li.append(check, info, prioridad, btnEditar, btnEliminar);
    return li;
}

// Dibuja la lista completa (borra lo anterior primero)
export function renderizarLista(tareas, acciones) {
    lista.innerHTML = '';

    tareas.forEach(function (tarea) {
        lista.appendChild(crearElementoTarea(tarea, acciones));
    });

    listaVacia.hidden = tareas.length > 0;
}

export function actualizarDashboard(metricas) {
    document.getElementById('total').textContent = metricas.total;
    document.getElementById('pendientes').textContent = metricas.pendientes;
    document.getElementById('completadas').textContent = metricas.completadas;
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

export function mostrarCargando(visible) {
    cargando.hidden = !visible;
}

// ----- Formulario -----

export function leerFormulario() {
    return {
        titulo: inputTitulo.value,
        prioridad: selectPrioridad.value
    };
}

export function mostrarErrorFormulario(mensaje) {
    errorFormulario.textContent = mensaje;
    errorFormulario.hidden = mensaje === '';
    inputTitulo.classList.toggle('input-error', mensaje !== '');
}

export function cargarEnFormulario(tarea) {
    inputTitulo.value = tarea.titulo;
    selectPrioridad.value = tarea.prioridad;
    tituloFormulario.textContent = 'Editar tarea';
    btnGuardar.textContent = 'Guardar cambios';
    btnCancelar.hidden = false;
    inputTitulo.focus();
}

export function limpiarFormulario() {
    inputTitulo.value = '';
    selectPrioridad.value = '';
    tituloFormulario.textContent = 'Nueva tarea';
    btnGuardar.textContent = 'Agregar tarea';
    btnCancelar.hidden = true;
    mostrarErrorFormulario('');
}

let tareas = [];

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
            
            const titulo = document.createElement("span");
            titulo.textContent = tarea.titulo; // textContent, NO innerHTML para evitar XSS

            const prioridad = document.createElement("span");
            prioridad.className = "prioridad prioridad-" + tarea.prioridad;
            prioridad.textContent = tarea.prioridad;

            li.append(titulo, prioridad);
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

    tareas.push(crearTarea(titulo.trim(), prioridad));
    renderizarLista(tareas);
    evento.target.reset();
});
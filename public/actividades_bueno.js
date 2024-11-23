document.addEventListener('DOMContentLoaded', () => {
    const titulo_input = document.getElementById('titulo_input');
    const descripcion_input = document.getElementById('descripcion_input');
    const fecha_input = document.getElementById('fecha_input');
    const hora_input = document.getElementById('hora_input');
    const lugar_input = document.getElementById('lugar_input');
    const capacidad_input = document.getElementById('capacidad_input');
    const agregar_actividad = document.getElementById('agregar_actividad');
    const eliminar_actividad = document.getElementById('eliminar_actividad');
    const contenedor_actividad = document.getElementById('contenedor_actividad');

    let editando = false; // Estado: si estamos editando o no
    let idEnEdicion = null; // Guardar el ID de la actividad en edición

    // Cargar actividades al iniciar
    cargarActividades();

    agregar_actividad.addEventListener('click', () => {
        const titulo = titulo_input.value.trim();
        const descripcion = descripcion_input.value.trim();
        const fecha = fecha_input.value.trim();
        const hora = hora_input.value.trim();
        const lugar = lugar_input.value.trim();
        const capacidad = capacidad_input.value.trim();

        if (titulo !== '' && descripcion !== '' && fecha !== '' && hora !== '' && lugar !== '' && capacidad > 0) {
            if (editando) {
                // Actualizar actividad existente
                actualizarActividad(idEnEdicion, titulo, descripcion, fecha, hora, lugar, capacidad);
            } else {
                // Agregar nueva actividad
                agregarActividad(titulo, descripcion, fecha, hora, lugar, capacidad);
            }
        } else {
            alert('Por favor, completa todos los campos correctamente.');
        }
    });

    eliminar_actividad.addEventListener('click', () => {
        limpiarFormulario();
    });

    function cargarActividades() {
        fetch('http://localhost:3000/api/actividades_bueno')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error al cargar las actividades');
                }
                return response.json();
            })
            .then(data => {
                data.forEach(actividad => {
                    mostrarActividad(actividad);
                });
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Hubo un problema al cargar las actividades.');
            });
    }

    function mostrarActividad({ id, titulo, descripcion, fecha, hora, lugar, capacidad }) {
        const filaActividad = document.createElement('tr');
        filaActividad.innerHTML = `
            <td>${id}</td>
            <td>${titulo}</td>
            <td>${descripcion}</td>
            <td>${fecha}</td>
            <td>${hora}</td>
            <td>${lugar}</td>
            <td>${capacidad}</td>
            <td>
                <button class="btn btn-warning btn-sm">Editar</button>
                <button class="btn btn-danger btn-sm">Eliminar</button>
            </td>
        `;

        // Botón "Editar"
        const btnEditar = filaActividad.querySelector('.btn-warning');
        btnEditar.addEventListener('click', () => {
            llenarCampos(id, titulo, descripcion, fecha, hora, lugar, capacidad);
        });
        const btnEliminar = filaActividad.querySelector('.btn-danger');
    btnEliminar.addEventListener('click', () => {
        eliminarActividad(id, filaActividad);
    });

        contenedor_actividad.appendChild(filaActividad);
    }

    function llenarCampos(id, titulo, descripcion, fecha, hora, lugar, capacidad) {
        // Llenar los campos del formulario
        titulo_input.value = titulo;
        descripcion_input.value = descripcion;
        fecha_input.value = fecha;
        hora_input.value = hora;
        lugar_input.value = lugar;
        capacidad_input.value = capacidad;

        // Cambiar botón a "Guardar Cambios"
        agregar_actividad.textContent = 'Guardar Cambios';
        agregar_actividad.classList.remove('btn-primary');
        agregar_actividad.classList.add('btn-success');

        // Cambiar estado de edición
        editando = true;
        idEnEdicion = id;
    }

    function limpiarFormulario() {
        // Limpiar los campos
        titulo_input.value = '';
        descripcion_input.value = '';
        fecha_input.value = '';
        hora_input.value = '';
        lugar_input.value = '';
        capacidad_input.value = '';

        // Restaurar botón a "Agregar Actividad"
        agregar_actividad.textContent = 'Agregar Actividad';
        agregar_actividad.classList.remove('btn-success');
        agregar_actividad.classList.add('btn-primary');

        // Restaurar estado
        editando = false;
        idEnEdicion = null;
    }

    function agregarActividad(titulo, descripcion, fecha, hora, lugar, capacidad) {
        fetch('http://localhost:3000/api/actividades_bueno', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ titulo, descripcion, fecha, hora, lugar, capacidad })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al guardar la actividad');
            }
            return response.json();
        })
        .then(data => {
            mostrarActividad({ id: data.id, titulo, descripcion, fecha, hora, lugar, capacidad });
            limpiarFormulario();
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Hubo un problema al agregar la actividad.');
        });
    }
    function eliminarActividad(id, filaActividad) {
        if (confirm('¿Estás seguro de que deseas eliminar esta actividad?')) {
            fetch(`http://localhost:3000/api/actividades_bueno/${id}`, {
                method: 'DELETE',
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error al eliminar la actividad');
                }
                return response.json();
            })
            .then(data => {
                console.log(data.message);
                // Eliminar la fila de la tabla en la interfaz
                filaActividad.remove();
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Hubo un problema al eliminar la actividad.');
            });
        }
    }
    

    function actualizarActividad(id, titulo, descripcion, fecha, hora, lugar, capacidad) {
        fetch(`http://localhost:3000/api/actividades_bueno/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ titulo, descripcion, fecha, hora, lugar, capacidad })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al actualizar la actividad');
            }
            return response.json();
        })
        .then(() => {
            // Recargar la lista de actividades
            contenedor_actividad.innerHTML = '';
            cargarActividades();
            limpiarFormulario();
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Hubo un problema al actualizar la actividad.');
        });
    }
});
const contenedor_interes = document.getElementById('contenedor_interes');

// Función para cargar los datos de interes_resumen
function cargarInteres() {
    fetch('http://localhost:3000/api/interes_resumen') // Asegúrate de que la URL es la correcta
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al cargar los datos de interés');
            }
            return response.json();
        })
        .then(data => {
            console.log(data);  // Verifica en la consola que los datos sean correctos
            if (Array.isArray(data)) {  // Asegúrate de que data sea un arreglo
                data.forEach(interes => {
                    mostrarInteres(interes);
                });
            } else {
                throw new Error('Los datos no tienen el formato esperado.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Hubo un problema al cargar los datos de interés.');
        });
}

// Llamar la función para cargar los datos
cargarInteres();

// Función para mostrar los datos en la tabla
function mostrarInteres({ id, actividad_id, titulo, me_interesa, no_me_interesa }) {
    // Verifica que los valores no sean undefined antes de insertarlos
    console.log(id, actividad_id, titulo, me_interesa, no_me_interesa); // Verifica los valores recibidos
    const filaInteres = document.createElement('tr');
    filaInteres.innerHTML = `
        <td>${id || 'No disponible'}</td>
        <td>${actividad_id || 'No disponible'}</td>
        <td>${titulo || 'No disponible'}</td>
        <td>${me_interesa || 'No disponible'}</td>
        <td>${no_me_interesa || 'No disponible'}</td>
    `;
    contenedor_interes.appendChild(filaInteres);
}

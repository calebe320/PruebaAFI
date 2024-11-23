document.addEventListener('DOMContentLoaded', () => {
    const contenedorActividad = document.getElementById('contenedor_actividad');

    // Declaramos la función registrarInteres fuera de la asignación a window
    window.registrarInteres=async function registrarInteres(actividadId, interes) {
        try {
            const response = await fetch('http://localhost:3000/api/registrar-interes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    actividad_id: actividadId,
                    interes: interes,
                }),
            });

            const resultado = await response.json();

            // Verificamos si el servidor envió un mensaje
            if (response.ok) {
                alert(resultado.message || "Acción completada con éxito.");
            } else {
                alert(resultado.error || "Hubo un problema al registrar tu decisión.");
            }
        } catch (error) {
            console.error('Error al registrar interés:', error);
            alert('Hubo un problema al registrar tu decisión.');
        }
    }

    // Función para obtener las actividades de la API
    async function obtenerActividades() {
        try {
            const response = await fetch('http://localhost:3000/api/actividades_bueno');
            if (!response.ok) throw new Error('Error al obtener actividades');
            const actividades = await response.json();
            mostrarActividades(actividades);
        } catch (error) {
            console.error('Error en la conexión:', error);
            alert('Hubo un problema al cargar las actividades.');
        }
    }

    // Función para mostrar las actividades en el contenedor
    function mostrarActividades(actividades) {
        contenedorActividad.innerHTML = ''; // Limpiar contenedor antes de agregar nuevas actividades
        actividades.forEach(actividad => {
            const elementoActividad = document.createElement('div');
            elementoActividad.classList.add('col');
            elementoActividad.innerHTML = `
                <div class="actividad">
                    <div class="actividad_titulo">${actividad.titulo}</div>
                    <div class="actividad_descripcion">${actividad.descripcion}</div>
                    <div class="actividad_fecha"><strong>Fecha:</strong> ${actividad.fecha}</div>
                    <div class="actividad_hora"><strong>Hora:</strong> ${actividad.hora}</div>
                    <div class="actividad_lugar"><strong>Lugar:</strong> ${actividad.lugar}</div>
                    <div class="actividad_capacidad"><strong>Capacidad:</strong> ${actividad.capacidad}</div>
                    <div class="botones">
                        <button class="btn btn-custom-green" title="Aceptar" onclick="registrarInteres(${actividad.id}, true)">
                            <i class="bi bi-check-circle"></i>
                        </button>
                        <button class="btn btn-custom-red" title="Rechazar" onclick="registrarInteres(${actividad.id}, false)">
                            <i class="bi bi-x-circle"></i>
                        </button>
                    </div>
                </div>
            `;
            contenedorActividad.appendChild(elementoActividad);
        });
    }
    
    // Llama a la función al cargar la página
    obtenerActividades();
});

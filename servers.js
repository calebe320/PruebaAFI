const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./db'); // Importa tu archivo de base de datos
const authRoutes = require('./auth'); // Importa tus rutas de autenticación
const app = express();
const path = require('path');


app.use(cors()); // Habilita CORS para todas las rutas
app.use(bodyParser.json());
// Middleware para servir archivos estáticos (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));
// Ruta para manejar la raíz
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html')); // Asegúrate de que 'index.html' está en la carpeta 'public'
  });

  

// Usa las rutas de autenticación
app.use('/api', authRoutes);
// Ruta para obtener el resumen de interés de una actividad por su ID
app.get('/datos-interes', (req, res) => {
    db.all("SELECT actividad_id, titulo, me_interesa, no_me_interesa FROM interes_resumen", (err, rows) => {
      if (err) {
        console.error('Error al obtener datos:', err.message);
        res.status(500).send('Error al obtener datos');
      } else {
        res.json(rows);
      }
    });
  });
  app.get('/api/interes_resumen', (req, res) => {
    db.all('SELECT * FROM interes_resumen', (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);  // Deberías asegurarte de que los datos son correctos
    });
});



// Ruta para registrar interés o desinterés en una actividad
app.post('/api/registrar-interes', (req, res) => {
    const { actividad_id, interes } = req.body;

    // Validar los datos
    if (typeof actividad_id !== 'number' || typeof interes !== 'boolean') {
        console.error('Datos inválidos recibidos:', req.body);
        return res.status(400).json({ error: 'Datos inválidos. Se necesita un ID numérico y un valor booleano para "interes".' });
    }

    // Determinar la columna a actualizar
    const columna = interes ? 'me_interesa' : 'no_me_interesa';

    // Verificar si la actividad ya tiene un registro en la tabla 'interes_resumen'
    db.get('SELECT * FROM interes_resumen WHERE actividad_id = ?', [actividad_id], (err, row) => {
        if (err) {
            console.error('Error al verificar el interés:', err.message);
            return res.status(500).json({ error: 'Error al verificar el interés en la base de datos.' });
        }

        console.log('Fila encontrada:', row); // Verificamos qué devuelve la consulta

        if (row) {
            // Si ya existe un registro, actualizamos los valores de me_interesa o no_me_interesa
            db.run(
                `UPDATE interes_resumen SET ${columna} = ${columna} + 1 WHERE actividad_id = ?`,
                [actividad_id],
                function (err) {
                    if (err) {
                        console.error('Error al actualizar el interés en la base de datos:', err.message);
                        return res.status(500).json({ error: 'Error al actualizar el interés.' });
                    }

                    // Confirmación de éxito
                    return res.json({ message: `Se ha registrado correctamente el ${interes ? 'interés' : 'desinterés'} en la actividad.` });
                }
            );
        } else {
            // Si no existe un registro, lo insertamos en la tabla interes_resumen
            db.run(
                `INSERT INTO interes_resumen (actividad_id, titulo, ${columna}) SELECT id, titulo, 1 FROM actividades_bueno WHERE id = ?`,
                [actividad_id],
                function (err) {
                    if (err) {
                        console.error('Error al insertar el registro de interés:', err.message);
                        return res.status(500).json({ error: 'Error al insertar el interés.' });
                    }

                    // Confirmación de éxito
                    return res.json({ message: `Se ha registrado correctamente el ${interes ? 'interés' : 'desinterés'} en la actividad.` });
                }
            );
        }
    });
});


// Nueva ruta para obtener actividades
app.get('/api/actividades', (req, res) => {
    db.all(`SELECT * FROM actividades`, [], (err, rows) => {
        if (err) {
            console.error('Error al obtener actividades:', err.message);
            return res.status(500).send('Error al obtener actividades');
        }
        res.json(rows);
    });
});

// Nueva ruta para obtener actividades_bueno
app.get('/api/actividades_bueno', (req, res) => {
    db.all(`SELECT * FROM actividades_bueno`, [], (err, rows) => {
        if (err) {
            return res.status(500).send('Error al obtener actividades');
        }
        res.json(rows);
    });
});
// Ruta para actualizar una actividad por ID
app.put('/api/actividades_bueno/:id', (req, res) => {
    const id = req.params.id; // ID de la actividad a actualizar
    const { titulo, descripcion, fecha, hora, lugar, capacidad } = req.body;

    // Verificar que todos los campos estén presentes
    if (!titulo || !descripcion || !fecha || !hora || !lugar || !capacidad) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    // Actualizar la actividad en la base de datos
    db.run(
        `UPDATE actividades_bueno SET titulo = ?, descripcion = ?, fecha = ?, hora = ?, lugar = ?, capacidad = ? WHERE id = ?`,
        [titulo, descripcion, fecha, hora, lugar, capacidad, id],
        function (err) {
            if (err) {
                console.error('Error al actualizar en la base de datos:', err.message);
                return res.status(500).json({ error: 'Error al actualizar la actividad' });
            }

            // Si no se encontró el ID
            if (this.changes === 0) {
                return res.status(404).json({ error: 'Actividad no encontrada' });
            }

            res.json({ message: 'Actividad actualizada correctamente' });
        }
    );
});

// Ruta para eliminar una actividad por ID
app.delete('/api/actividades_bueno/:id', (req, res) => {
    const id = req.params.id; // ID de la actividad a eliminar

    // Ejecutar la consulta para eliminar el registro
    db.run(`DELETE FROM actividades_bueno WHERE id = ?`, [id], function (err) {
        if (err) {
            console.error('Error al eliminar en la base de datos:', err.message);
            return res.status(500).json({ error: 'Error al eliminar la actividad' });
        }

        // Verificar si se eliminó algún registro
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Actividad no encontrada' });
        }

        res.json({ message: 'Actividad eliminada correctamente' });
    });
});

// Nueva ruta para agregar una actividad a actividades_bueno
app.post('/api/actividades_bueno', (req, res) => {
    const { titulo, descripcion, fecha, hora, lugar, capacidad } = req.body;

    if (!titulo || !descripcion || !fecha || !hora || !lugar || !capacidad) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    db.run(`INSERT INTO actividades_bueno (titulo, descripcion, fecha, hora, lugar, capacidad) VALUES (?, ?, ?, ?, ?, ?)`, 
    [titulo, descripcion, fecha, hora, lugar, capacidad], function(err) {
        if (err) {
            console.error('Error al insertar en la base de datos:', err.message);
            return res.status(500).json({ error: 'Error al guardar la actividad' });
        }
        res.status(201).json({ id: this.lastID });
    });
});
//PRUEBA

app.post('/api/actividades', (req, res) => {
    const { titulo, descripcion, fecha, hora, lugar, capacidad } = req.body;

    // Verificar los datos recibidos
    console.log('Datos recibidos:', req.body);

    // Validar que todos los campos estén presentes
    if (!titulo || !descripcion || !fecha || !hora || !lugar || !capacidad) {
        console.error('Faltan campos obligatorios');
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    // Inserta la actividad en la base de datos
    db.run(`INSERT INTO actividades (titulo, descripcion, fecha, hora, lugar, capacidad) VALUES (?, ?, ?, ?, ?, ?)`, 
    [titulo, descripcion, fecha, hora, lugar, capacidad], function(err) {
        if (err) {
            console.error('Error al insertar en la base de datos:', err.message);
            return res.status(500).json({ error: 'Error al guardar la actividad' });
        }
        // Devuelve el ID de la nueva actividad
        res.status(201).json({ id: this.lastID });
    });
});

// Inicia el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor en funcionamiento en http://localhost:${PORT}`);
});

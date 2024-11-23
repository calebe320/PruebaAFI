const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const express = require('express');
const db = require('./db'); // Asegúrate de que la ruta sea correcta

const router = express.Router();

// Ruta para registrar un nuevo usuario
router.post('/register', async (req, res) => {
  const { username, password, role } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    db.run(`INSERT INTO users (username, password, role) VALUES (?, ?, ?)`, [username, hashedPassword, role || 'user'], function(err) {
      if (err) {
        return res.status(400).send('Error al crear el usuario');
      }
      res.status(201).send('Usuario creado con éxito');
    });
  } catch (error) {
    res.status(500).send('Error en el servidor');
  }
});

// Ruta para iniciar sesión
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  db.get(`SELECT * FROM users WHERE username = ?`, [username], async (err, user) => {
    if (err || !user) {
      return res.status(404).send('Usuario no encontrado');
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).send('Contraseña incorrecta');
    }

    // Generar un token JWT
    const token = jwt.sign({ id: user.id, role: user.role }, 'tu_clave_secreta', { expiresIn: '1h' });
    res.json({ token, role: user.role });
  });
});

// Ruta para obtener actividades
router.get('/actividades', (req, res) => {
  db.all('SELECT * FROM actividades', [], (err, actividades) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(actividades);
  });
});

// Nueva ruta para agregar una actividad
router.post('/actividades', (req, res) => {
  const { titulo, descripcion, hora, lugar, capacidad } = req.body;

  // Asegúrate de validar los campos antes de guardar
  if (!titulo || !descripcion || !hora || !lugar || !capacidad) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  // Guardar la actividad en la base de datos
  const query = `INSERT INTO actividades (titulo, descripcion, hora, lugar, capacidad) VALUES (?, ?, ?, ?, ?)`;
  const params = [titulo, descripcion, hora, lugar, capacidad];

  db.run(query, params, function(err) {
    if (err) {
      return res.status(500).json({ error: 'Error al guardar la actividad' });
    }
    res.status(201).json({ message: 'Actividad agregada con éxito', id: this.lastID });
  });
});

module.exports = router;


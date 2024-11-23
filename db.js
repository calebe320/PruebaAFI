const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Crea una nueva base de datos SQLite
const db = new sqlite3.Database(path.join(__dirname, 'database.db'), (err) => {
  if (err) {
    console.error('Error al conectar a la base de datos:', err.message);
  } else {
    console.log('Conectado a la base de datos SQLite.');

    // Crear una tabla estado_actividad basada en actividades_bueno
// Crear la tabla interes_resumen
db.run(`CREATE TABLE IF NOT EXISTS interes_resumen (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  actividad_id INTEGER NOT NULL,
  titulo TEXT NOT NULL,
  me_interesa INTEGER DEFAULT 0,
  no_me_interesa INTEGER DEFAULT 0,
  FOREIGN KEY (actividad_id) REFERENCES actividades_bueno(id)
)`, (err) => {
  if (err) {
      console.error('Error al crear la tabla interes_resumen:', err.message);
  } else {
      console.log('Tabla interes_resumen creada o ya existe.');
  }
});

    // Crea la tabla de usuarios si no existe
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT,
      role TEXT DEFAULT 'user'
    )`, (err) => {
      if (err) {
        console.error('Error al crear la tabla de usuarios:', err.message);
      } else {
        console.log('Tabla de usuarios creada o ya existe.');
      }
    });

    // Crea la tabla de actividades si no existe
    db.run(`CREATE TABLE IF NOT EXISTS actividades (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo TEXT NOT NULL,
      descripcion TEXT NOT NULL,
      fecha TEXT NOT NULL,
      hora TEXT NOT NULL,
      lugar TEXT NOT NULL,
      capacidad INTEGER NOT NULL
    )`, (err) => {
      if (err) {
        console.error('Error al crear la tabla de actividades:', err.message);
      } else {
        console.log('Tabla de actividades creada o ya existe.');
      }
    });
  }
});

//PRUEBA
db.run(`CREATE TABLE IF NOT EXISTS actividades_bueno (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT NOT NULL,
    descripcion TEXT NOT NULL,
    fecha TEXT NOT NULL,
    hora TEXT NOT NULL,
    lugar TEXT NOT NULL,
    capacidad INTEGER NOT NULL
  )`, (err) => {
    if (err) {
      console.error('Error al crear la tabla actividades_bueno:', err.message);
    } else {
      console.log('Tabla actividades_bueno creada o ya existe.');
    }
  });

//PRUEBA
// Exporta la base de datos para usarla en otras partes de la aplicación
module.exports = db;

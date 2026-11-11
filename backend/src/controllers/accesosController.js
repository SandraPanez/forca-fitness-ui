const Acceso = require('../models/Acceso');

const getAll = async (req, res) => {
  try {
    const accesos = await Acceso.findAll();
    res.json(accesos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getByAlumno = async (req, res) => {
  try {
    const accesos = await Acceso.findByAlumno(req.params.id_alumno);
    res.json(accesos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const registrar = async (req, res) => {
  try {
    const { id_alumno, metodo } = req.body;
    // Verificar que el alumno tenga matrícula activa
    const acceso = await Acceso.registrar({ id_alumno, metodo });
    res.status(201).json(acceso);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = { getAll, getByAlumno, registrar };

const Alumno = require('../models/Alumno');

const getAll = async (req, res) => {
  try {
    const { estado, disciplina, search } = req.query;
    const alumnos = await Alumno.findAll({ estado, disciplina, search });
    res.json(alumnos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getOne = async (req, res) => {
  try {
    const alumno = await Alumno.findById(req.params.id);
    if (!alumno) return res.status(404).json({ error: 'Alumno no encontrado' });
    res.json(alumno);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const create = async (req, res) => {
  try {
    const nuevo = await Alumno.create(req.body);
    res.status(201).json(nuevo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const update = async (req, res) => {
  try {
    const actualizado = await Alumno.update(req.params.id, req.body);
    if (!actualizado) return res.status(404).json({ error: 'Alumno no encontrado' });
    res.json(actualizado);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const remove = async (req, res) => {
  try {
    await Alumno.delete(req.params.id);
    res.json({ mensaje: 'Alumno eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getAll, getOne, create, update, remove };

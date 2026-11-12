const Matricula = require('../models/Matricula');

const getAll = async (req, res) => {
  try {
    const matriculas = await Matricula.findAll();
    res.json(matriculas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getOne = async (req, res) => {
  try {
    const matricula = await Matricula.findById(req.params.id);
    if (!matricula) return res.status(404).json({ error: 'Matrícula no encontrada' });
    res.json(matricula);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getByAlumno = async (req, res) => {
  try {
    const matriculas = await Matricula.findByAlumno(req.params.id_alumno);
    res.json(matriculas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const create = async (req, res, next) => {
  try {
    const nueva = await Matricula.create(req.body);
    res.status(201).json(nueva);
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const actualizada = await Matricula.update(req.params.id, req.body);
    if (!actualizada) return res.status(404).json({ error: 'Matrícula no encontrada' });
    res.json(actualizada);
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res) => {
  try {
    await Matricula.delete(req.params.id);
    res.json({ mensaje: 'Matrícula eliminada correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getAll, getOne, getByAlumno, create, update, remove };

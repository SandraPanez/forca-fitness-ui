const Disciplina = require('../models/Disciplina');

const getAll = async (req, res) => {
  try {
    const disciplinas = await Disciplina.findAll();
    res.json(disciplinas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getOne = async (req, res) => {
  try {
    const disciplina = await Disciplina.findById(req.params.id);
    if (!disciplina) return res.status(404).json({ error: 'Disciplina no encontrada' });
    res.json(disciplina);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const create = async (req, res, next) => {
  try {
    const nueva = await Disciplina.create(req.body);
    res.status(201).json(nueva);
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const actualizada = await Disciplina.update(req.params.id, req.body);
    if (!actualizada) return res.status(404).json({ error: 'Disciplina no encontrada' });
    res.json(actualizada);
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res) => {
  try {
    await Disciplina.delete(req.params.id);
    res.json({ mensaje: 'Disciplina eliminada correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getAll, getOne, create, update, remove };

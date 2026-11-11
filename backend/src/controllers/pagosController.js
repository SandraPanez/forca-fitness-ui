const Pago = require('../models/Pago');

const getAll = async (req, res) => {
  try {
    const { estado, medio } = req.query;
    const pagos = await Pago.findAll({ estado, medio });
    res.json(pagos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getPendientes = async (req, res) => {
  try {
    const pagos = await Pago.findPendientes();
    res.json(pagos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getOne = async (req, res) => {
  try {
    const pago = await Pago.findById(req.params.id);
    if (!pago) return res.status(404).json({ error: 'Pago no encontrado' });
    res.json(pago);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getByAlumno = async (req, res) => {
  try {
    const pagos = await Pago.findByAlumno(req.params.id_alumno);
    res.json(pagos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const create = async (req, res) => {
  try {
    const nuevo = await Pago.create(req.body);
    res.status(201).json(nuevo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const confirmar = async (req, res) => {
  try {
    const pago = await Pago.updateEstado(req.params.id, 'aprobado');
    if (!pago) return res.status(404).json({ error: 'Pago no encontrado' });
    res.json({ mensaje: 'Pago confirmado', pago });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const rechazar = async (req, res) => {
  try {
    const pago = await Pago.updateEstado(req.params.id, 'rechazado');
    if (!pago) return res.status(404).json({ error: 'Pago no encontrado' });
    res.json({ mensaje: 'Pago rechazado', pago });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getAll, getPendientes, getOne, getByAlumno, create, confirmar, rechazar };

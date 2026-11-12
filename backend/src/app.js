const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    sistema: 'Forca & Fitness API',
    version: '1.0.0',
    estado: 'activo',
    timestamp: new Date().toISOString()
  });
});

app.use('/api', apiRoutes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;

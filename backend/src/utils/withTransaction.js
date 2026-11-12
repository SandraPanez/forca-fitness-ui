const pool = require('../../config/db');

const withTransaction = async (operation) => {
  const client = await pool.connect();
  let transactionStarted = false;

  try {
    await client.query('BEGIN');
    transactionStarted = true;

    const result = await operation(client);
    await client.query('COMMIT');
    transactionStarted = false;
    return result;
  } catch (error) {
    if (transactionStarted) {
      try {
        await client.query('ROLLBACK');
      } catch (rollbackError) {
        console.error('No se pudo revertir la transacción:', rollbackError);
        if (error && typeof error === 'object') error.rollbackError = rollbackError;
      }
    }

    throw error;
  } finally {
    client.release();
  }
};

module.exports = withTransaction;

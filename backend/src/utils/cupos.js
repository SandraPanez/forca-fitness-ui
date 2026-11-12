const parseCuposMax = (value) => {
  if (value === null || value === undefined) return null;
  if (typeof value === 'string' && value.trim() === '') return null;
  if (typeof value !== 'number' && typeof value !== 'string') return null;

  const cuposMax = Number(value);
  return Number.isInteger(cuposMax) && cuposMax >= 0 && cuposMax <= 2147483647
    ? cuposMax
    : null;
};

module.exports = parseCuposMax;

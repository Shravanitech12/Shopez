const crypto = require('crypto');

const generateOrderNumber = () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomStr = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `SHPZ-${dateStr}-${randomStr}`;
};

module.exports = { generateOrderNumber };

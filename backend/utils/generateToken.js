// backend/utils/generateToken.js
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  // Fungsi ini membuat token yang valid selama 30 hari
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d', 
  });
};

module.exports = generateToken;
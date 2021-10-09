const jwt = require('jsonwebtoken');
const { JWT_SECRET_TOKEN } = require('../config');

// get the user info from a JWT
const getUser = (token) => {
  if (token) {
    try {
      return jwt.verify(token, JWT_SECRET_TOKEN);
    } catch (err) {
      return { error: true, msg: 'Invalid Token' };
    }
  }

  return { error: true, msg: 'Authentication token is required' };
};

const createToken = (user, expiryTime) => {
  const {
    id, email, userName, role,
  } = user;
  const token = jwt.sign({
    id, email, userName, role,
  }, JWT_SECRET_TOKEN, {
    expiresIn: expiryTime,
  });

  return token;
};

module.exports = {
  getUser,
  createToken,
};

const jwt = require('jsonwebtoken');
const { JWT_SECRET_TOKEN } = require('../config');

// get the user info from a JWT
const getUser = (token) => {
  if (token) {
    try {
      return jwt.verify(token, JWT_SECRET_TOKEN);
      // jwt.verify(token, JWT_SECRET_TOKEN, (err, decoded) => {
      //   if (err) {
      //     return decoded;
      //   }

      //   return { error: true, msg: err };
      // });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log(err);

      // if there's a problem with the token, throw an error
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

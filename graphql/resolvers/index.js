const Product = require('./product');
const User = require('./user');

module.exports = {
  Query: {
    ...Product.Query,
  },
  Mutation: {
    ...User.Mutation,
    ...Product.Mutation,
  },
};

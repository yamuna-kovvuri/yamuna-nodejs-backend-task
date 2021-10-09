const { mergeTypeDefs } = require('@graphql-tools/merge');

const Scaler = require('./scaler');
const Common = require('./common');
const User = require('./user');
const Product = require('./product');

const types = [
  Scaler,
  Common,
  User,
  Product,
];

module.exports = mergeTypeDefs(types);

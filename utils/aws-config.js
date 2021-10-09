const aws = require('aws-sdk');
const { SECRET_ACCESS_KEY, ACCESS_KEY_ID, REGION } = require('../config');

aws.config.update({
  secretAccessKey: SECRET_ACCESS_KEY,
  accessKeyId: ACCESS_KEY_ID,
  region: REGION,
});

const s3 = new aws.S3({
  secretAccessKey: SECRET_ACCESS_KEY,
  accessKeyId: ACCESS_KEY_ID,
});

module.exports = s3;

/* eslint-disable no-console */
const convertCamelCase = require('lodash.camelcase');
const convertSnakeCase = require('lodash.snakecase');
const crypto = require('crypto');
const s3 = require('./aws-config');
const { promisify } = require('util');
const { extname } = require('path');
const AWS = require('aws-sdk');

const convertCamelObjectToSnake = (payload) => {
  const obj = { ...payload };
  const response = {};
  const objectKeys = Object.keys(obj);

  objectKeys.map((key) => {
    const convertedKey = convertSnakeCase(key);

    response[convertedKey] = obj[key];

    return true;
  });

  return response;
};

const convertCamelToSnake = (payload) => {
  const payloadDataType = typeof payload;

  switch (payloadDataType) {
    case 'string':
      return convertSnakeCase(payload);

    case 'object':
      return convertCamelObjectToSnake(payload);

    default:
      return payload;
  }
};

const convertSnakeObjectToCamel = (payload) => {
  const obj = {
    ...payload,
  };
  const response = {};
  const objectKeys = Object.keys(obj);

  objectKeys.map((key) => {
    const convertedKey = convertCamelCase(key);

    if (obj[key] && Object.prototype.toString.call(obj[key]) === '[object Object]' && !(obj[key] instanceof Date)) {
      const {
        dataValues,
      } = obj[key];

      let result;

      if (dataValues) {
        result = convertSnakeObjectToCamel(dataValues);
      } else {
        result = convertSnakeObjectToCamel(obj[key]);
      }

      response[convertedKey] = result;
    } else if (obj[key] && Object.prototype.toString.call(obj[key]) === '[object Array]' && !(obj[key] instanceof Date)) {
      const rows = [];

      obj[key].forEach((element) => {
        const {
          dataValues: dataValues2,
        } = element;

        let result;

        if (dataValues2) {
          if (Object.prototype.toString.call(dataValues2) === '[object Object]') {
            result = convertSnakeObjectToCamel(dataValues2);
          } else {
            result = dataValues2;
          }
        } else if (Object.prototype.toString.call(element) === '[object Object]') {
          result = convertSnakeObjectToCamel(element);
        } else {
          result = element;
        }
        rows.push(result);
      });

      response[convertedKey] = rows;
    } else {
      response[convertedKey] = obj[key];
    }

    return true;
  });

  return response;
};

const convertSnakeToCamel = (payload) => {
  const payloadDataType = typeof payload;

  switch (payloadDataType) {
    case 'string':
      return convertCamelCase(payload);

    case 'object':
      return convertSnakeObjectToCamel(payload);

    default:
      return payload;
  }
};

const generateRandomPassword = () => {
  const password = crypto.randomBytes(3).toString('hex');

  return password;
};

const generateWhereCondition = (data) => {
  const where = (data || []).map((element) => {
    const { key: KeyCamelCase, ...values } = element;
    const key = convertSnakeCase(KeyCamelCase);
    const [ secondKey ] = Object.keys(values);

    if (secondKey === 'eq') {
      return `${key} = '${values[secondKey]}'`;
    }
    if (secondKey === 'in') {
      return `${key} in ('${values[secondKey].join("','")}')`;
    }
    if (secondKey === 'nin') {
      return `${key} not in ('${values[secondKey].join("','")}')`;
    }
    if (secondKey === 'neq') {
      return `${key} != '${values[secondKey]}'`;
    }
    if (secondKey === 'gt') {
      return `${key} > '${values[secondKey]}'`;
    }
    if (secondKey === 'gte') {
      return `${key} >= '${values[secondKey]}'`;
    }
    if (secondKey === 'lt') {
      return `${key} < '${values[secondKey]}'`;
    }
    if (secondKey === 'lte') {
      return `${key} <= '${values[secondKey]}'`;
    }
    if (secondKey === 'like') {
      return `${key} like '%${values[secondKey]}%'`;
    }
    if (secondKey === 'ilike') {
      return `${key} ilike '%${values[secondKey]}%'`;
    }

    return `${key} = '${values}'`;
  });

  if (where.length > 0) {
    return `where ${where.join(' AND ')}`;
  }

  return '';
};

const generateOrderCondition = (data) => {
  let direction;
  const order = (data || []).map((element) => {
    const { key, direction: directionOrder } = element;

    direction = directionOrder;

    return convertSnakeCase(key);
  });

  if (order.length > 0) {
    return `order by ${order.join(',')} ${direction}`;
  }

  return '';
};

// upload objects.
const uploadObjects = async (files, bucketName) => {
  let objects = [];

  objects = await Promise.all((files || []).map(async (element) => {
    const { createReadStream, filename } = await element;
    const stream = createReadStream();

    stream.on('error', (error) => console.error(error));
    const body = stream;
    const timestamp = new Date().getTime();
    const fileExtension = extname(filename);

    const key = `${timestamp}${fileExtension}`;
    const params = {
      Bucket: bucketName,
      Key: key,
      Body: body,
    };

    const upload = promisify(s3.upload.bind(s3));
    const result = await upload(params).catch(console.log);

    return { key, url: result.Location };
  }));

  return objects;
};

const deleteObjects = async (objectKeys, bucketName) => {
  const params = {
    Bucket: bucketName,
    Delete: {
      Objects: [],
    },
  };

  objectKeys.forEach((element) => params.Delete.Objects.push({
    Key: element.key,
  }));

  const removeObjects = promisify(s3.deleteObjects.bind(s3));

  await removeObjects(params).catch(console.log);

  return true;
};

const sanitizeStr = (regex, str, data) => {
  const sanitizedStr = str.replace(regex, data);

  return sanitizedStr;
};

const getSignedUrl = async (key, bucketName) => {
  const sts = new AWS.STS();

  // eslint-disable-next-line no-unused-vars
  return new Promise((resolve, reject) => {
    sts.assumeRole(
      {
        DurationSeconds: 3600,
        ExternalId: '8610-4567-4519',
        RoleArn: 'arn:aws:iam::861045674519:role/s3RoleForAccessingData',
        RoleSessionName: 'abc',
      },
      (err, data) => {
        if (err) throw err;
        const accessparams = {
          accessKeyId: data.Credentials.AccessKeyId,
          secretAccessKey: data.Credentials.SecretAccessKey,
          sessionToken: data.Credentials.SessionToken,
        };
        const s3Object = new AWS.S3(accessparams);

        s3Object.getSignedUrl(
          'getObject',
          {
            Bucket: bucketName,
            Key: `${key}`,
            // Expires: 60 * 5 // time in seconds: e.g. 60 * 5 = 5 min
          },
          (error, data1) => {
            if (error) throw error;
            else resolve(data1);
          },
        );
      },
    );
  });
};

module.exports = {
  convertCamelObjectToSnake,
  convertCamelToSnake,
  convertSnakeObjectToCamel,
  convertSnakeToCamel,
  generateRandomPassword,
  generateWhereCondition,
  generateOrderCondition,
  uploadObjects,
  deleteObjects,
  sanitizeStr,
  getSignedUrl,
};

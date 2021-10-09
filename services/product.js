const { v1: uuidV1 } = require('uuid');
const { product: productModel, sequelize } = require('../database');
const Helper = require('./../utils/helper');
const { getUser } = require('./auth');

const checkAuthorization = async (authorization) => {
  const parts = authorization.split(' ');

  const bearer = parts[0];

  const token = parts[1];

  if (bearer === 'Bearer') {
    const user = getUser(token);

    if (user.error) {
      return {
        errors: [ {
          name: 'Authentication',
          message: user.msg,
        } ],
      };
    }

    return {
      user,
    };
  }

  return {
    errors: [ {
      name: 'Authentication',
      message: 'Authentication must use Bearer',
    } ],
  };
};

const getList = async (payload, authorization) => {
  const {
    pageSize, pageNumber, filters, sorting,
  } = payload;

  if (authorization) {
    const { errors } = await checkAuthorization(authorization);

    if (errors) {
      return { errors };
    }
    const limit = pageSize;
    const offset = limit * (pageNumber - 1);
    const where = Helper.generateWhereCondition(filters);
    const order = Helper.generateOrderCondition(sorting);
    const attributes = [ 'name', 'description', 'price',
      'discount', 'category', 'images', 'public_id', 'bucket_name',
    ];

    const response = await sequelize.query(`SELECT ${attributes} FROM public.product ${where} ${order} OFFSET ${offset} LIMIT ${limit}`, {
      nest: true,
      type: sequelize.QueryTypes.SELECT,
    });

    if (response.length > 0) {
      const count = response.length;

      const doc = response.map(async (element) => {
        const productImages = element.images;
        const bucket = element.bucket_name;
        const signedImages = await Promise.all(productImages.map(async (e) => {
          const { key } = e;
          const images = await Helper.getSignedUrl(key, bucket);

          return images;
        }));

        // eslint-disable-next-line no-param-reassign
        element.images = signedImages;

        return Helper.convertSnakeToCamel(element);
      });

      return {
        count,
        doc,
      };
    }

    return {
      count: 0,
      doc: [],
    };
  }

  return { errors: [ { name: 'Authenticated', message: 'User must be authenticated' } ] };
};

const getProductById = async (payload, authorization) => {
  const { publicId } = payload;

  if (authorization) {
    const { errors } = await checkAuthorization(authorization);

    if (errors) {
      return { errors };
    }
    const response = await productModel.findOne({
      where: {
        public_id: publicId,
      },
    });

    if (response) {
      const { dataValues } = response;
      const doc = Helper.convertSnakeToCamel(dataValues);
      const productImages = doc.images;
      const bucket = doc.bucketName;
      const signedImages = await Promise.all(productImages.map(async (element) => {
        const { key } = element;
        const images = await Helper.getSignedUrl(key, bucket);

        return images;
      }));

      doc.images = signedImages;

      return {
        doc,
      };
    }

    return {};
  }

  return { errors: [ { name: 'Authenticated', message: 'User must be authenticated' } ] };
};

const save = async (payload, authorization) => {
  const {
    name,
    description,
    price,
    discount,
    category,
    files,
    bucketName,
  } = payload;
  const transaction = await sequelize.transaction();

  try {
    if (authorization) {
      const { errors } = await checkAuthorization(authorization);

      if (errors) {
        return { errors };
      }
      const publicId = uuidV1();
      const uploadObjects = await Helper.uploadObjects(files, bucketName);

      await productModel.create({
        name,
        description,
        discount,
        price,
        images: uploadObjects,
        category,
        public_id: publicId,
        bucket_name: bucketName,
      }, {
        transaction,
      });

      await transaction.commit();

      return {
        doc: {
          publicId,
        },
      };
    }
    await transaction.rollback();

    return { errors: [ { name: 'Authenticated', message: 'User must be authenticated' } ] };
  } catch (error) {
    await transaction.rollback();

    return { errors: [ { name: 'transaction', message: 'transaction failed.' } ] };
  }
};

const updateProduct = async (payload, authorization) => {
  const {
    publicId,
    ...doc
  } = payload;

  const transaction = await sequelize.transaction();

  try {
    if (authorization) {
      const { errors } = await checkAuthorization(authorization);

      if (errors) {
        return { errors };
      }
      const response = await productModel.findOne({
        where: {
          public_id: publicId,
        },
        transaction,
      });

      if (response) {
        const { files } = doc;

        if (files) {
          const { dataValues } = response;
          const { images, bucketName } = Helper.convertSnakeToCamel(dataValues);

          await Helper.deleteObjects(images, bucketName);
          const uploadObjects = await Helper.uploadObjects(files, bucketName);

          if (uploadObjects) { doc.images = uploadObjects; }
        }
        const newDoc = { ...Helper.convertCamelToSnake(doc) };

        await productModel.update(newDoc, {
          where: { public_id: publicId },
          transaction,
        });
        await transaction.commit();

        return {
          doc: { publicId },
        };
      }

      await transaction.rollback();

      return { errors: [ { name: 'publicId', message: 'invalid publicId.' } ] };
    }
    await transaction.rollback();

    return { errors: [ { name: 'Authenticated', message: 'User must be authenticated' } ] };
  } catch (err) {
    await transaction.rollback();

    return { errors: [ { name: 'transaction', message: 'transaction failed.' } ] };
  }
};

const deleteProduct = async (payload, authorization) => {
  const {
    publicId,
  } = payload;
  const transaction = await sequelize.transaction();

  try {
    if (authorization) {
      const { errors } = await checkAuthorization(authorization);

      if (errors) {
        return { errors };
      }
      const response = await productModel.findOne({
        where: {
          public_id: publicId,
        },
        transaction,
      });

      if (response) {
        const { dataValues } = response;
        const { images, bucketName } = Helper.convertSnakeToCamel(dataValues);

        await Helper.deleteObjects(images, bucketName);

        await productModel.destroy({
          where: {
            public_id: publicId,
          },
          transaction,
        });
        await transaction.commit();

        return {
          doc: {
            publicId,
          },
        };
      }
      await transaction.rollback();

      return { errors: [ { name: 'publicId', message: 'invalid publicId.' } ] };
    }
    await transaction.rollback();

    return { errors: [ { name: 'Authenticated', message: 'User must be authenticated' } ] };
  } catch (err) {
    await transaction.rollback();

    return { errors: [ { name: 'transaction', message: 'transaction failed.' } ] };
  }
};

module.exports = {
  getList,
  getProductById,
  save,
  updateProduct,
  deleteProduct,
};

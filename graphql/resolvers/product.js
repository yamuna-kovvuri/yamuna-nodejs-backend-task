const { Product: ProductService } = require('../../services');

const getList = async (_, args, context) => {
  try {
    const { headers: { authorization } } = context;
    const {
      pageNumber: pageNumberValue, pageSize: pageSizeValue, sorting, filters,
    } = args;

    const pageNumber = pageNumberValue || 1;
    const pageSize = pageSizeValue || 100;
    const data = {
      filters, sorting, pageNumber, pageSize,
    };
    const limit = pageSize;
    const offset = limit * (pageNumber - 1);

    const { doc, count, errors: err } = await ProductService.getList({ ...data, limit, offset }, authorization);

    return {
      data: doc,
      pageInfo: {
        totalRecords: count, pageLimit: limit,
      },
      errors: err,
    };
  } catch (error) {
    return error;
  }
};

const getProductById = async (_, args, context) => {
  try {
    const { headers: { authorization } } = context;
    const { publicId } = args;
    const body = { publicId };
    const { doc, errors: err } = await ProductService.getProductById(body, authorization);

    if (err) {
      return { errors: err };
    }

    return { data: doc };
  } catch (error) {
    return error;
  }
};

const save = async (_, args, context) => {
  try {
    const { headers: { authorization } } = context;
    const { input } = args;
    const data = {
      ...input,
    };
    if(data.bucketName === ''){
      return { errors: [ { name: 'error', message: 'please Enter Valid bucket name' } ] };
    }
    if( data.name === ''  ){
      return { errors: [ { name: 'error', message: 'please Enter Valid product name' } ] };
    }
    const { errors: err, doc } = await ProductService.save(data, authorization);

    if (doc) {
      return { data: doc };
    }

    return { errors: err };
  } catch (error) {
    return error;
  }
};

const updateProduct = async (_, args, context) => {
  try {
    const { headers: { authorization } } = context;
    const { input, publicId } = args;

    const data = { ...input, publicId };

    const { errors: err, doc } = await ProductService.updateProduct(data, authorization);

    if (doc) {
      return { data: doc };
    }

    return { errors: err };
  } catch (error) {
    return error;
  }
};

const deleteProduct = async (_, args, context) => {
  try {
    const { headers: { authorization } } = context;
    const { input, publicId } = args;

    const data = { ...input, publicId };

    const { errors: err, doc } = await ProductService.deleteProduct(data, authorization);

    if (doc) {
      return { data: doc };
    }

    return { errors: err };
  } catch (error) {
    return error;
  }
};

module.exports = {
  Query: {
    Product: getProductById,
    Products: getList,
  },
  Mutation: {
    AddProduct: save,
    UpdateProduct: updateProduct,
    DeleteProduct: deleteProduct,
  },
};

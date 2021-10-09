const { User: UserService } = require('../../services');

const signIn = async (_, args) => {
  try {
    const { email, password } = args;

    // eslint-disable-next-line max-len
    const regExp = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const validateEmail = regExp.test(String(email).toLowerCase());

    if (!validateEmail) {
      return { errors: [ { name: 'email', message: 'please Enter Valid Email' } ] };
    }

    const { errors: err, token } = await UserService.signIn({ email, password });

    if (token) {
      return { token };
    }

    return { errors: err };
  } catch (error) {
    return error;
  }
};

const signUp = async (_, args) => {
  try {
    const { userName, email, password } = args;
    const data = {
      userName, email, password, role: 'admin',
    };
    // eslint-disable-next-line max-len
    const regExp = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const validateEmail = regExp.test(String(email).toLowerCase());

    if (!validateEmail) {
      return { errors: [ { name: 'email', message: 'please Enter Valid Email' } ] };
    }

    const { errors: err, token } = await UserService.signUp(data);

    if (token) {
      return { token };
    }

    return { errors: err };
  } catch (error) {
    return error;
  }
};

module.exports = {
  Mutation: {
    SignIn: signIn,
    SignUp: signUp,
  },
};

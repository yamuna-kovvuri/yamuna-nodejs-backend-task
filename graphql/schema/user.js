module.exports = `
  type USER_DATA {
    token: String
    errors: [ error ]
  }

  type Mutation {    
    SignIn(email: String!, password: String!): USER_DATA
    SignUp(userName: String!, email: String!, password: String!): USER_DATA
  }
`;

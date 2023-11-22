const { buildSchema } = require("graphql");

module.exports = buildSchema(
  ` 
    input userInputData {
        email: String!
        password: String!
    }
 
    type UserAuthData {
        isLoggedin: String!
        userId: String!
    }

    type RootQuery {
        userLogin(userInput: userInputData): UserAuthData!
    } 

    schema {
        query: RootQuery   
    }
`
);

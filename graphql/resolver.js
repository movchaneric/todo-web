const User = require("../models/user");
const bcrypt = require("bcryptjs");

module.exports = {
  userLogin: async function ({ userInput }) {
    const userFound = await User.findOne({ email: userInput.email });

    if (!userFound) {
      const error = new Error("User doest exists");
      error.code = 401;
      throw error;
    }

    const passwordMatched = await bcrypt.compare(
      userInput.password,
      userFound.password
    );

    if (!passwordMatched) {
      const error = new Error("Password doesnt matched");
      error.code = 401;
      throw error;
    }

    /*
    All data has been checked and found to be valid
    Return isLoggedin and userId
    */

    return { isLoggedin: "True-loggedin", userId: userFound._id.toString() };
  },
};

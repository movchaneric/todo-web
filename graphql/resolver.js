const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

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
    console.log(passwordMatched);

    if (!passwordMatched) {
      const error = new Error("Password doesnt matched");
      error.code = 401;
      throw error;
    }

    const token = jwt.sign(
      {
        email: userFound.email,
        userId: userFound._id.toString(),
      },
      "mysecretkey",
      {
        expiresIn: "1h",
      }
    );

    /*
    All data has been checked and found to be valid
    Return isLoggedin and userId
    */
    return { token: token, userId: userFound._id.toString() };
  },
};

const User = require("../models/user");
const Task = require("../models/task");
const bcrypt = require("bcryptjs");
const path = require("path");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

//mailing service
const nodemailer = require("nodemailer");
const mailGunTrasnporter = require("nodemailer-mailgun-transport"); //mailgun API

require("dotenv").config({ path: path.join(__dirname, "/.env") }); //load .env variables

const PASSWORD_SECURITY_LEVEL = 10;
//Mailing transporter
const transporter = nodemailer.createTransport(
  mailGunTrasnporter({
    auth: {
      api_key: process.env.MAILGUN_API_KEY,
      domain: process.env.MAILGUN_DOMAIN,
    },
  })
);

//Login GET and POST
exports.getLoginUser = (req, res, next) => {
  res.render("../views/login", {
    pageTitle: "Login",
    errorMessage: req.flash("error"),
  });
};

// exports.postLoginUser = async (req, res, next) => {
//   const email = req.body.email;
//   const password = req.body.password;

//   try {
//     const user = await User.findOne({ email: email });
//     if (!user) {
//       const error = new Error("User not found with this email");
//       error.code = 401;
//       throw error;
//     }

//     const passwordMatch = await bcrypt.compare(password, user.password);
//     //check if the password is correct
//     if (!passwordMatch) {
//       const error = new Error("Wrong password");
//       error.code = 401;
//       throw error;
//     }

//     const token = jwt.sign(
//       {
//         email: user.email,
//         userId: user._id.toString(),
//       },
//       "mysecretkey",
//       {
//         expiresIn: "1h",
//       }
//     );

//     res.status(200).json({
//       token: token,
//       userId: user._id.toString()
//     })
    
//   } catch (err) {
//     const error = new Error(err);
//     error.httpStatusCode = 500;
//     return next(error);
//   }
// };

//Register GET
exports.getRegisterUser = (req, res, next) => {
  res.render("../views/register", {
    pageTitle: "Register",
    errorMessage: req.flash("error"),
  });
};
//Register POST
//TODO: problem after register no redirecting ,CHECK AGAIN ALL AWAIT
exports.postUserRegister = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const profilePicture =
    "https://t4.ftcdn.net/jpg/03/46/93/61/360_F_346936114_RaxE6OQogebgAWTalE1myseY1Hbb5qPM.jpg";

  try {
    const userFound = await User.findOne({ email: email });

    if (userFound) {
      req.flash("error", "Email already exists");
      res.redirect("/register");
    } else {
      const hashedPassword = await bcrypt.hash(
        password,
        PASSWORD_SECURITY_LEVEL
      );

      const newUser = new User({
        email: email,
        password: hashedPassword,
        image: profilePicture,
      });

      try {
        await newUser.save();

        // Send confirmation mail
        try {
          await transporter.sendMail({
            to: email,
            from: "todo@app.com",
            subject: "ToDo: Signup Succeeded",
            html: "<h1>Hey! you have successfully signed up (:</h1>",
          });
          console.log("New user saved successfully");
          res.redirect("/login");
        } catch (mailError) {
          //TODO: fix mailing service or replace to another one so that everyuse can sent to him own mail without restrictions
          console.log("sendMail error: ", mailError);
          // res.redirect('/register');
          res.redirect("/login");
        }
      } catch (saveError) {
        console.log("postUserRegister inside save() method error:", saveError);
        res.redirect("/register");
      }
    }
  } catch (findError) {
    console.log("User.findOne error: ", findError);
    res.status(500).send("Internal Server Error");
  }
};

//Logout GET and POST
exports.getUserLogOut = (req, res, next) => {
  console.log("Inside getUserLogout");
  res.redirect("/login");
};

exports.postUserLogOut = (req, res, next) => {
  console.log("Inside postUserLogOut");
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/login");
  });
};

//Reset password GET and POST
exports.getResetPassword = (req, res, next) => {
  res.render("../views/reset-page", {
    pageTitle: "Reset Password",
    errorMessage: req.flash("error"),
  });
};

exports.postResetPassword = (req, res, next) => {
  const emailToReset = req.body.email;
  //Create token
  crypto.randomBytes(16, async (err, buffer) => {
    if (err) {
      console.log("crypto.randomBytes error: ", err);
      return;
    }

    const token = buffer.toString("hex");

    try {
      const user = await User.findOne({ email: emailToReset });

      if (!user) {
        req.flash("error", "No matched email was found");
        return res.redirect("/login");
      }
      user.resetToken = token;
      user.resetTokenExpirationDate = Date.now() + 3600000; //Set expiration time one hour from when token is generated

      user.save();

      transporter.sendMail({
        to: emailToReset,
        from: "todo-reset-password@app.com",
        subject: "Reset Password",
        html: `
            <h3>Hey! ${emailToReset.split("@")[0]} , Forgot your password? </h3>
            <p>Click the link: <a href="http://localhost:3000/reset-password/${token}"> link </a> to reset your password</p>
            `,
      });
      console.log("Reset link has been sent...");
      return res.redirect("/login");
    } catch (err) {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    }
  });
};

/*TODO: add a boolean when user is logged in 
    If logged in => return to tasks page.
    else not logged in => return to log in page
*/
//Reset password link redirection
exports.getResetForm = async (req, res, next) => {
  const token = req.params.token;
  console.log("token from params: ", token);
  //, resetTokenExpirationDate: {$gt: Date.now()}
  try {
    const user = await User.findOne({ resetToken: token });

    if (!user) {
      console.log("No user found");
      return;
    }
    res.render("../views/reset-password", {
      pageTitle: "Reset Password",
      userId: user._id.toString(),
    });
  } catch (findErr) {
    console.log("User.findOne inside getResetForm error: ", findErr);
  }
};

exports.postResetForm = async (req, res, next) => {
  const userId = req.body.userId;
  const newPassword = req.body.newPassword;

  try {
    const user = await User.findById({ _id: userId });

    if (!user) {
      console.log("User not found");
      return;
    }
    try {
      const hashedPassword = await bcrypt.hash(
        newPassword,
        PASSWORD_SECURITY_LEVEL
      );

      user.password = hashedPassword;
      user.resetToken = null;
      user.resetTokenExpirationDate = null;

      user.save();
      res.redirect("/login");
    } catch (hashErr) {
      console.log("postResetForm bcrypt.hash error: ", hashErr);
    }
  } catch (findUserErr) {
    console.log("findById inside postResetForm error: ", findUserErr);
    const error = new Error(findUserErr);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getProfilePage = async (req, res, next) => {
  const userIdConnceted = req.session.user._id; //get user id

  try {
    const user = await User.findById({ _id: userIdConnceted });

    const username = user.email.split("@")[0];
    try {
      const numOfTasksDone = await Task.count({
        userId: userIdConnceted,
        status: "Done",
      });
      try {
        const taskCount = await Task.count({ userId: userIdConnceted });
        return res.render("../views/profile-page", {
          pageTitle: "profile-page",
          numberOfTasks: taskCount,
          numberOfFinishedTasks: numOfTasksDone,
          username: username,
          profileImage: user.image,
        });
      } catch (totalCountErr) {
        console.log("totalCountErr inside getProfilePage err: ", totalCountErr);
        const error = new Error(totalCountErr);
        error.httpStatusCode = 500;
        return next(error);
      }
    } catch (finishCountErr) {
      console.log("Task.count inside getProfilePage err:", finishCountErr);
      const error = new Error(finishCountErr);
      error.httpStatusCode = 500;
      return next(error);
    }
  } catch (findErr) {
    console.log("getProfilePage User.findById error: ", findErr);
    const error = new Error(findErr);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.postProfiePage = async (req, res, next) => {
  const userId = req.session.user._id;
  const userImage = req.file;
  console.log(userImage);
  console.log("userImage path is: ", userImage.path);

  if (!userImage) {
    console.log("file format error"); // try with render to pass all nessecry data to profile-page
    return res.redirect("/profile-page");
  } else {
    const imagePath = userImage.path;
    try {
      await User.findByIdAndUpdate(
        { _id: userId },
        { $set: { image: imagePath } }
      );

      return res.redirect("/");
    } catch (updateErr) {
      console.log("postProfiePage findByIdAndUpdate error: ", err);
    }
  }
};

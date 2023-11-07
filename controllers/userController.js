const User = require('../models/user');
const Task = require('../models/task');
const bcrypt = require('bcryptjs');
const path = require("path");
const crypto = require('crypto');

//mailing service
const nodemailer = require('nodemailer');
const mailGunTrasnporter = require('nodemailer-mailgun-transport'); //mailgun API

require('dotenv').config({ path: path.join(__dirname, '/.env') }); //load .env variables

const PASSWORD_SECURITY_LEVEL = 10;
//Mailing transporter
const transporter = nodemailer.createTransport(mailGunTrasnporter({
    auth: {
        api_key: process.env.MAILGUN_API_KEY,
        domain: process.env.MAILGUN_DOMAIN
    }
}))

//Login GET and POST
exports.getLoginUser = (req, res, next) => {
    res.render('../views/login', {
        pageTitle: 'Login',
        errorMessage: req.flash('error'),
    })
};

exports.postLoginUser = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    User.findOne({ email: email })
        .then((user) => {
            if (!user) {
                req.flash('error', 'Email or Password are not valid') //pass flash message to login page after rendring using a session
                res.redirect('/login');//User not found
            }
            //check if the password is correct
            bcrypt.compare(password, user.password)
                .then(passwordMatch => {
                    if (passwordMatch) {
                        req.session.isLoggedin = true; //setup a session
                        req.session.user = user //save the user found in foundOne at the first .then
                        console.log('After req.session.user');
                        console.log('Password matched saving session and redirecting...')
                        return req.session.save((err) => {
                            if (err) {
                                console.log('req.session.save error: ', err);
                            } else {
                                res.redirect('/');
                            }
                        })
                    } else {
                        req.flash('error', 'Email or Password are not valid')
                        console.log('Password is not correct redirecting back to login page.')
                        res.redirect('/login');
                    }
                })
        }).catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500
            return next(error);
        })
}

//Register GET and POST
exports.getRegisterUser = (req, res, next) => {
    res.render('../views/register', {
        pageTitle: 'Register',
        errorMessage: req.flash('error'),
    });
}

exports.postUserRegister = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const profilePicture = 'https://t4.ftcdn.net/jpg/03/46/93/61/360_F_346936114_RaxE6OQogebgAWTalE1myseY1Hbb5qPM.jpg'

    User.findOne({ email: email })
        .then((userFound) => {
            if (userFound) { //new user tried to register with the same username WAS found.
                req.flash('error', 'Email already exists')
                res.redirect('/register');
            } else {
                return bcrypt.hash(password, PASSWORD_SECURITY_LEVEL)
                    .then(hashedPassword => {
                        const newUser = new User({
                            email: email,
                            password: hashedPassword,
                            image: profilePicture
                        });
                        newUser.save()
                            .then(() => {
                                //Send confirmation mail
                                transporter.sendMail({
                                    to: email,
                                    from: 'todo@app.com',
                                    subject: 'ToDo: Signup Succeeded',
                                    html: '<h1>Hey! you have successfuly signed up (:</h1>'
                                })
                                    .catch(err => {
                                        console.log('signUp sendMail error: ', err);
                                    })

                                console.log('New user saved succesfuly')
                                res.redirect('/login');
                            })
                            .catch((err) => {
                                console.log('postUserRegister inside save() method err:', err);
                                res.redirect('/register')
                            })
                    });
            }
        })

        .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500
            return next(error);
        });
}

//Logout GET and POST
exports.getUserLogOut = (req, res, next) => {
    console.log('Inside getUserLogout');
    res.redirect('/login');
}

exports.postUserLogOut = (req, res, next) => {
    console.log('Inside postUserLogOut');
    req.session.destroy((err) => {
        console.log(err)
        res.redirect('/login');
    });
}


//Reset password GET and POST
exports.getResetPassword = (req, res, next) => {
    res.render('../views/reset-page', {
        pageTitle: 'Reset Password',
        errorMessage: req.flash('error')
    })
} //work

exports.postResetPassword = (req, res, next) => {
    const emailToReset = req.body.email;
    //Create token
    crypto.randomBytes(16, (err, buffer) => {
        if (err) {
            console.log('crypto.randomBytes error: ', err);
            return;
        }
        const token = buffer.toString('hex');
        User.findOne({ email: emailToReset })
            .then((user) => {
                if (!user) {
                    req.flash('error', 'No matched email was found')
                    return res.redirect('/login');
                }
                user.resetToken = token;
                user.resetTokenExpirationDate = Date.now() + 3600000; //Set expiration time one hour from when token is generated
                return user.save()
            })
            .then(result => {
                transporter.sendMail({
                    to: emailToReset,
                    from: 'todo-reset-password@app.com',
                    subject: 'Reset Password',
                    html: `
                    <h3>Hey! ${emailToReset.split('@')[0]} , Forgot your password? </h3>
                    <p>Click the link: <a href="http://localhost:3000/reset-password/${token}"> link </a> to reset your password</p>
                `
                })
                return res.redirect('/login');
            })
            .catch((err) => {
                const error = new Error(err);
                error.httpStatusCode = 500
                return next(error);
            })
    })
}
/*TODO: add a boolean when user is logged in 
    If logged in => return to tasks page.
    else not logged in => return to log in page
*/
//Reset password link redirection
exports.getResetForm = (req, res, next) => {
    const token = req.params.token;
    console.log('token from params: ', token);
    //, resetTokenExpirationDate: {$gt: Date.now()}
    User.findOne({ resetToken: token })
        .then((user) => {
            if (!user) {
                console.log('No user found');
                return;
            }
            res.render('../views/reset-password', {
                pageTitle: 'Change Password',
                userId: user._id.toString()
            });
        })
        .catch(err => console.log('getResetForm error: ', err));
}

exports.postResetForm = (req, res, next) => {
    const userId = req.body.userId;
    const newPassword = req.body.newPassword;

    User.findById({ _id: userId })
        .then((user) => {
            if (!user) {
                console.log('User not found');
                return;
            }
            return bcrypt.hash(newPassword, PASSWORD_SECURITY_LEVEL)
                .then((hashedPassword) => {
                    user.password = hashedPassword;
                    user.resetToken = null;
                    user.resetTokenExpirationDate = null;
                    user.save();
                })
                .then(result => {
                    res.redirect('/login')
                })
                .catch(err => 'postResetForm bcrypt.hash error: ', err);
        })
        .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500
            return next(error);
        });
}

//TODO: continue working on profil page and POST
exports.getProfilePage = (req, res, next) => {
    const userIdConnceted = req.session.user._id;//get user id

    User.findById({ _id: userIdConnceted })
        .then(user => {
            const username = user.email.split('@')[0];

            Task.count({ userId: userIdConnceted, status: 'Done' })
                .then(numOfTasksDone => {
                    Task.count({ userId: userIdConnceted })
                        .then(taskCount => {
                            return res.render('../views/profile-page', {
                                pageTitle: 'profile',
                                numberOfTasks: taskCount,
                                numberOfFinishedTasks: numOfTasksDone,
                                username: username,
                                profileImage: user.image
                            });
                        })
                        .catch(err => {
                            const error = new Error(err);
                            error.httpStatusCode = 500;
                            return next(error);
                        });
                })
                .catch(err => {
                    const error = new Error(err);
                    error.httpStatusCode = 500;
                    return next(error);
                });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        })
}

exports.postProfiePage = (req, res, next) => {
    const userId = req.session.user._id;
    const userImage = req.file;
    console.log(userImage)

    if(!userImage){
        console.log('file format error')
        res.redirect('/profile-page')
        //TODO: add all properties: numberOfTasks, pageTitle, numberOfFinishedTasks like in getProfile
    }else{
        const imagePath  = userImage.path;

        User.findByIdAndUpdate({_id: userId}, {$set: {image: imagePath}})
        .then(result => {
            return res.redirect('/profile-page');
        })
        .catch(err => console.log('postProfiePage findByIdAndUpdate error: ', err));
    }
    
    
}

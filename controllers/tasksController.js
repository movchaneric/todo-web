const Task = require('../models/task');
const User = require('../models/user');

exports.getUserTasks = (req, res) => {
    const userIdConnceted = req.session.user._id; //use to filter by which user is connected to get specific tasks.
    const imageUrl = req.file
    User.findOne({_id: userIdConnceted})
    .then(user => {
        const username = user.email.split('@')[0]; //get only the name before the @
        Task.find({userId: userIdConnceted})
                .then(userTasks => {
                    res.render('../views/index', {
                        pageTitle: 'Add Your tasks!',
                        tasks: userTasks,
                        taskLength: userTasks.length,
                        username: username,
                        profilePicture: user.image
                    })
                })
                .catch(err => {
                    console.log('fetchAllTasks error: ', err);
                })
    }).catch(err => {
        const error = new Error(err);
        return next(error);
    })
    
}

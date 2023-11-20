const Task = require('../models/task');
const User = require('../models/user');

const TASK_PER_PAGE = 2;

exports.getUserTasks = async (req, res, next) => {
    const userIdConnected = req.session.user._id;
    const imageUrl = req.file;
    const pageNumber = parseInt(req.query.page) || 1;
    let totalNumOfTasks;
    try {
        const numOfTasks = await Task.find().count();
        const userTasks = await Task.find({ userId: userIdConnected }).skip((pageNumber - 1) * TASK_PER_PAGE).limit(TASK_PER_PAGE);
        const user = await User.findOne({ _id: userIdConnected });
        const username = user.email.split('@')[0];

        res.render('../views/index', {
            pageTitle: 'Add Your tasks!',
            tasks: userTasks,
            taskLength: userTasks.length,
            username: username,
            profilePicture: user.image,
            totalTasks: numOfTasks,
            hasNext: (TASK_PER_PAGE * pageNumber) < numOfTasks,
            hasPrevious: pageNumber > 1,
            nextPage: pageNumber + 1,
            prevPage: pageNumber - 1,
            lastPage: Math.ceil(numOfTasks / TASK_PER_PAGE),
            currentPage: pageNumber
        });
    } catch (err) {
        console.log('User.findOne error: ', err);
        res.redirect('/404');
    };
};



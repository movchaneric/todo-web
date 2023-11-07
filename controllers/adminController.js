const Task = require("../models/task");

exports.addNewTask = (req, res, next) => {

    const taskDesc = req.body.taskDesc; 
    const userId = req.session.user._id;
    console.log('taskDesc is: ', taskDesc);
    
    const newTask = new Task(
        {
        description: taskDesc,
        status: 'In Progress',
        userId: userId //get somehow userId , but need first maybe to validate and when moving to all tasks page
        }
    );

    newTask.save()
        .then(() => {
            console.log('Task created');
            res.redirect('/');
        })
        .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500
            return next(error);
        })
}


exports.removeTask = (req, res, next) => {
    const taskId = req.body.taskId;

    Task.findByIdAndRemove({
        _id: taskId
    })
        .then(() => {
            res.redirect('/')
        })
        .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500
            return next(error);
        });
}

exports.editTaskToFinish = (req, res, next) => {
    const taskId = req.body.taskId;
    Task.findByIdAndUpdate(
        {_id: taskId},
        {$set: {status: 'Done'}})
        .then(() => {
            res.redirect('/');
        })
        .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500
            return next(error);
        })
}




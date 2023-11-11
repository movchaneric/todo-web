const Task = require("../models/task");

exports.addNewTask = async (req, res, next) => {

    const taskDesc = req.body.taskDesc; 
    const userId = req.session.user._id;
    console.log('taskDesc is: ', taskDesc);
    //create a new task mongoose object  
    const newTask = new Task(
        {
        description: taskDesc,
        status: 'In Progress',
        userId: userId //get somehow userId , but need first maybe to validate and when moving to all tasks page
        }
    );
    //save the task to db 
    try{
        await newTask.save();
        console.log('Task created');
        res.redirect('/');
    }catch(saveErr){
        console.log('save task error inside addNewTask : ', saveErr)
        const error = new Error(saveErr);
        error.httpStatusCode = 500
        return next(error);
    }
}


exports.removeTask = async (req, res, next) => {
    const taskId = req.body.taskId;
    try {
        await Task.findByIdAndRemove({_id: taskId})
        res.redirect('/')    
    } catch (removeErr) {
        const error = new Error(err);
            error.httpStatusCode = 500
            return next(error);
    }
}

exports.editTaskToFinish = async (req, res, next) => {
    const taskId = req.body.taskId;
    try {
       await Task.findByIdAndUpdate(
        {_id: taskId},
        {$set: {status: 'Done'}})
        
        res.redirect('/'); 
    } catch (findUpdtErr) {
        console.log('findByIdAndUpdate editTaskToFinish error :', findUpdtErr)
       
        const error = new Error(findUpdtErr);
        error.httpStatusCode = 500
        return next(error);
    }
}




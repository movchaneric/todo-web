const express = require('express');
const Task = require('../../models/task');
const isAuth = require('../../util/is-auth'); //protect from unsigned user to access parts of the site

const adminController = require('../../controllers/adminController');

const router = express.Router();

//add task
router.post('/add-task', isAuth, adminController.addNewTask);

//remove task by id
router.post('/remove-task', isAuth, adminController.removeTask);

//edit task to finish
router.post('/finish-task', isAuth, adminController.editTaskToFinish)

// exports.adminRoutes = router;
module.exports = router;

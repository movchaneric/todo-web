const express = require('express');
const path = require('path');

const router = express.Router();

const userTasks = require('../../controllers/tasksController');
const isAuth = require('../../util/is-auth');

//show main page
router.get('/', isAuth, userTasks.getUserTasks);

module.exports = router;
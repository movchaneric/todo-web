const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const taskScheme = new Schema({
    description: {
        type: String,
        required: true
    },

    status: {
        type: String,
        required: true
    },

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
})

module.exports = mongoose.model('Task', taskScheme);

// const getDb = require('../util/database').getDb;
// const mongodb = require('mongodb');
//
// module.exports = class Task {
//     constructor(description) {
//         this.description = description;
//         this.status = 'In Progress';
//     }
//
//     saveDb(){
//         const db = getDb();
//         return db.collection('tasks').insertOne(this)
//             .then((task) => {
//                 console.log('task info: ', task);
//             }).catch((err) => {
//                 throw err;
//         });
//     }
//
//     static fetchAllTasks(){
//         const db = getDb();
//         return db.collection('tasks')
//             .find().toArray()
//             .then((userTasks) => {
//                 return userTasks;
//             })
//             .catch((err) => {
//                 console.log('fetchAllTasks error: ', err);
//             })
//     }
//
//     static removeTaskById(taskId){
//         const db = getDb();
//         return db.collection('tasks')
//             .deleteOne({_id: new mongodb.ObjectId(taskId)})
//             .then((result) => {
//                 console.log('Task deleted')
//             })
//             .catch((err) => {
//                 console.log('removeTaskById: ', err);
//             });
//     }
//
//     static editTask(taskId){
//         let db = getDb();
//         return db.collection('tasks')
//             .findOneAndUpdate(
//                 {_id: new mongodb.ObjectId(taskId)},
//                 {$set: {status: 'Done'}})
//             .then((result) => {
//                 console.log('editTask result: ', result);
//                 console.log('updated');
//             })
//             .catch((err)=> {
//                 console.log('editTask err: ', err);
//             })
//     }
// }

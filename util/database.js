const mongodb = require('mongodb');
const mongoClient = mongodb.MongoClient;

let _db;
const mongoConnect = (cb) => {
    console.log('Trying connect to db...')
    mongoClient.connect('mongodb+srv://movchaneric:YBTvrVp8vgu95WvM@tododb.oiusd5y.mongodb.net/?retryWrites=true&w=majority')
        .then((client) => {
            console.log('database.js: Succesfuly connected to db');
            _db = client.db();
            cb();
        })
        .catch((err) => {
            console.log('mongodb error: ', err);
            throw err;
        })
}

const getDb = () => {
    //check if db running
    if(_db){
        return _db;
    }
    throw 'No database has been found';
}

// module.exports = mongoConnect;
exports.mongoConnect = mongoConnect;
exports.getDb = getDb;
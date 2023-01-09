var MongoClient = require('mongodb').MongoClient;
var connectionString = "mongodb+srv://blackeyredheart:PThBX5aTkaJV2C02@cluster0.sfc35kn.mongodb.net/redirect";
const client = new MongoClient(connectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
let dbConnection;
module.exports = {
    connectToServer: function(callback) {
        client.connect(function(err, db) {
            if (err || !db) {
                return callback(err);
            }
            dbConnection = db.db("redirect");
            console.log("Successfully connected to MongoDB.");
            return callback();
        });
    },
    getDb: function() {
        return dbConnection;
    },
};
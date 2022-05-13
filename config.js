const mc = require("mongodb").MongoClient;
let config = {};
config.db = {};
//mongodb+srv://goosyloosy4:<password>@tutorial9.3rqi1.mongodb.net/myFirstDatabase?retryWrites=true&w=majority
// create properties on the config.db object for the host and database names
const username = "goosyloosy4"; // username for the MongoDB Atlas on cloud
const password = "brother2020CU"; // password for the MongoDB on cloud
const dbname = "community-fridge-101187396"; // name of the database that we want to connect to

const connectionURL = `mongodb+srv://${username}:${password}@tutorial9.3rqi1.mongodb.net/${dbname}?retryWrites=true&w=majority`; // full URL for connecting to our MongoDB database; includes the database username, password, and the database name
mc.connect(connectionURL, function(err, client) {
	if(err) throw err; // catch the error if there were any issues with connecting to the database (e.g., authentication issues)

	console.log("We have successfully connected to the database!");

	// In here, you can select a database and start querying the contents of the database

	// Close the connection to the database
	client.close();
});
// create properties on the config.db object for the host and database names
config.db.host = connectionURL;
config.db.name = dbname;

module.exports = config;

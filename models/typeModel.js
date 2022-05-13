const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// TODO: create the schema for a Type
let type = Schema({
    id: {
		type: String,
        unique: true,
		required: true,
		minlength: 1,
		maxlength: 4
	},
    name: { 
		type: String,
		required: true,
		minlength: 3,
		maxlength: 50
	},
});

let typeModel = mongoose.model('Type', type);
module.exports = typeModel;
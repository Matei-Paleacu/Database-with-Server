const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// TODO: create the schema for an Item
let item = Schema({
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
    type: {
		type: String,
		required: true
	},
    img: { 
		type: String,
		required: true,
		minlength: 3,
		maxlength: 50
	},
});

let itemModel = mongoose.model('Item', item);
module.exports = itemModel;
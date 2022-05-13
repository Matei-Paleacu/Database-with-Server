const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// TODO: create the schema for a Fridge
let fridge = Schema({
    id: {
		type: String,
        unique: true,
		required: true,
		minlength: 4,
		maxlength: 6,
	},
    name: { 
		type: String,
		required: true,
		minlength: 3,
		maxlength: 50
	},
    numItemsAccepted: {
		type: Number,
        default: 0
	},
    canAcceptItems: {
		type: Number,
		required: true,
		min: [1],
		max: [100]
	},
    contactInfo:{
        type:{
            contactPerson: {
                type: String,
            },
            contactPhone: {
                type: String,
            },
        }
    },
    address: {
        street: {
            type: String,
        },
        postalCode: {
            type: String,
        },
        city: {
            type: String,
        },
        province: {
            type: String,
        },
        country: {
            type: String,
        },
	},
    acceptedTypes: {
		type: [String],
		required: true,
	},
    items: {  
        type:[{
            id: {
                type: String,               //unique?
            },
            quantity: {
                type: Number,
            }
        }]  
    },
});

let fridgeModel = mongoose.model('Fridge', fridge);
module.exports = fridgeModel;
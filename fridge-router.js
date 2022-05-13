// This module is cached as it has already been loaded
const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
let router = express.Router();
let Type = require("./models/typeModel");
let Fridge = require("./models/fridgeModel");
let Item = require("./models/itemModel");
const { exit } = require('process');

app.use(express.json()); // body-parser middleware

// Get /fridges and return the all of the fridges based on requested format
router.get('/', (req,res)=> {
    res.format({
		'text/html': ()=> {
			res.set('Content-Type', 'text/html');
			res.sendFile(path.join(__dirname,'public','view_pickup.html'),(err) =>{
				if(err) res.status(500).send('500 Server error');
			});
		},
		'application/json': ()=> {
			let findQuery = Fridge.find();
			findQuery.exec(function(err,result){
			  if(err) throw err;
			  console.log(result);
			  res.status(200);
			  res.set('Content-Type', 'application/json');
			  res.json(result);
			});			

        },
        'default' : ()=> {
            res.status(406).send('Not acceptable');
        }
    })
});
// helper route, which returns the accepted types currently available in our application. This is used by the addFridge.html page
router.get("/types", function(req, res, next){
	let types = [];
  Object.entries(req.app.locals.items).forEach(([key, value]) => {
    if(!types.includes(value["type"])){
      types.push(value["type"]);
    }
  });
	res.status(200).set("Content-Type", "application/json").json(types);
});

// Middleware function: this function validates the contents of the request body associated with adding a new fridge into the application. At the minimimum, it currently validates that all the required fields for a new fridge are provided.
function validateFridgeBody(req,res,next){
    let properties = ['name','can_accept_items','accepted_types','contact_person','contact_phone','address'];

    for(property of properties){
      // hasOwnProperty method of an object checks if a specified property exists in the object. If a property does not exist, then we return a 400 bad request error
        if (!req.body.hasOwnProperty(property)){
            return res.status(400).send("Bad request");
        }
    }
    // if all the required properties were provided, then we move to the next set of middleware and continue program execution.
    next();
}
// Middleware function: this validates the contents of request body, verifies item data
function validateItemBody(req,res,next){
    let properties = ['id','quantity'];
    for (property of properties){
        if (!req.body.hasOwnProperty(property))
			return res.status(400).send("Bad request");
    }
    next();
}
// Adds a new fridge, returns newly created fridge
router.post('/', express.json(), (req,res)=> {
	let fridge = new Fridge(req.body);
	fridge.save(function(err,result){
	  if(err){
		  for(x in err.errors){
				console.log("1: " + err.errors[x].kind);
				console.log("2: " + err.errors[x].message);
				console.log("3: " + err.errors[x].path);
				console.log("4: " + err.errors[x].value);
		  }
		  res.status(400).send("Fridge body does not match schema")
		  return;
	  }
		res.status(200);
		res.set('Content-Type', 'application/json');
		res.json(fridge);

	});	
});

// Get /fridges/{fridgeID}. Returns the data associated with the requested fridge.
router.get("/:fridgeId", function(req, res, next){
	let fridgeID = req.params.fridgeId; 
	let findQuery = Fridge.find().where("id").eq(fridgeID);
	findQuery.exec(function(err,result){
	  if(err) throw err;
	  console.log(result);
	  if(result.length>0){
		res.status(200);
		res.set('Content-Type', 'application/json');
		res.json(result);
	  }else{
		res.status(404);
		res.send("There is no fridge with such ID.");
	  }
	});	
});

// Updates a fridge and returns the data associated.
// Should probably also validate the item data if any is sent, oh well :)
router.put("/:fridgeId",validateFridgeBody, (req, res) =>{	//check types sent?
	let fridgeID = req.params.fridgeId; 
	let findQuery = Fridge.find().where("id").eq(fridgeID);
	findQuery.exec(function(err,result){
	  if(err) throw err;
	  console.log(result);
	  if(result.length>0){
		let updateQuery = Fridge.updateOne(result, req.body);
		updateQuery.exec(function(err,result2){
		  if(err) throw err;
		  console.log(result2);
		  if(result2.acknowledged != false){
			res.status(200);
			res.set('Content-Type', 'application/json');
			res.json(result2);
		  }else{
			res.status(400);
			res.send("Does not follow fridge schema");
		  }
		});	
	  }else{
		res.status(404);
		res.send("There is no fridge with such ID.");
	  }
	});	
});

function validateFridgeBody(req,res,next){
	let match = 0;
	let counter = 0;
	let matchA = 0;
    let properties = ["id","name","numItemsAccepted","canAcceptItems","acceptedTypes","contactInfo","contactPerson",
	"contactPhone", "address","street","postalCode","city","province","country","items"];
	let keys = Object.keys(req.body);
	for(inn of keys){
		console.log(inn);
		if(inn === "address"){
			console.log("1");
			let k = Object.values(req.body);
			let k2 = Object.keys(k[counter]);
			for(let inn1 of k2){
				matchA = 0;
				for(let v of properties){
				  if(inn1 === v){
					matchA = 1;
				  }
				}
				if(matchA === 0){
					return res.status(400).send("Does not follow fridge schema");
				}
			  }
		}else{
			if(inn === "contactInfo"){
				console.log("2");
				let k = Object.values(req.body);
				let k2 = Object.keys(k[counter]);
				for(let inn1 of k2){
					matchA = 0;
					for(let v of properties){
					  if(inn1 === v){
						matchA = 1;
					  }
					}
					if(matchA === 0){
						return res.status(400).send("Does not follow fridge schema");
					}
				  }
			}else{
				match = 0;
				for(let v of properties){
					if(inn === v){
						console.log(v + "MATCH");
					  match = 1;
					}
				}
				if(match === 0){
					return res.status(400).send("Does not follow fridge schema");
				}
			}
		}
		counter++;
	}
    next();
}

// Adds an item to specified fridge
router.post("/:fridgeId/items", validateAddItem, (req,res)=>{
	let fridgeID = req.params.fridgeId; 
	let findQuery = Fridge.find().where("id").eq(fridgeID);
	findQuery.exec(function(err,result){
	  if(err) throw err;
	  if(result.length>0){
		let findItemQuery = Fridge.find({"items.id":req.body.id, "id":fridgeID});
		findItemQuery.exec(function(err,result2){
		  if(err) throw err;
		  if(result2.length === 0){
			let findIQuery = Item.find().where("id").eq(req.body.id);
			findIQuery.exec(function(err,r){
			  if(err) throw err;
			  console.log(r);
			  if(r.length !== 0){
				let addQuery = Fridge.findOneAndUpdate({"id":fridgeID},{$push: {items: req.body}});
				addQuery.exec(function(err,result3){
				  if(err) throw err;
				  if(result3 !== null){
					res.status(200);
					res.set('Content-Type', 'application/json');
					res.json(result3);
				  }else{
					res.status(500);
					res.send("Could not add item to items array");
				  }
				});	
			}else{
				res.status(404);
				res.send("There is no item with such ID.");
			  }
			});	
		  }else{
			res.status(409);
			res.send("Item with that ID already exist in the fridge");
		  }
		});	
	  }else{
		res.status(404);
		res.send("There is no fridge with such ID.");
	  }
	});	
})

function validateAddItem(req,res,next){
    let properties = ['id','quantity'];
    for (property of properties){
        if (!req.body.hasOwnProperty(property))
			return res.status(400).send("Does not follow fridge schema");
    }
    next();
}

// Deletes an item from specified fridge
router.delete("/:fridgeId/items/:itemId", (req,res)=>{
	let fridgeID = req.params.fridgeId; 
	let itemID = req.params.itemId; 
	let findQuery = Fridge.find().where("id").eq(fridgeID);
	findQuery.exec(function(err,fridge){
	  if(err) throw err;
	  console.log("1");
	  if(fridge.length>0){
		let findItemQuery = Item.find().where("id").eq(itemID);
		findItemQuery.exec(function(err,result2){
		  if(err) throw err;
		  console.log(result2);
		  if(result2.length>0){
			let findItemInFQuery = Fridge.find({"items.id":itemID, "id":fridgeID});
			findItemInFQuery.exec(function(err,result3){
			  if(err) throw err;
			  console.log("3");
			  if(result3.length>0){
				fridge[0].items = fridge[0].items.filter(item => item.id !== itemID);
				fridge[0].save(function(err, sresult){
					if(err){
						res.status(500);
						res.send("Unable to delete item.");
						return;
					}
					res.status(200);
					res.set("Content-Type", "application/json");
					res.json(sresult);
				});
			  }else{
				res.status(404);
				res.send("The item does not exist in the fridge");
			  }
			});	
		  }else{
			res.status(404);
			res.send("There is no item with such ID.");
		  }
		});	
	  }else{
		res.status(404);
		res.send("There is no fridge with such ID.");
	  }
	});	
})

router.delete("/:fridgeId/items", (req,res)=>{
	let fridgeID = req.params.fridgeId; 
	let itemID = req.params.itemId; 
	let que = req.query;
	let inc = 0;
	let items = Object.keys(que);
	let findQuery = Fridge.find().where("id").eq(fridgeID);
	findQuery.exec(function(err,fridge){
	  if(err) throw err;
	  console.log("1");
	  if(fridge.length>0){
		if(Object.keys(que).length === 0){
			let len = fridge[0].items.length;
			for(let i = 0; i<len;i++){
				fridge[0].items.pop();
			}
			fridge[0].save(function(err, sresult){
				if(err){
					res.status(500);
					res.send("Unable to delete items.");
					return;
				}
				res.status(200);
				res.set("Content-Type", "application/json");
				res.json(sresult);
				return;
			});
		}else{
			for(let it of items){
				let findItemQuery = Item.find().where("id").eq(it);
				findItemQuery.exec(function(err,result2){
		  		if(err) throw err;
		  			if(result2.length>0){
						if(items[items.indexOf(it)+1] === undefined){
							for(let checkI of items){
								fridge[0].items = fridge[0].items.filter(ie => ie.id !== checkI);
								}
								fridge[0].save(function(err, sresult){
								if(err){
									res.status(500).send("server error");
									return;
								}
								res.status(200).send("All item ID have been removed");
									return;
								});
						}
		  			}else{
						  console.log("Item ID does not exist" + it);
						res.status(404).send("Item ID does not exist");
						return;
		  			}
				});	
			}
			console.log("HERE");
		}
	  }else{
		res.status(404);
		res.send("There is no fridge with such ID.");
	  }
	});	
})

router.put("/:fridgeId/items/:itemId",express.json(), (req, res) =>{	//check types sent?
	let fridgeID = req.params.fridgeId; 
	let itemID = req.params.itemId; 
	let findQuery = Fridge.find().where("id").eq(fridgeID);
	findQuery.exec(function(err,fridge){
	  if(err) throw err;
	  console.log(fridge);
	  if(fridge.length>0){
		let findItemInFQuery = Fridge.find({"items.id":itemID, "id":fridgeID});
		findItemInFQuery.exec(function(err,result3){
		  if(err) throw err;
		  if(result3.length>0){
			for(let i = 0; i<fridge[0].items.length;i++){
				if(fridge[0].items[i].id === itemID){
					fridge[0].items[i].quantity = req.body.quantity;
				}
			}
			fridge[0].save(function(err, sresult){
				if(err){
					res.status(500);
					res.send("Unable to update item.");
					return;
				}
				res.status(200);
				res.set("Content-Type", "application/json");
				res.json(sresult);
			});
		  }else{
			res.status(404);
			res.send("The item does not exist in the fridge");
		  }
		});	
	  }else{
		res.status(404);
		res.send("There is no fridge with such ID.");
	  }
	});	
})

router.post("/items", validateNewItem, (req,res)=>{
	let findIQuery = Item.find().where("name").eq(req.body.name);
	findIQuery.exec(function(err,r){
	  if(err) throw err;
	  console.log(r);
	  if(r.length === 0){
		let item = new Item(req.body);
		item.save(function(err,result3){
			if(err){
				for(x in err.errors){
					  console.log("1: " + err.errors[x].kind);
					  console.log("2: " + err.errors[x].message);
					  console.log("3: " + err.errors[x].path);
					  console.log("4: " + err.errors[x].value);
				}
				res.status(400).send("Item body does not match schema");
				return;
			}
			  res.status(200);
			  res.set('Content-Type', 'application/json');
			  res.json(item);
		});	
	}else{
		res.status(409);
		res.send("An Item with that name already exist");
	  }
	});	
})

function validateNewItem(req,res,next){
    let properties = ['id','name','type','img'];
    for (property of properties){
        if (!req.body.hasOwnProperty(property))
			return res.status(400).send("Does not follow item schema");
    }
    next();
}

router.get("/search/items", function(req, res, next){
	if(req.query === undefined){
		res.status(400);
		res.send("Not a proper query string");
		return;
	}
	let typeFind = req.query.type;
	let nameFind = req.query.name;
	let retArray = [];
	if(typeFind === undefined || nameFind === undefined){
		res.status(400);
		res.send("Not a proper query string");
		return;
	}
	if(typeFind === "dairy"){
		typeFind = 1;
	}
	if(typeFind === "produce"){
		typeFind = 2;
	}
	if(typeFind === "pantry"){
		typeFind = 3;
	}
	let findQuery = Item.find({type:typeFind});
	findQuery.exec(function(err,result){
	  if(err) throw err;
	  console.log(result);
	  if(result.length>0){
		for(let i = 0; i<result.length;i++){
			if(result[i].name.includes(nameFind)){
				retArray.push(result[i]);
			}
		}
		if(retArray.length === 0){
			res.status(200);
			res.send("No matches for search");
		}else{
			res.status(200);
			res.set('Content-Type', 'application/json');
			res.json(retArray);
		}
	  }else{
		res.status(200);
		res.send("No items with such type");
	  }
	});	
});

module.exports = router;

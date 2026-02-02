const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const inventorySchema = new Schema({
    inventoryName: {
    type: String, //data type
    required: true,  //validate
  },
  category: {
    type: String,//data type
  },
  quantity: {
    type: Number,
    
  },
   unit: {
    type:String,
  },
  reorder_level: {
    type:Number,
  }

    
});

module.exports = mongoose.model(
    "Inventory",//file name
   inventorySchema//function name
);
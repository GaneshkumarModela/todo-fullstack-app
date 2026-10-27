                /*Initialize the schema of your app in a new file (db.js)*/

const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;


//users Schema
const userSchema = new Schema({
    name:String,
    email:{type : String, unique : true}, 
    pwd:String
});

//todos Schema
const todoSchema = new Schema({
    userId:ObjectId,
    task:String,
    completed:Boolean
});

//Let's now define Collections/tables/data-model
const userModel = mongoose.model("users",userSchema);
const toDoModel = mongoose.model("toDos",todoSchema);

//Now, let's export these tables/models/collections
//so that my backend-app code will perform db calls on those tables
module.exports = {
    userModel,
    toDoModel
};

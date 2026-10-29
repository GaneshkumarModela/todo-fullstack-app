/**** week-7.1->This Assignment is to understand DB integration into the full stack app ***/

/** Week-7.2 -> Adding hashing technique to the codebase to hash pwds before storing them on to the database**/
require("dotenv").config();
const bcrypt = require("bcrypt");
const express = require("express");
const {userModel, toDoModel} = require("./db");
const mongoose = require("mongoose");
const {z} = require("zod");
const cors = require("cors");

const jwt = require("jsonwebtoken");
const JWT_KEY = process.env.JWT_KEY;
const {authenticateToken} = require("./auth");

const app = express();

app.use(express.json());
app.use(cors());


//SIGN - UP
app.post("/signup",async (req, res)=>{

    //input validation
    const requiredSchema = z.object({
        name : z.string().min(3).max(100),
        email : z.email(),
        pwd : z
        .string()
        .regex(/[A-Z]/,"pwd must contain atleast one uppercase")
        .regex(/[a-z]/,"pwd must contain atleast one lowercase")
        .regex(/[^A-Za-z0-9]/,"pwd must contain atleast one special character")
    })

    //It returns an Object
    const result = requiredSchema.safeParse(req.body);
    if (!result.success) {

        return res.status(400).json({
            //returning an errors array
             errors: result.error.issues.map(issue=>issue.message)
        });
    }

    const userName = req.body.name;
    const userEmail = req.body.email;
    const pwd = req.body.pwd;

    const hashedPwd = await bcrypt.hash(pwd, 5);
    console.log("hashedPwd : "+hashedPwd);

    //userModel.create will immediately returns a promise(neither resolved nor rejected)
    //Telling that i will return you something in the future
    //We have to await on promise to get resolved/rejected

    try{

        await userModel.create({

            name:userName,
            email:userEmail,
            pwd:hashedPwd
        });

        res.status(201).json({msg:"you have signed up successfully"});

    }catch(error){
        console.error("Sign up failed:", error.message);
        res.status(409).json({msg:"emailId already registered"});
    }
});


//LOGIN/SIGN-IN
app.post("/login",async (req, res)=>{

    const email = req.body.email;
    const pwd = req.body.pwd;

    try{
        const user = await userModel.findOne({
            email
        });

        console.log(user);

        if(!user){
            res.status(401).json({msg:"user not found in DB!!!, invalid emailId"});
            return;
        }

        const isPwdMatch = await bcrypt.compare(pwd, user.pwd);
    
        if(isPwdMatch){

            const token = jwt.sign({userId:user._id}, JWT_KEY);
            res.status(201).json({token:token});

        } else res.status(401).json({msg:"user not found in our DB!!!, pwd incorrect"});

    }catch(error){
        console.error("login failed ",error.message);

        res.status(501).json({msg:"login failed, please try again"});
    }
});



//ADD TODO
app.post("/addToDo", authenticateToken, async (req, res)=>{

    const task = req.body.task;

    try{
        await toDoModel.create({
            userId:req.userId,
            task:task,
            completed:false
        })

        res.status(201).json({msg:"toDo insertion completed"});

    }catch(error){

        console.error("Todo insertion failed:",error.message);
        res.status(501).json({msg:"ToDo insertion failed, please try again.."});
    };
})


//GET TODO
app.get("/todos", authenticateToken, async (req, res)=>{

    const toDos = await toDoModel.find({
        userId: req.userId
    })
    
    res.status(201).json(toDos);
});


//DELETE TODO
app.delete("/deleteToDo",authenticateToken, async (req, res)=>{

    const id = req.body.id;

    await toDoModel.deleteOne({
        _id : id,
        //To make sure we are deleting todo of logged in user only 
        userId: req.userId 
    })

    res.status(201).json({msg:"toDo deleted successfully"});

})

//UPDATE TODO
//feature - 1 :  to update existing toDo   
//feature - 2 : to mark toDo as done
app.put("/updateToDo",authenticateToken, async (req, res)=>{

    const id = req.body.id;

    if (req.body.task !== undefined) {

        await toDoModel.findByIdAndUpdate(
            //To make sure we are updating todo of logged in user only
            {_id:id, userId: req.userId },
            {task : req.body.task},
            {new : true,runValidators : true}
        )

        res.status(201).json({msg:"toDo updated successfully"})
    }

    if (req.body.completed !== undefined) {

        await toDoModel.findByIdAndUpdate(
             //To make sure we are updating todo of logged in user only
            {_id:id,userId: req.userId},
            {completed : req.body.completed},
            {new : true,runValidators : true}
        )

        res.status(201).json({msg:"toDo completed successfully"})
    }
});


//Make sure DB connection is established before you start your http server and testing API's  
async function startServer(){
    
    const PORT = process.env.PORT || 3000;

    try{

        await mongoose.connect(process.env.MONGO_URI);
        console.log("-----DB Connection is established-----");
        app.listen(PORT,()=>console.log(`App server Started on ${PORT}`));

    }catch(error){
        console.error("Failed to Connect to Mongo DB:", error.message);
        process.exit(1);
    }
}

startServer();

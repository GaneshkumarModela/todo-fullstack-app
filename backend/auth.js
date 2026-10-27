/*********************************Authentication logic goes here*******************************/

//When user is hitting the Protected end point ,
//request first hit this middleware and validates the user

const jwt = require("jsonwebtoken");
const JWT_KEY = process.env.JWT_KEY;

function authenticateToken(req, res, next){

    const token = req.headers.token;
    if(!token)  return res.status(409).json({msg:"token missing"});

    try{
        //If incorrect token is passed, this line will throw an exception
        const decodedInfo = jwt.verify(token,JWT_KEY);
        req.userId = decodedInfo.userId;
        console.log("userId:"+req.userId);
        next();

    }catch(error){

        console.error("invalid token:", error.message);
        return res.status(404).json({msg:"invalid token"});
    }
}

module.exports = {
    authenticateToken,   
}
const jwt = require('jsonwebtoken');
const redisClient = require('../config/redis');
const User = require('../models/user')

const userMiddleware = async(req, res,next)=>{

    try{ //checking tokin, id,and from id finding the user
        const {token}=req.cookies;
        if(!token)
            throw new Error("token is not present from userMiddlware");

        const payload=jwt.verify(token, process.env.JWT_KEY) //chekcing the token is valid or not
       // console.log("JWT PAYLOAD:", payload);
        const {_id}=payload;
        if(!_id){
            throw new Error ("Id is not present ,from userMiddlware invalid token")
        }
        const result= await User.findById(_id);

        if(!result){
            throw new Error("user doesn't exist from userMiddlware")
        }

        //now check is token preent in my blocklist (redis store kar raha blocked token)
        const IsBlocked = await redisClient.exists(`token:${token}`);
        if (IsBlocked) {
            return res.status(401).send("Token is blacklisted");
        }

        req.result=result; 

        next();

    }
    catch(err){
            res.status(401).send("error from userMiddleware.js file : "+err)
    }
}

module.exports=userMiddleware;
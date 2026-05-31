const jwt = require('jsonwebtoken');
const redisClient = require('../config/redis');
const User = require('../models/user')

const adminMiddleware = async(req, res,next)=>{

    try{ //checking tokin, id,and from id finding the user
        const {token}=req.cookies;
        if(!token)
            throw new Error("token is not present ,error from admin Middlware");

        const payload=jwt.verify(token, process.env.JWT_KEY) //chekcing the token is valid or not
       // console.log("JWT PAYLOAD:", payload);
        const {_id}=payload;
        if(!_id){
            throw new Error ("Id is not present , invalid token")
        }
        const result= await User.findById(_id);
        //chekc that he is admin or not, agar ye admin hoga tabhi to kisi ko admin banayega
        if(payload.role!='admin')
            throw new Error('invalid token, errror fomr adminMIddleware, he is not admin ')

        if(!result){
            throw new Error("user doesn't exist as admin")
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

module.exports=adminMiddleware;
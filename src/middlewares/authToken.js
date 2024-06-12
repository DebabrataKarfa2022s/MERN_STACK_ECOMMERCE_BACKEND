import jwt from "jsonwebtoken"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/apiResponse.js"
import e from "express"
 const authToken=asyncHandler(async(req,res,next)=>{
     try {
        const token=req.cookies?.token
        console.log(token);
        if(!token){
            throw new ApiError(401,"please login first")
        }

        jwt.verify(token,process.env.TOKEN_SECRET_KEY,(err,decoded)=>{
            
            if(err){
                console.log("invalid token",err);
            }
            req.userId=decoded?._id
            next();
        })
     } catch (error) {
       res.status(400).json({
           success:false,
           message:error.message || error,
           data:[],
           error:true       
       }) 
     }
 })

export {authToken};
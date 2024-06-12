import { Schema } from "mongoose";
import mongoose from "mongoose";

const UserSchema= new Schema({
    name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true
    },
    password:{
        type:String,
        required:[true,"Password is required"]
    },
    profilePic:{
        type:String,
        default:""
        
    },
    role:{
        type:String,
        default:"user"
    }
},{timestamps:true})

export const UserModel=mongoose.model("UserModel",UserSchema);
import mongoose, {Schema} from "mongoose";

const addToCart= new Schema({

    productId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Product"
    },
    quantity:{
        type:Number,
        required:true
    },
    userId:{
        type:String
    }
    
},{timestamps:true})

export const addToCartModel=mongoose.model("addToCart",addToCart)
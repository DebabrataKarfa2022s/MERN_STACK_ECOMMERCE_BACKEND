import mongoose, {Schema} from "mongoose";

const ProductSchema= new Schema({
    productName:{
        type:String,
        required:true
    },
    brandName:{
        type:String,
        required:true
    },
    category:{
        type:String,
        required:true
    },
    productImage:[],
    description:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    sellingPrice:{
        type:Number,
        required:true
    }
},{timestamps:true})

export const ProductModel= mongoose.model("Product",ProductSchema);

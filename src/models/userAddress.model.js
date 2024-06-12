import mongoose,{Schema} from "mongoose";

const userAddressSchema= new Schema({

    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"UserModel"
    },
    fullName : {
        type:String,
        required:true
    },
    email: {
        type:String,
        required:true
    },
    streetAddress:{
        type:String,
        required:true
    },
    city:{
        type:String,
        required:true
    },
    state:{
        type:String,
        required:true
    },
    zipCode:{
        type:String,
        required:true
    },
    phoneNumber:{
        type:String,
        required:true
    }

},{timestamps:true})

export const UserAddressModel=mongoose.model("UserAddressModel",userAddressSchema)
import {ApiError} from "../utils/apiError.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiResponse } from "../utils/apiResponse.js"
import { UserModel } from "../models/users.model.js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { addToCartModel } from "../models/cartProduct.model.js"
import nodemailer from "nodemailer"
// import nodemailer from 'nodemailer';
import { UserAddressModel } from "../models/userAddress.model.js"
import { OrderModel } from "../models/order.model.js"
import Razorpay from "razorpay"
import {randomBytes, createHmac} from "crypto"
import crypto from 'crypto';

const razorpayInstance= new Razorpay({
    key_id:process.env.RAZORPAY_KEY_ID,
    key_secret:process.env.RAZORPAY_KEY_SECRET
})

const registerUser = asyncHandler(async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if ([name, email, password].some(field => field?.trim() === "")) {
            throw new ApiError(400, "All fields are required");
        }

        const existingUser = await UserModel.findOne({
            $or: [{ name }, { email }]
        });

        if (existingUser) {
            throw new ApiError(409, "This account already exists");
        }

        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(password, salt);

        const userPayload = {
            ...req.body,
            role: "GENERAL",
            password: hashedPassword
        };

        const newUser = new UserModel(userPayload);
        const savedUser = await newUser.save();

        const createdUser = await UserModel.findById(savedUser._id).select("-password");

        if (!createdUser) {
            throw new ApiError(500, "Something went wrong while registering the user");
        }

        return res.status(201).json(
            new ApiResponse(201, createdUser, "User registered successfully")
        );
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message || "Internal Server Error",
            error: true,
            success: false
        });
    }
});

const loginUser=asyncHandler(async(req,res)=>{

   try {
     const {email,password}=req.body;
     if(
         [email,password].some((field)=>field?.trim()==="")){
             throw new ApiError(400, "all fields are required")
         }
 
     const user= await UserModel.findOne({email});
 
     if(!user){
         throw new ApiError(404,"user not found")
     }
 
     const checkPassword= await bcrypt.compare(password,user.password);
 
     if(!checkPassword){
         throw new ApiError(400,"wrong password")
     }
 
     if(checkPassword){
         const tokenData={
             _id:user._id,
             email:user.email,
         }
     
     const token=  jwt.sign(tokenData,process.env.TOKEN_SECRET_KEY,{
         expiresIn:"1d"
     })
 
     const tokenOption={
         httpOnly:true,
         secure:true
     }
 
     res.cookie("token",token,tokenOption).status(200).json(
         new ApiResponse(200,token,"user login successfully done")
     )
    }
   } catch (error) {
    res.json({
        message:error.message || "please check your password and email",
        error:true,
        sucess:false
    })
   }
})

const userDetails=asyncHandler(async(req,res)=>{

   try {
    console.log("req.userId = ",req.userId);
     const user= await UserModel.findById(req.userId).select("-password");
     res.status(200).json(
         new ApiResponse(200,user,"user details")
     )
     console.log("current user : ",user);
    }
    catch (error) {
        res.json({
            message:error.message || error,
            error:true,
            sucess:false
        })
    }
})

const logOutUser=asyncHandler(async(req,res)=>{
    try {
        res.clearCookie("token");
        res.status(200).json(
            new ApiResponse(200,null,"logOut sucessfull")
        )
    } catch (error) {
        throw new ApiError(400,error?.message || "logOut not sucessfull ")
    }
})

const updateUser=asyncHandler(async(req,res)=>{
    try {
        const sessionUser=req.userId
        const {userId, email, name, role}=req.body;
        const payload={
            ...(email && {email:email}),
            ...(name && {name:name}),
            ...(role && {role:role})
        }
        const user= await UserModel.findById(
            sessionUser
        )
        const updateUser= await UserModel.findByIdAndUpdate(
            userId,
            payload
        )

        res.status(200).json(
            new ApiResponse(200,updateUser,"user update sucessfull")
        )
    } catch (error) {
        throw new ApiError(400,error?.message || "update not sucessfull ")
        
    }
})

const allUsers=asyncHandler(async(req,res)=>{
    try {
        const alluser= await UserModel.find().select("-password");
        res.status(200).json(
            new ApiResponse(200,alluser,"all user fetched sucessfull")
        )
    } catch (error) {
        throw new ApiError(400,error?.message || "user not fetched sucessfull ")
        
    }
})

const updateAddToCartProduct=asyncHandler(async(req,res)=>{

    try {
        const currentUserId=req.userId;
        const addToCartProductId=req?.body?._id;
        const quantity=req?.body?.quantity;
        const updateCartProduct= await addToCartModel.findOneAndUpdate({_id:addToCartProductId},{
            ...(quantity && {quantity:quantity})
        })

        res.status(200).json(
            new ApiResponse(200,updateCartProduct,"cart product update sucessfull")
        )
    } catch (error) {
        throw new ApiError(400,error?.message || "cart product not update sucessfull ")
    }
})

const deleteAddToCartProduct=asyncHandler(async(req,res)=>{
    try {
        const currentUserId=req.userId;
        const deleteCartProductId=req?.body?._id;

        const deleteCartProduct= await addToCartModel.deleteOne({_id:deleteCartProductId})

        res.status(200).json(
            new ApiResponse(200,deleteCartProduct,"cart product delete sucessfull")
        )


    } catch (error) {
        throw new ApiError(400,error?.message || "cart product not deleted ")
        
    }
})


const countAddToCartProduct=asyncHandler(async(req,res)=>{
    try {
        const userId=req.userId;
        const  count=await addToCartModel.countDocuments({userId:userId})

        res.status(200).json(
            new ApiResponse(200,count,"cart product count fetched sucessfull")
        )
    } catch (error) {
        throw new ApiError(400,error?.message || "cart product  count not fetched ")
    }
})

const addToCartViewProduct=asyncHandler(async(req,res)=>{
    try {
        const currentUser=req?.userId;
        const allProduct=await addToCartModel.find({userId:currentUser}).populate("productId")

        res.status(200).json(
            new ApiResponse(200,allProduct,"all cart product fetched sucessfull")
        )
    } catch (error) {
        throw new ApiError(400, error )
        // "cart product not fetched for view"
        
    }
})

const addToCartController=asyncHandler(async(req,res)=>{
    try {
        const {productId}=req.body;
        const currentUser=req.userId;

        const isProductAvailable=await addToCartModel.findOne({productId})
        // console.log("isproductavailable",isProductAvailable);
        if(isProductAvailable){
            return res.json({
                message:"product already added in cart",
                success:false,
                error:true
            })
        }


        const payload={
            productId:productId,
            quantity:1,
            userId:currentUser
        }

        const newAddToCart= new addToCartModel(payload);
        const saveAddToCart=await newAddToCart.save();

        res.status(200).json(
            new ApiResponse(200,saveAddToCart,"cart product added sucessfull")
        )
    } catch (error) {
        throw new ApiError(400,error?.message || "cart product not added ")
        
    }
})

const forgotPassword = asyncHandler(async (req, res) => {
    try {
        const { email } = req.body;
        if(email===""){
            return res.status(400).json({
                message:"please enter email",
                success:false,
                error:true
            })
        }

        // console.log(`Received forgot password request for email: ${email}`);

        const user = await UserModel.findOne({ email });
        // console.log(user.name);
        if (!user) {
            // console.error(`Email not found: ${email}`);
            // throw new ApiError(404, "Email not found");
            return res.status(404).json({
                message:"Email not found",
                success:false,
                error:true
            })
        }

        const payload = { _id: user._id };
        const token = jwt.sign(payload, process.env.TOKEN_SECRET_KEY, { expiresIn: "10m" });

        const resetLink=`http://localhost:5173/reset-password/${user._id}/${token}`
        const userName=user.name

        const transporter = nodemailer.createTransport({
            service: "gmail",
            host: "smtp.ethereal.email",
            port: 587,
            secure: false, 
            auth: {
                user: process.env.MAIL_USERNAME,
                pass: process.env.MAIL_PASSWORD
            }
        });

        const mailOptions = {
            from:{
                name:"dk-Ecommerce",
                address:process.env.MAIL_USERNAME
            },
            to: email,
            subject: "Forgot Password",
            // text: `Hello ${userName},

            // You have requested to reset your password. Please click on the link below to reset your password:
            // ${resetLink}

            // If you did not request a password reset, please ignore this email.

            // Thank you,
            // dk-ecommerce`,
            html: `
            <p>Hello ${userName},</p>
            <p>You have requested to reset your password. Please click on the link below to reset your password:</p>
            ${resetLink}
            <p>If you did not request a password reset, please ignore this email.</p>
            <p>Thank you,<br>dk-ecommerce</p>
    `
        };

         transporter.sendMail(mailOptions);

        res.status(200).json(
            new ApiResponse(200, mailOptions, "Reset password link sent on your email please check")
        );
    } catch (error) {
        // console.error(`Error in forgotPassword function: ${error.message}`);
        throw new ApiError(400, error?.message || "Link not sent");
    }
});


const resetPassword = asyncHandler(async (req, res) => {
    try {
        const { password } = req.body;
        const { id, token } = req.params;

        // Generate salt and hash the new password
        const salt = bcrypt.genSaltSync(10);
        const hashPassword = bcrypt.hashSync(password, salt);

        // Find the user by ID
        const user = await UserModel.findOne({ _id: id });
        if (!user) {
            throw new ApiError(404, "User not found");
        }

        // Verify the token
        let payload;
        try {
            payload = jwt.verify(token, process.env.TOKEN_SECRET_KEY);
        } catch (err) {
            throw new ApiError(400, "Invalid or expired token");
        }

        // Ensure the token payload ID matches the user ID
        if (payload._id !== id) {
            throw new ApiError(400, "Invalid token");
        }

        // Update the user's password and return the updated user document
        const updateUser = await UserModel.findByIdAndUpdate(id, { password: hashPassword }, { new: true });

        // Respond with a success message
        res.status(200).json(new ApiResponse(200, updateUser, "Password update successful"));
    } catch (error) {
        // Properly handle and send the error response
        res.status(400).json(new ApiError(400, error?.message || "Password not updated"));
    }
});

const saveAddress= asyncHandler(async(req,res)=>{
    
    try {
        const {fullName, email,streetAddress,city, state,zipCode,phoneNumber}=req.body;
        const userId=req.userId;
        // console.log("userid=",userId)

        if ([fullName, email, streetAddress, city, state, zipCode, phoneNumber].some(field => typeof field === 'string' && field.trim() === "")) {
            throw new ApiError(400, "All fields are required");
        }

        const payload={
            userId:userId,
            ...(fullName && {fullName:fullName}),
            ...(email && {email:email}),
            ...(streetAddress && {streetAddress:streetAddress}),
            ...(city && {city:city}),
            ...(state && {state:state}),
            ...(zipCode && {zipCode:zipCode}),
            ...(phoneNumber && {phoneNumber:phoneNumber})
        }
        const saveAddress= await UserAddressModel(payload).save();
        res.status(200).json(
            new ApiResponse(200,saveAddress,"address added sucessfull")
        )
    } catch (error) {
        
         throw new ApiError(400,error?.message || "problem when saved address")
        
    }
})

const createOrder= asyncHandler(async(req,res)=>{
    try {
        const { orderItems, shippingAddress, paymentMethod, itemsPrice, shippingPrice, totalPrice,
             isPaid, paidAt, razorpay} = req.body;

    if (orderItems && orderItems.length === 0) {
        res.status(400).json({ message: 'No order items' });
        return;
    }

    const order = new OrderModel({
        user: req.userId,
        orderItems,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        shippingPrice,
        totalPrice,
        isPaid,
        paidAt,
        razorpay
    });

    const createdOrder = await order.save();
    
    res.status(201).json(
        new ApiResponse(201, createdOrder, "Order created successfull")
    );
    } catch (error) {
        res.status(400).json(
            new ApiError(400, error?.message || "order not created")
        )
    }
})

const userOrders= asyncHandler(async(req,res)=>{
    const userId= req.userId
    console.log(userId);
    try {
        const userOrderData = await OrderModel.find({user:userId});
        if (!userOrderData || userOrderData.length === 0) {
            throw new ApiError(404, "Order not found");
        }

        res.status(200).json(
            new ApiResponse(200, userOrderData, " user Order fetched successfully")
        )
    } catch (error) {
        res.status(400).json(
            new ApiError(400,  "order not fetched or first create an order")
        )
    }

})

const allOrders= asyncHandler(async(req,res)=>{
    try {
        const allOrder= await OrderModel.find();
        if (!allOrder || allOrder.length === 0) {
            throw new ApiError(404, "Order not found");
        }
        res.status(200).json(
            new ApiResponse(200, allOrder, " successfully fetched all order")
        )
    } catch (error) {
        res.status(400).json(
            new ApiError(400, error?.message || "order not fetched or first create an order in all order")
        )
    }
})

const updateOrder = asyncHandler(async (req, res) => {
    try {
        const { deliveryStatus, isPaid, orderId } = req.body;
        console.log(deliveryStatus,isPaid, orderId)

        // if (!orderId || typeof isPaid === 'undefined' || !deliveryStatus) {
        //     throw new ApiError(400, "Missing required fields");
        // }

        const updatedOrder = await OrderModel.findByIdAndUpdate(
            orderId,
            { isPaid, deliveryStatus },
            { new: true }
        );

        if (!updatedOrder) {
            throw new ApiError(404, "Order not found");
        }

        res.status(200).json(
            new ApiResponse(200, updatedOrder, "Order updated successfully")
        );
    } catch (error) {
        res.status(400).json(
            new ApiError(400, error?.message || "Order not updated")
        );
    }
});

const deleteOrder= asyncHandler(async(req,res)=>{
    try {
        const {orderId}=req.body
        const deleteOrder= await OrderModel.findByIdAndDelete(orderId)
        if (!deleteOrder) {
            throw new ApiError(404, "Order not found");
        }
        res.status(200).json(
            new ApiResponse(200, deleteOrder, "order deleted successfully")
        )
    } catch (error) {
        res.status(400).json(
            new ApiError(400, error?.message || "order not deleted")
        )
    }
})

const createRazorpayOrder= asyncHandler(async(req,res)=>{
    try {
        const {amount} =req.body

        const options={
            amount:amount * 100,
            currency: 'INR',
            receipt: randomBytes(10).toString('hex'),
        }

        const order= await razorpayInstance.orders.create(options)

        if(!order){
            return res.status(500).json(
                new ApiError(500, "some internal server error while create rozarpay")
            )
        }
        console.log("ordre from create payment controller",order);

        res.status(201).json(
            new ApiResponse(201, order, "razorpay order created successfully")
        )
    } catch (error) {
        res.status(400).json(
            new ApiError(400, error?.message || "razorpay order not created")
        )
    }
})

// const verifyRazorpayPayment= asyncHandler(async(req,res)=>{
//     try {
//         const {order_id, payment_id, razorpay_signature}=req.body;
//         // const {userOrderId}=req.params
//         // console.log("usreOrderId", userOrderId)

//         const shasum= createHmac('sha256',process.env.RAZORPAY_KEY_SECRET);

//         // shasum.update(`${order_id} | ${payment_id}`);
//         shasum.update(order_id + "|" + payment_id);
//         const digest= shasum.digest('hex');

//         if(digest === razorpay_signature){

//             // const order= await OrderModel.findById(req.params.id);
//             // console.log("verify order", order)

//             // if(!order){
//             //     return res.status(404).json(
//             //         new ApiError(404, "order not found")
//             //         )
//             // }
            
//             // order.isPaid=true;
//             // order.paidAt=Date.now();
//             // order.razorpay={
//             //     orderId:order_id,
//             //     paymentId:payment_id,
//             //     signature:razorpay_signature
//             // };

//             // await order.save();

//             res.status(200).json(
//                 new ApiResponse(200, "payment verified successfully")
//             )
//         }
//         else{
//             throw new ApiError(400, "Invalid signature")
//         }

//     } catch (error) {
//         new ApiError(400, error?.message || "razorpay verification failed")
//     }
// })

const verifyRazorpayPayment=asyncHandler(async(req,res)=>{
    const {order_id, payment_id, razorpay_signature}=req.body;
    try {
        const body = `${order_id}|${payment_id}`;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');
        
        console.log("server signature", expectedSignature);
        console.log("razorpay signature", razorpay_signature);

  if (expectedSignature === razorpay_signature) {
    // Payment is verified
    res.json({ message: 'payment verified successfully' });
  } else {
    res.status(400).json({ message: 'payment verification failed in server' });
  }
    } catch (error) {
        res.status(400).json(
            new ApiError(400, error?.message || "razorpay verification failed")
        )
    }
})
export {registerUser,loginUser,userDetails, logOutUser,updateUser,allUsers,updateAddToCartProduct,deleteAddToCartProduct,countAddToCartProduct,addToCartViewProduct,addToCartController,forgotPassword,resetPassword,saveAddress,createOrder, userOrders, allOrders,updateOrder,deleteOrder, createRazorpayOrder, verifyRazorpayPayment}
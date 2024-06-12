import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "UserModel",
            required: true,
        },
        orderItems: [
            {
                productId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product",
                    required: true,
                },
                quantity: { 
                    type: Number, 
                    required: true
                },
            },
        ],
        shippingAddress: {
            fullName: {
                 type: String, 
                 required: true
            },
            email: { 
                type: String, 
                required: true 
            },
            streetAddress: { 
                type: String, 
                required: true 
            },
            city: { 
                type: String, 
                required: true 
            },
            state: { 
                type: String, 
                required: true 
            },
            zipCode: { 
                type: String, 
                required: true 
            },
            phoneNumber: { 
                type: String, 
                required: true 
            },
        },
        paymentMethod: { 
            type: String, 
            required: true 
        },
        itemsPrice: { 
            type: Number, 
            required: true 
        },
        shippingPrice: { 
            type: Number, 
            required: true 
        },
        totalPrice: { 
            type: Number, 
            required: true 
        },
        isPaid: { 
            type: Boolean, 
            required:true,
            default: false 
        },
        paidAt: { 
            type: Date 
        },
        deliveryStatus:{
            type:String,
            default:"Pending"
        },
        razorpay: {
            orderId: String,
            paymentId: String,
            signature: String,
          }
    },
    { timestamps: true }
);

export const OrderModel = mongoose.model("Order", orderSchema);

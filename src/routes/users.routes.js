import { Router } from "express";
import { registerUser ,
    loginUser,
    userDetails,
    logOutUser,
    updateUser,
    allUsers,
    updateAddToCartProduct,
    deleteAddToCartProduct,
    countAddToCartProduct,
    addToCartViewProduct,
    addToCartController,
    forgotPassword,
    resetPassword,
    saveAddress,
    createOrder,
    userOrders,
    allOrders,
    createRazorpayOrder,
    verifyRazorpayPayment,
    updateOrder,
    deleteOrder
}
 from "../controllers/users.controllers.js";
import { authToken } from "../middlewares/authToken.js";



const router=Router();

router.route("/signup").post(registerUser)
router.route("/signin").post(loginUser)
router.route("/user-details").get(authToken,userDetails)
router.route("/userLogout").get(authToken,logOutUser)
router.route("/forgot-password").post(forgotPassword)
router.route("/reset-password/:id/:token").post(resetPassword)
router.route("/save-address").post(authToken,saveAddress)
router.route("/create-order").post(authToken,createOrder)
router.route("/user-orders").get(authToken, userOrders)
router.route("/delete-order").post(authToken,deleteOrder)

// payment section 
router.route("/create-payment").post(authToken, createRazorpayOrder )
router.route("/verify-payment").post(authToken, verifyRazorpayPayment )

// admin panel 

router.route("/update-user").post(authToken,updateUser)
router.route("/all-user").get(authToken,allUsers)
router.route("/all-orders").get(authToken,allOrders)
router.route("/update-order").post(authToken, updateOrder)

// user add to cart

router.route("/update-cart-product").post(authToken,updateAddToCartProduct)

router.route("/delete-cart-product").post(authToken,deleteAddToCartProduct)

router.route("/countAddToCartProduct").get(authToken,countAddToCartProduct)

router.route("/view-card-product").get(authToken,addToCartViewProduct)

router.route("/addtocart").post(authToken,addToCartController)



export default router;
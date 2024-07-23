import { uploadProductPermission } from "../helpers/permission.js";
import { ProductModel} from "../models/product.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";

const uploadProductController = asyncHandler(async(req,res)=>{
    try {
        const sessionUser=req.userId;
        if(!uploadProductPermission(sessionUser)){
            throw new ApiError(403,"permission denied")
        }
        const uploadProduct= new ProductModel(req.body);
        const saveProduct= await uploadProduct.save();
        res.status(200).json(
            new ApiResponse(200,saveProduct,"product upload sucessfull")
        )
    } catch (error) {
        throw new ApiError(400,error?.message || "product upload not sucessfull ")
    }
})

const updateProductController = asyncHandler(async(req,res)=>{
    try {
        if(!uploadProductPermission(req.userId)){
            throw new ApiError(403,"permission denied")
        }
        const {_id, ...resBody}=req.body;
        const updateProduct= await ProductModel.findByIdAndUpdate(
            _id,
            resBody
        )
       res.status(200).json(
           new ApiResponse(200, updateProduct, "product update sucessfull")
       )
    } catch (error) {
        throw new ApiError(400,error?.message || "product update not sucessfull ")
        
    }
})

const searchProductController = asyncHandler(async(req,res)=>{
    try {
        const query=req.query.q;
        const regx=new RegExp(query,"i","g");
        const searchProduct= await ProductModel.find({
            $or:[
                {productName:regx},
                {category:regx}
            ]
        })

        res.status(200).json(
            new ApiResponse(200,searchProduct,"product search sucessfull")
        )
    } catch (error) {
        throw new ApiError(400,error?.message || "product search not sucessfull ")
        
    }
})

const getProductDetailsController = asyncHandler(async(req,res)=>{
    try {
        const {productId}=req.body;
        const product= await ProductModel.findById(productId);

        res.status(200).json(
            new ApiResponse(200,product,"product details")
        )

    } catch (error) {
        throw new ApiError(400,error?.message || "product details not be fetched ")
        
    }
})

const getProductController=asyncHandler(async(req,res)=>{
    try {
        const allProduct= await ProductModel.find().sort({createdAt:-1});
        res.status(200).json(
            new ApiResponse(200,allProduct,"get all product fetched sucessfull")
        )
    } catch (error) {
        throw new ApiError(400,error?.message || "get product not be fetched ")
        
    }
})

const getCategoryWiseProductController=asyncHandler(async(req,res)=>{
    try {
        const {category}=req.body || req?.query;

        const product = await ProductModel.find({category:category})

        res.status(200).json(
            new ApiResponse(200,product,"category wise product fetched sucessfull")
        )
    } catch (error) {
        throw new ApiError(400,error?.message || "category wise product not be fetched ")
        
    }
})

const getCategoryProductOneController=asyncHandler(async(req,res)=>{
    try {
        const productCategory=await ProductModel.distinct("category");
        // console.log("productCategory",productCategory);

        // array to sotre one product from each category 

        const productByCategory=[];

        for(const category of productCategory){
            const product=await ProductModel.findOne({category:category});

            if(product){
                productByCategory.push(product);
            }
        }

        res.status(200).json(
            new ApiResponse(200,productByCategory,"get category product one fetched sucessfull")
        )
    } catch (error) {
        throw new ApiError(400,error?.message || "get category product one not be fetched ")
        
    }
})

const filterProductController=asyncHandler(async(req,res)=>{
    try {
        const categoryList=req?.body?.category || [];

        const product = await ProductModel.find({
            category:{
                "$in":categoryList
            }
        })

        res.status(200).json(
            new ApiResponse(200,product,"filter product fetched sucessfull")
        )
    } catch (error) {
        throw new ApiError(400,error?.message || "filter product not be fetched ")
        
    }
})
export {uploadProductController,updateProductController,searchProductController,getProductDetailsController,getProductController,getCategoryWiseProductController,getCategoryProductOneController,filterProductController}
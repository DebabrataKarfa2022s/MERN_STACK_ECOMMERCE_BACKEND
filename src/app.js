import  express  from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app=express();

app.use(cors({
    origin:'https://6677cb117ffbc44b51e235e6--playful-sundae-fdcd92.netlify.app',
    // Credential:true,
    // optionsSuccessStatus: 200,
    methods:'GET, HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders:['Content-Type', 'Authorization'],
}));

app.use(express.json({limit:"16kb"}));
app.use(express.urlencoded({extended:true, limit:"16kb"}));
app.use(express.static("public"));
app.use(cookieParser());

// routes import 
import userRouter from "./routes/users.routes.js"
import productRouter from "./routes/product.routes.js"
// routes declaration 
app.use("/api/v1/users", userRouter);
app.use("/api/v1/products", productRouter);

// http://localhost:8080/api/v1/users/register
// http://localhost:8080/api/v1/products/upload-product
export  {app};

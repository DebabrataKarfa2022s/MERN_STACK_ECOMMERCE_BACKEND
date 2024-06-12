import { UserModel } from "../models/users.model.js";

const uploadProductPermission = async (userId) => {

    const user = await UserModel.findById(userId);
    if(user.role === "ADMIN"){
        return true;
    }
    return false
}

export {uploadProductPermission}
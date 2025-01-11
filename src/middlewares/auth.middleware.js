import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js"
import { apiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Middleware to verify JWT, fetch user details, and attach the user to the request if valid.

export const verifyJWT = asyncHandler(async (req, _, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
    
        if(!token){
            throw new apiError(401, "Unauthorized request! Token not available!");
        }
    
        const decodedInfo = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    
        const user = await User.findById(decodedInfo?._id).select("-password -refreshToken");
    
        if(!user){
            throw new apiError(401, "Invalid access token!");
        }
    
        req.user = user;
        next();

    } catch (error) {
        throw new apiError(401, error?.message || "Something went wrong while verifying JWT");
    }
});

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

/* req.user: data send by this middleware to next()

{
    "_id": "67861037e4c52683805c1eac",
    "username": "johndoe",
    "email": "j@jd.com",
    "fullName": "John Doe",
    "avatar": "https://res.cloudinary.com/dijkastra-cloud/image/upload/v1736840645/i1m6zq1naw7qyy02t7p6.png",
    "avatarPublicId": "i1m6zs1naertlx02t7p6",
    "coverImage": "https://res.cloudinary.com/dijkastra-cloud/image/upload/v1736839222/casoxghaqkds65osmrwz.png",
    "coverImagePublicId": "casoxqoafugs65osmrwz",
    "watchHistory": [],
    "createdAt": "2025-01-01T07:20:23.696Z",
    "updatedAt": "2025-01-01T07:52:52.061Z",
    "__v": 0
}
*/

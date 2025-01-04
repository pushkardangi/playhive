// all business logic related to registering user resides in controller

import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { deleteLocalFile } from "../utils/deleteLocalFile.js";

const registerUser = asyncHandler(async (req, res) => {
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res

    const { fullName, username, email, password } = req.body;

    if (
        [fullName, username, email, password].some((field) => {
            field?.trim() === "";
        })
    ) {
        throw new apiError(400, "All fields are required!");
    }

    const avatarLocalPath = req.files?.avatar?.length > 0 ? req.files.avatar[0].path : null;
    const coverImageLocalPath = req.files?.coverImage?.length > 0 ? req.files.coverImage[0].path : null;

    // check if username or email exists in db
    const userExisted = await User.findOne({ $or: [{ username }, { email }] });

    if(userExisted && avatarLocalPath){
        deleteLocalFile(avatarLocalPath);
    }
    if(userExisted && coverImageLocalPath){
        deleteLocalFile(coverImageLocalPath);
    }

    if (userExisted) {
        throw new apiError(409, "User with email or username already exists!");
    }

    if (!avatarLocalPath) {
        deleteLocalFile(coverImageLocalPath);
        throw new apiError(400, "Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = coverImageLocalPath ? await uploadOnCloudinary(coverImageLocalPath) : null;

    const user = await User.create({
        fullName,
        username: username.toLowerCase(),
        email,
        password,
        avatar: avatar.secure_url,
        coverImage: coverImage?.secure_url || null,
    });

    const userCreatedInDB = await User.findById(user._id).select("-password -refreshToken");

    if(!userCreatedInDB){
        throw new apiError(500, "Something went wrong while registering the user!");
    }

    return res.status(201).json(
        new apiResponse(200, userCreatedInDB, "User created successfully.")
    );
});

export { registerUser };

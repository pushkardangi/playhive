// all business logic related user resides in controller

import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { deleteLocalFile } from "../utils/deleteLocalFile.js";

// returns access token and refresh token, save the refresh token in db
const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
        
    } catch (error) {
        throw new apiError(500, "Something went wrong while generating access and refresh token!");
    }
}

const registerUser = asyncHandler(async (req, res) => {
    // get user details from frontend
    // validation - data not empty
    // check for images, if avatar available
    // check if user already exists: username, email
    // upload them to cloudinary: avatar and coverImage
    // create user object - create entry in db
    // check for user creation
    // remove password and refresh token field from response
    // return res

    const { fullName, username, email, password } = req.body;
    const avatarLocalPath = req.files?.avatar?.length > 0 ? req.files.avatar[0].path : null;
    const coverImageLocalPath = req.files?.coverImage?.length > 0 ? req.files.coverImage[0].path : null;

    if (
        [fullName, username, email, password].some((field) => {
            field?.trim() === "";
        })
    ) {
        throw new apiError(400, "All fields are required!");
    }

    if (!avatarLocalPath) {
        deleteLocalFile(coverImageLocalPath);
        throw new apiError(400, "Avatar file is required")
    }

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

    // upload files on cloudinary
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

    // check user is saved in db, remove password and refreshToken from response data
    const userCreatedInDB = await User.findById(user._id).select("-password -refreshToken");

    if(!userCreatedInDB){
        throw new apiError(500, "Something went wrong while registering the user!");
    }

    return res.status(201).json(
        new apiResponse(200, userCreatedInDB, "User created successfully.")
    );
});

const loginUser = asyncHandler(async (req, res) => {
    // todo:
    // get data from the frontend
    // validation - is data valid and complete
    // find the user and check password
    // fetch user data - if user exist
    // generate refresh token and access token
    // send user data and access token in cookie
    // frontend - routes the user to next page.
    
    const {email, username, password} = req.body;

    if (!email && !username) {
        throw new apiError(400, "Username or Email is required!");
    }

    const user = await User.findOne({
        $or: [{ email }, { username }],
    });

    if (!user) {
        throw new apiError(404, "User does not exist!");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new apiError(401, "Invalid user credentials!");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const cookieOptions = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .json(
            new apiResponse(
                200,
                { user: loggedInUser, accessToken, refreshToken },
                "User logged in successfully."
            )
        );
})

const logoutUser = asyncHandler(async (req, res) => {
    // todo:
    // clear refresh token
    // clear the cookies
    // send response

    const loggedInUser = req.user;

    await User.findByIdAndUpdate(
        loggedInUser._id,
        { $set: { refreshToken: null } },
        { new: true }
    );

    const cookieOptions = {
        httpOnly: true,
        secure: true,
    }

    return res
        .status(200)
        .clearCookie("accessToken", cookieOptions)
        .clearCookie("refreshToken", cookieOptions)
        .json(new apiResponse(200, {}, "User logged out."));
});

export { registerUser, loginUser, logoutUser };

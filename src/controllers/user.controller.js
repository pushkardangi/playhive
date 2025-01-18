// all business logic related user resides in controller

import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary, deleteFileOnCloudinary } from "../utils/cloudinary.js";
import { deleteLocalFile } from "../utils/deleteLocalFile.js";
import jwt from "jsonwebtoken";

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
        avatarPublicId: avatar.public_id,
        coverImage: coverImage?.secure_url || null,
        coverImagePublicId: coverImage?.public_id || null,
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

const refreshAccessToken = asyncHandler( async (req, res) => {

    const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if(!incomingRefreshToken){
        throw new apiError(401, "Unauthorized request! No refresh token available!");
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

        const user = await User.findById(decodedToken?._id);

        if(!user){
            throw new apiError(401, "Invalid refresh token!");
        }

        if(incomingRefreshToken !== user.refreshToken){
            throw new apiError(401, "Refresh token doesn't match with the token in DB!");
        }

        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

        const cookieOptions = {
            httpOnly: true,
            secure: true,
        };

        res.status(200)
            .cookie("accessToken", accessToken, cookieOptions)
            .cookie("refreshToken", refreshToken, cookieOptions)
            .json(
                new apiResponse(
                    200,
                    { accessToken, refreshToken },
                    "Got new access token."
                )
            );

    } catch (error) {
        throw new apiError(500, `Error while refreshing access token: ${error}`);
    }

});

const changeCurrentPassword = asyncHandler ( async (req, res) => {

    // todo:
    // get current and new password from the user
    // validate fields for falsy values
    // compare the incoming current password and password in db - bcrypt
    // update the password

    try {
        const {currentPassword, newPassword} = req.body;

        if(!currentPassword || !newPassword){
            throw new apiError(400, "Required fields (current password or new password) are missing!");
        }

        if(newPassword.trim().split("").length < 8){
            throw new apiError(400, "Password length is less than 8! Please choose a strong password!");
        }

        const user = await User.findById(req.user?._id);

        const isCurrentPasswordCorrect = await user.isPasswordCorrect(currentPassword);

        if(!isCurrentPasswordCorrect){
            throw new apiError(400, "Current password is incorrect!");
        }

        user.password = newPassword;

        await user.save({validateBeforeSave: false});

        return res
            .status(200)
            .json(new apiResponse(200, {}, "Password changed successfully."));

    } catch (error) {
        throw new apiError(400, `Error while changing password! ${error.message}`)
    }
});

const getCurrentUser = asyncHandler( async (req, res) => {

    return res
        .status(200)
        .json(
            new apiResponse(200, req.user, "Current user fetched successfully.")
        );
});

const updateUserProfile = asyncHandler (async (req, res) => {

    const { email, fullName } = req.body;

    if(!email || !fullName){
        throw new apiError(400, "Required fields (Email or Full Name) are missing!");
    }

    const user = User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                email,
                fullName,
            },
        },
        { new: true }
    ).select("-password -refreshToken");

    return res
        .status(200)
        .json(new apiResponse(200, user, "User data updated successfully."));
});

const updateAvatar = asyncHandler (async (req, res)=> {

    // todo:
    // get new avatar from the user
    // check if required data is Empty

    try {
        const user = req.user;

        const avatarLocalPath = req.file?.path?.length > 0 ? req.file.path : null;

        if (!avatarLocalPath) {
            throw new apiError(400, "Avatar file is missing!");
        }

        // delete the old avatar from cloudinary, if available

        if (user.avatarPublicId) {
            await deleteFileOnCloudinary(user.avatarPublicId);
        }

        // upload and save the new avatar

        const newAvatar = await uploadOnCloudinary(avatarLocalPath);

        if(!newAvatar){
            throw new apiError(400, "Error while uploading avatar on cloudinary!");
        }

        user.avatar = newAvatar.secure_url;
        user.avatarPublicId = newAvatar.public_id;

        user.save({validateBeforeSave: false});

        return res
            .status(200)
            .json(new apiResponse(200, user, "Avatar updated successfully."));

    } catch (error) {
        throw new apiError(400, `Error while updating avatar: ${error}`)
    }
});

const updateCoverImage = asyncHandler (async (req, res)=> {

    try {
        const user = req.user;

        const coverImageLocalPath = req.file?.path?.length > 0 ? req.file.path : null;

        if (!coverImageLocalPath) {
            throw new apiError(400, "Cover Image file is missing!");
        }

        // delete the old cover image from cloudinary, if available

        if (user.coverImagePublicId) {
            await deleteFileOnCloudinary(user.coverImagePublicId);
        }

        // upload and save the new cover image

        const newCoverImage = await uploadOnCloudinary(coverImageLocalPath);

        if(!newCoverImage){
            throw new apiError(400, "Error while uploading cover image on cloudinary!");
        }

        user.coverImage = newCoverImage.secure_url;
        user.coverImagePublicId = newCoverImage.public_id;

        user.save({validateBeforeSave: false});

        return res
            .status(200)
            .json(new apiResponse(200, user, "Cover Image updated successfully."));

    } catch (error) {
        throw new apiError(400, `Error while updating Cover Image: ${error}`)
    }
});

const getChannelProfile = asyncHandler(async (req, res) => {

    let { username } = req.params;

    username = username?.trim().toLowerCase();

    if(!username){
        throw new apiError(400, "Username is missing!")
    }

    const channel = await User.aggregate([
        {
            $match: {
                username: username
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribedBy"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields: {
                subscribedByCount: {
                    $size: "$subscribedBy"
                },
                subscribedToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond: {
                        if: {
                            $in: [req.user?._id, "$subscribedBy.subscriber"]
                        },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                username: 1,
                fullName: 1,
                avatar: 1,
                coverImage: 1,
                email: 1,
                subscribedByCount: 1,
                subscribedToCount: 1,
                isSubscribed: 1,
            }

        }
    ]);

    // console.log("Channel Data:", channel);

    if(!channel?.length){
        throw new apiError(404, "Channel does not exists!");
    }

    return res
        .status(200)
        .json(
            new apiResponse(200, channel[0], "User channel fetched successfully.")
        );
});

const getWatchHistory = asyncHandler(async (req, res) => {

    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1,
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            owner: {
                                $first: "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ]);

    res.status(200).json(
        new apiResponse(
            200,
            user[0].watchHistory,
            "Watch History fetched successfully."
        )
    );

});

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateUserProfile,
    updateAvatar,
    updateCoverImage,
    getChannelProfile,
    getWatchHistory,
};

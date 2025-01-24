import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary, deleteFileOnCloudinary } from "../utils/cloudinary.js";
import { convertSecondsToTime } from "../utils/secondsToTime.js";
import { convertBytesToMB } from "../utils/byptesToMb.js";

const publishVideo = asyncHandler(async (req, res) => {
    // TODO: get video, upload to cloudinary, create video
    // check availability (user, title, description) and (thumbnail and video local path).
    // upload the video and thumbnail to cloudinary
    // set data into video model and upload
    // send success response

    const user = req.user;
    const { title, description } = req.body;
    const thumbnailLocalPath = req.files?.thumbnail?.length > 0 ? req.files.thumbnail[0].path : null;
    const videoFileLocalPath = req.files?.videoFile?.length > 0 ? req.files.videoFile[0].path : null;

    if(!user || !title || !description || !thumbnailLocalPath || !videoFileLocalPath){
        throw new apiError(400, "Required fields (user, title, description, thumbnail and video file) are missing!");
    }

    try {
        const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
        const videoFile = await uploadOnCloudinary(videoFileLocalPath);

        if (!thumbnail || !videoFile) {
            throw new apiError(500, "Video and Thumbnail upload failed on Cloudinary!");
        }

        const duration = convertSecondsToTime(videoFile.duration);
        const size = convertBytesToMB(videoFile.bytes);

        const video = await Video.create({
            videoFile: videoFile.secure_url,
            thumbnail: thumbnail.secure_url,
            owner: user._id,
            title,
            description,
            duration,
            size,
        });

        if (!video) {
            throw new apiError(500, "Unable to save data!");
        }

        res.status(201).json(
            new apiResponse(201, video, "Video Uploaded Successfully.")
        );
    } catch (error) {
        throw new apiError(500, `Error while publishing video: ${error}`);
    }
});

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
    //TODO: get all videos based on query, sort, pagination
});

const getVideoById = asyncHandler(async (req, res) => {
    //TODO: get video by id
    // get video id from the request
    // find the video
    // check isPublished
    // send the data

    const { videoId } = req.params;
    const user = req.user;

    try {
        if (!videoId) {
            throw new apiError(400, "Required fields (VideoId) is missing!");
        }

        const video = await Video.findById(videoId).select("-_id");

        if (!video) {
            throw new apiError(400, "Video is not found!");
        }
        if (!video?.isPublished) {
            throw new apiError(400, "Video is Hidden by the owner!");
        }

        const owner = await User.findById(video.owner).select("-_id username fullName avatar");

        if (!owner) {
            throw new apiError(404, "Owner information not found.");
        }

        const responseData = {
            ...video._doc,
            owner: { ...owner._doc }
        };

       // Add video to the watch history if it doesn't already exist
        if (!user.watchHistory.includes(videoId)) {
            user.watchHistory.push(videoId);

            const addedInWatchHistory = await user.save({ validateBeforeSave: false });

            if (!addedInWatchHistory) {
                throw new apiError(500, "Failed to add video in watch history!");
            }
        }

        res.status(200).json(
            new apiResponse(
                200,
                responseData,
                "Successfully fetched video."
            )
        );
    } catch (error) {
        throw new apiError(500, `Error while fetching requested Video: ${error?.message}`);
    }
});

const updateVideo = asyncHandler(async (req, res) => {
    //TODO: update video details like title, description, thumbnail
    // get data to update
    // fetch video
    // update it
    // save it
    // successfully updated

    const { videoId } = req?.params;
    const updatedThumbnailLocalPath = req?.file?.path;
    const { title: updatedTitle, description: updatedDescription } = req?.body;

    if (!updatedThumbnailLocalPath && !updatedTitle && !updatedDescription){
        throw new apiError(400, "All required fields are empty. Nothing to update!")
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new apiError(404, "Video not found!");
    }

    if (updatedTitle) video.title = updatedTitle;
    if (updatedDescription) video.description = updatedDescription;

    if (updatedThumbnailLocalPath) {
        const oldThumbnailPublicId = video.thumbnail.split("/").pop().split(".")[0];
        await deleteFileOnCloudinary(oldThumbnailPublicId);

        const newThumbnailOnCloudinary = await uploadOnCloudinary(updatedThumbnailLocalPath);

        if (!newThumbnailOnCloudinary) {
            throw new apiError(500, "Uploading new thumbnail on cloudinary failed!");
        }

        video.thumbnail = newThumbnailOnCloudinary.secure_url;
    }

    const updatedVideo = await video.save({validateBeforeSave: false});

    res
    .status(200)
    .json(new apiResponse(200, updatedVideo, "Video updated successfully."));
});

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    //TODO: delete video
});

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
});

export {
    publishVideo,
    getAllVideos,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
};

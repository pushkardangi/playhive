import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
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
    const { videoId } = req.params;
    //TODO: get video by id
});

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    //TODO: update video details like title, description, thumbnail
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

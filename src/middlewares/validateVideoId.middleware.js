import { apiError } from "../utils/apiError.js";
import { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";

export const validateVideoId = asyncHandler(async (req, _, next) => {
    const { videoId } = req.params;

    if (!videoId) {
        throw new apiError(400, "Video Id is missing!");
    }

    if (!isValidObjectId(videoId)) {
        throw new apiError(400, "Invalid video id!");
    }

    return next();
});

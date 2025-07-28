import { Comment } from "../models/comment.model.js";
import { apiError } from "../utils/ApiError.js";
import { apiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!videoId) {
        throw new apiError(400, "Video ID is required!");
    }

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sort: { createdAt: -1 },
        populate: [
            { path: "commenter", select: "_id name" },
        ],
    };

    const aggregationPipeline = [
        { $match: { video: videoId } },
    ];

    const comments = await Comment.aggregatePaginate(
        Comment.aggregate(aggregationPipeline),
        options
    );

    if (!comments || comments.docs.length === 0) {
        throw new apiError(404, "No comments found for this video!");
    }

    res.status(200).json(new apiResponse(200, comments, "Comments fetched successfully."));
});

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
});

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
});

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
});

export {
  getVideoComments,
  addComment,
  updateComment,
  deleteComment
};
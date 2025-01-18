import mongoose, { Schema } from "mongoose";

const likeSchema = new Schema(
    {
        likedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        video: {
            type: Schema.Types.ObjectId,
            ref: "Video",
        },
        comment: {
            type: Schema.Types.ObjectId,
            ref: "Comment",
        },
        tweet: {
            type: Schema.Types.ObjectId,
            ref: "Tweet",
        },
    },
    { timestamps: true }
);

export const Like = mongoose.model("Like", likeSchema);

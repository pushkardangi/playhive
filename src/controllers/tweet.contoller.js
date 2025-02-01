import { Tweet } from "../models/tweet.model.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    // get data from the user
    // validate for validity and completeness
    // save to db
    // response

    const { tweet } = req?.body;
    const { _id: owner } = req?.user;

    if (!tweet) {
      throw new apiError(400, "Tweet content not available!");
    }

    const tweetSaved = await Tweet.create({tweet, owner});

    if (!tweetSaved) {
      throw new apiError(500, "Failed to save the tweet!");
    }

    res
      .status(200)
      .json(new apiResponse(200, tweetSaved, "Tweet saved successfully."));
});

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
});

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
});

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
});

export {
  createTweet,
  getUserTweets,
  updateTweet,
  deleteTweet
};

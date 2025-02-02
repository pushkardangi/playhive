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

    const tweetSaved = await Tweet.create({ content: tweet, owner });

    if (!tweetSaved) {
      throw new apiError(500, "Failed to save the tweet!");
    }

    res
      .status(200)
      .json(new apiResponse(200, tweetSaved, "Tweet saved successfully."));
});

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const { userid: userId, page = 1, limit = 10 } = req?.query;

    if (!userId) {
      throw new apiError(400, "User Id is missing!");
    }

    const filter = userId ? { owner: userId } : {};

    const tweets = await Tweet.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit));

    if (!tweets) {
      throw new apiError(500, "Failed in fetching tweets!");
    }

    const totalTweets = await Tweet.countDocuments(userId);

    res.status(200).json(
        new apiResponse(
            200,
            {
                tweets,
                hasMoreTweets: totalTweets > page * limit,
            },
            "Tweets fetched successfully."
        )
    );
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

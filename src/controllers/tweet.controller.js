import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    try {
        const { content } = req.body
        if ( !content ){
            throw new ApiError(407, "Please provide tweet content")
        }
    
        const tweet = await Tweet.create({
            owner: req.user?._id,
            content
        })
    
        return res.status(200).json(new ApiResponse(200, tweet, "Tweet is created"))
    } catch (error) {
        throw new ApiError(506, error.message || "Error raised while creating a tweet")
    }
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    try {
        const { userId } = req.params
        if( !isValidObjectId(userId) ){
            throw new ApiError(406, "Please provide a valid ObjectId: userId")
        }

        const tweets = await Tweet.find({ owner: userId})

        return res.status(200).json(new ApiResponse(200, tweets,
            tweets ? "All tweets are fetched successfully" : "There are no tweets created"
        ))
    } catch (error) {
        throw new ApiError(506, error.message || "Error is raised while getting tweets")
    }

})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    try {
        const { content } = req.body
        if( !content ){
            throw new ApiError(407, "Please provide tweet content")
        }

        const { tweetId } = req.params
        if( !isValidObjectId(tweetId) ){
            throw new ApiError(406, "Please provide a valid ObjectId: tweetId")
        }

        const updatedTweet = await Tweet.findByIdAndUpdate(tweetId, { content }, { new: true } )
        if ( !updatedTweet ){
            throw new ApiError(406, "Tweet id is not found. Please provide a valid id")
        }

        return res.status(200).json(new ApiResponse(200, updatedTweet, "Tweet content is updated"))
    } catch (error) {
        throw new ApiError(506, error.message || "Error raised while updating a tweet")
    }
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    try {
        const { tweetId } = req.params
        if( !isValidObjectId(tweetId) ){
            throw new ApiError(406, "Please provide a valid ObjectId: tweetId")
        }
        
        const deleteTweet = await Tweet.findOneAndDelete(tweetId, { new: true })
        if ( !deleteTweet ){
            throw new ApiError(406, "Tweet id is not found. Please provide a valid tweet id")
        }

        const isTweetDeleted = await Tweet.findById(tweetId)
        console.log(isTweetDeleted)
        if ( isTweetDeleted ){
            throw new ApiError(508, "Tweet is not deleted successfully.")
        }

        return res.status(200).json(new ApiResponse(200, deleteTweet, "Tweet is deleted successfully"))
    } catch (error) {
        throw new ApiError(506, error.message || "Error raised while deleting a tweet")
    }
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}

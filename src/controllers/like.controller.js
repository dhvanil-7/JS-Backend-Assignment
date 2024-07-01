import mongoose, {Types, isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleLikes = async(id, userId, toggleType, res) => {
    if ( !isValidObjectId(id) ){
        throw new ApiError(408, `Please provide a valid ObjectId: ${toggleType}Id`)
    }

    const isLiked = await Like.findOne({ [toggleType]: id, likedBy: userId})
    if( isLiked ){
        const disliked = await Like.findByIdAndDelete(isLiked._id)
        return res.status(200).json(new ApiResponse(200, disliked, `${toggleType} is disliked successfully.`))
    }

    const liked = await Like.create({
        likedBy: userId,
        [ toggleType ]: Types.ObjectId.createFromHexString(id)
    })


    return res.status(200).json(new ApiResponse(200, liked, `${toggleType} is liked successfully.`))
}

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    const userId = req.user._id

    // //TODO: toggle like on video
    return toggleLikes(videoId, userId, "video", res)
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    const userId = req.user._id

    //TODO: toggle like on comment
    return toggleLikes(commentId, userId, "comment", res)

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    const userId = req.user._id

    //TODO: toggle like on tweet
    return toggleLikes(tweetId, userId, "tweet", res)
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos

    const likedVideos = await Like.find({ 
        video: {
            $exists: true
        },
        likedBy: req.user?._id
    })

    return res.status(200).json(new ApiResponse(200, likedVideos, "All liked videos are fetched successfully."))
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}
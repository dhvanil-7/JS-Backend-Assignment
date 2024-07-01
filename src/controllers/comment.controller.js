import mongoose, { isValidObjectId } from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {Video} from "../models/video.model.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    if ( ! isValidObjectId(videoId) ){
        throw new ApiError(407, "Please provide a valid ObjectId: videoId")
    }

    const {page = 1, limit = 10} = req.query

    const getComments = await Comment.aggregatePaginate([{
            $match: {
                video: mongoose.Types.ObjectId.createFromHexString(videoId)
            }
        }],
        {
            page,
            limit
        })
    
    return res.status(200).json(new ApiResponse(200, getComments, "Comments are fetched successfully."))
})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const { content } = req.body
    if ( !content ){
        throw new ApiError(400, "Please provide a comment.")
    }

    const { videoId } = req.params
    if ( ! isValidObjectId(videoId) ){
        throw new ApiError(407, "Please provide a valid ObjectId: videoId")
    }

    const doesVideoExist = await Video.findById(videoId)
    if ( !doesVideoExist ){
        throw new ApiError(406, "Video is not found. Please provide a valid video id.")
    }

    const comment = await Comment.create({
        video: videoId,
        content,
        owner: req.user?._id
    })

    const isCommentAdded = await Comment.findById(comment._id)
    if (!isCommentAdded){
        throw new ApiError(408, "Comment is not added successfully.")
    }

    return res.status(200).json(new ApiResponse(200, comment, "Comment is added successfully"))
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const { content } = req.body
    if ( !content ){
        throw new ApiError(400, "Please provide a comment.")
    }

    const { commentId } = req.params
    if ( ! isValidObjectId(commentId) ){
        throw new ApiError(407, "Please provide a valid ObjectId: commentId")
    }

    const updatedComment = await Comment.findByIdAndUpdate(commentId, { content }, { new: true })
    if ( !updatedComment ){
        throw new ApiError(406, "Comment is not found. Please provide a valid comment id.")
    }

    return res.status(200).json(new ApiResponse(200, updatedComment, "Comment is updated successfully"))
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const { commentId } = req.params
    if ( ! isValidObjectId(commentId) ){
        throw new ApiError(407, "Please provide a valid ObjectId: commentId")
    }

    const deletedComment = await Comment.findByIdAndDelete(commentId)
    if ( !deletedComment ){
        throw new ApiError(406, "Comment is not found. Please provide a valid comment id.")
    }

    const isCommentDeleted = await Comment.findById(commentId)
    if ( isCommentDeleted ){
        throw new ApiError(408, "Comment is not deleted successfully.")
    }

    return res.status(200).json(new ApiResponse(200, deletedComment, "Comment is deleted successfully"))
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }

import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {removeFromCloudinary, uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination

    if ( !(["asc", "desc", ""].includes(sortType.toLowerCase()))){
        throw new ApiError(407, "Sort type is not valid.")
    }

    if ( !(["createdAt", "duration", "views", ""].includes(sortBy.toLowerCase()))){
        throw new ApiError(407, "SortBy field is not valid.")
    }

        
    const aggregatedVideos = await Video.aggregatePaginate([
        {
            $match: {
                title: {
                    $regex:new RegExp(query, 'i')
                }
            }
        }
    ],
    {
        page: page,
        limit: limit
    })
    console.log(aggregatedVideos)

    return res.status(200).json(new ApiResponse(200, aggregatedVideos,
        aggregatedVideos.docs.length ? "Videos fetched successfully." : "No videos found."))
})


const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body
    // TODO: get video, upload to cloudinary, create video

    if ( !(title && description) ){
        throw new ApiError(401, "Provide title and description of the video.")
    }

    const videoLocalPath = req.files?.videoFile[0]?.path
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path

    if( !(videoLocalPath && thumbnailLocalPath)){
        throw new ApiError(405, "Please provide video and thumbnail files.")
    }
    
    const videoUpload = await uploadOnCloudinary(videoLocalPath)
    const thumbnailUpload = await uploadOnCloudinary(thumbnailLocalPath)

    const video = await Video.create({
        title,
        description,
        videoFile: videoUpload.url,
        thumbnail: thumbnailUpload.url,
        duration: videoUpload.duration,
        owner: req.user
    })

    const publishedVideo = await Video.findById(video._id).select()

    if( !publishedVideo ){
        throw new ApiError(504, "Something went wrong while publishing the video.")
    }
    
    return res.status(200).json(new ApiResponse(200, publishedVideo, "Video is published successfully."))

})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id

    const video = await Video.findById(videoId).select()

    if (!video){
        throw new ApiError(405, "Video does not exist.")
    }
    
    return res.status(200).json(new ApiResponse(200, video, "Video is found successfully."))

})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

    const { title, description } = req.body

    if( !(title || description) ){
        throw new ApiError(402, "Please provide title or description.")
    }

    const video = await Video.findByIdAndUpdate(videoId, {
        title,
        description
    }, {
        new: true // if true then returns modified document
    })

    if (!video){
        throw new ApiError(405, "Video does not exist.")
    }

    return res.status(200).json(new ApiResponse(200, video, "Video details are updated successfully."))


})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
    const video = await Video.findById(videoId).select()

    if (!video){
        throw new ApiError(406, "Video does not found.")
    }

    const deleteVideo = await Video.findByIdAndDelete(videoId)

    await removeFromCloudinary(video.videoFile, "video")
    await removeFromCloudinary(video.thumbnail, "image")

    return res.status(200).json(new ApiResponse(200, deleteVideo, "Video details are deleted successfully."))

})
 
const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    const video = await Video.findById(videoId).select()

    if (!video){
        throw new ApiError(406, "Video does not found.")
    }
    
    const isTogglePublish = await Video.findByIdAndUpdate(videoId, {
        isPublished: !video.isPublished
    },{ new: true })

    return res.status(200).json(new ApiResponse(200, isTogglePublish, "Publish status is changed."))
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}

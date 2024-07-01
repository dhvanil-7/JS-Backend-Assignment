import mongoose, {Types, isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body
    if ( !(name && description) ){
        throw new ApiError(406, "Please provide playlist name and description.")
    }

    //TODO: create playlist
    const createdPlaylist = await Playlist.create({
        name,
        description,
        owner: req.user?._id
    })

    return res.status(200).json(new ApiResponse(200, createdPlaylist, "Playlist created successfully."))

})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    if ( !isValidObjectId(userId) ){
        throw new ApiError(408, "Please provide a valid ObjectId: userId")
    }
    //TODO: get user playlists
    const userPlaylists = await Playlist.find({ owner: userId })
    if( !userPlaylists ){
        throw new ApiError(402, "Please provide a valid user id.")
    }

    return res.status(200).json(new ApiResponse(200, userPlaylists, "Playlists are fetched successfully."))
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    if ( !isValidObjectId(playlistId) ){
        throw new ApiError(408, "Please provide a valid ObjectId: playlistId")
    }
    //TODO: get playlist by id
    const playlist = await Playlist.findById(playlistId)
    if( !playlist ){
        throw new ApiError(402, "Please provide a valid playlist id.")
    }

    return res.status(200).json(new ApiResponse(200, playlist, "Playlist is fetched successfully."))
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    if ( !isValidObjectId(playlistId) ){
        throw new ApiError(408, "Please provide a valid ObjectId: playlistId")
    }
    if ( !isValidObjectId(videoId) ){
        throw new ApiError(408, "Please provide a valid ObjectId: videoId")
    }

    // TODO: remove video from playlist
    const addedVideo = await Playlist.findByIdAndUpdate(playlistId,
        {
            $addToSet: {
                videos: Types.ObjectId.createFromHexString(videoId)
            }
        },
        {
            new: true
        }
    )
    if ( !addedVideo ){
        throw new ApiError(405, "Playlist is not found. Please provide a valid playlist id.")
    }

    return res.status(200).json(new ApiResponse(200, addedVideo, "Video is added to playlist"))

})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    if ( !isValidObjectId(playlistId) ){
        throw new ApiError(408, "Please provide a valid ObjectId: playlistId")
    }
    if ( !isValidObjectId(videoId) ){
        throw new ApiError(408, "Please provide a valid ObjectId: videoId")
    }
    
    // TODO: remove video from playlist
    const removedVideo = await Playlist.findByIdAndUpdate(playlistId,
        {
            $pull: {
                videos: Types.ObjectId.createFromHexString(videoId)
            }   
        },
        {
            new: true
        }
    )
    if ( !removedVideo ){
        throw new ApiError(405, "Playlist is not found. Please provide a valid playlist id.")
    }

    return res.status(200).json(new ApiResponse(200, removedVideo, "Video is removed from playlist"))
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    if ( !isValidObjectId(playlistId) ){
        throw new ApiError(408, "Please provide a valid ObjectId: playlistId")
    }

    // TODO: delete playlist
    const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId)
    if ( !deletedPlaylist ){
        throw new ApiError(405, "Playlist is not found. Please provide a valid playlist id.")
    }

    const isPlaylistDeleted = await Playlist.findById(playlistId)
    if ( isPlaylistDeleted ){
        throw new ApiError(505, "Playlist is not deleted successfully.")
    }

    return res.status(200).json(new ApiResponse(200, deletedPlaylist, "Playlist is deleted successfully"))

})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    if ( !isValidObjectId(playlistId) ){
        throw new ApiError(408, "Please provide a valid ObjectId: playlistId")
    }

    const {name, description} = req.body
    if ( !(name || description) ){
        throw new ApiError(406, "Please provide playlist name and description.")
    }

    //TODO: update playlist
    const updatedPlaylist = await Playlist.findByIdAndUpdate(playlistId,
        {
            name,
            description
        },
        {
            new: true
        }
    )
    if ( !updatedPlaylist ){
        throw new ApiError(405, "Playlist is not found. Please provide a valid playlist id.")
    }

    return res.status(200).json(new ApiResponse(200, updatedPlaylist, "Playlist details updated successfully."))
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}

import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription

    if(!isValidObjectId(channelId)){
        throw new ApiError(503, "Please provide a valid channel-id.")
    }

    const isChannelSubscribed = await Subscription.findOne({
            channel: channelId,
            subscriber: req.user?._id
    })

    let toggleSubscription;
    if(isChannelSubscribed){
        toggleSubscription = await Subscription.findByIdAndDelete(isChannelSubscribed._id, {new: true})
        console.log(toggleSubscription)
    }
    else {
       toggleSubscription = await Subscription.create({
            subscriber: req.user?._id,
            channel: channelId
        })
    }

    const isSubscribed = await Subscription.findById(toggleSubscription._id)

    return res.status(200).json(new ApiResponse(200, toggleSubscription,
        isSubscribed ? "Channel is subscribed" : "Channel is unsubscribed"))  
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    console.log(channelId)
    const all_subscribers = await Subscription.find({
        channel: channelId
    })

    return res.status(200).json(new ApiResponse(200, all_subscribers, "Subscribers fetched successfully."))
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    if(!subscriberId){
        throw new ApiError(402, "Please provide subscriber id.")
    }

    const subscribedChannels = await Subscription.find({
            subscriber: subscriberId
        })

    return res.status(200).json(new ApiResponse(200, subscribedChannels, "Subscribed channels are fetched successfully."))
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}
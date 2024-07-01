import mongoose, { isValidObjectId } from "mongoose";
import { ApiError } from "../utils/ApiError.js";


const ifIdExists = async(model, _id) => {
    try {
        if( !isValidObjectId(_id) ){
            throw new ApiError(406, "Please provide a valid id")
        }

        const doesIdExist = await model.findById(_id)

        return doesIdExist
    } catch (error) {
        throw new ApiError(503, error.message || "Something went wrong while looking for id.")
    }
}

export { ifIdExists }
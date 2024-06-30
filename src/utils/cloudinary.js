import {v2 as cloudinary} from "cloudinary"
import fs from "fs"
import url from "url";
import path from "path";


cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null
        //upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        // file has been uploaded successfull
        //console.log("file is uploaded on cloudinary ", response.url);
        fs.unlinkSync(localFilePath)
        return response;

    } catch (error) {
        fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload operation got failed
        return null;
    }
}


const removeFromCloudinary = async (fileURL) => {
    try {   
            const parsed_url = url.parse(fileURL)
            let public_id = path.basename(parsed_url.pathname).split(".")[0]

            if (!public_id) {
                throw new ApiError(500, "Public id not found on cloudinary.")
            }
            
            // Destroy file on cloudinary
            const response = await cloudinary.uploader.destroy(public_id)
            return response;
    } catch (error) {
        console.error("Error raised while getting public_id from fileURL.", error)
        throw error
    }
}



export {uploadOnCloudinary, 
    removeFromCloudinary
}
import { v2 as cloudinary } from "cloudinary";
import { deleteLocalFile } from "../utils/deleteLocalFile.js"
import dotenv from "dotenv";
dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) {
            console.warn("No file path provided for Cloudinary upload.");
            return null;
        }

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
        });
        
        deleteLocalFile(localFilePath);
        return response;
    } catch (error) {
        console.log("File upload on cloudinary failed!", error);
        deleteLocalFile(localFilePath);
        return null;
    }
};

const deleteFileOnCloudinary = async (publicId, resourceType="image") => {
    try {
        const result = await cloudinary.uploader.destroy(publicId, {
            resource_type: resourceType, // Explicitly set the resource type
        });                              // important when deleting video files

        if (result.result !== "ok") {
            console.error('Failed to delete file on Cloudinary:', result);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error deleting file on Cloudinary:', error);
        return false;
    }
};

export { uploadOnCloudinary, deleteFileOnCloudinary };

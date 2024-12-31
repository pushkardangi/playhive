import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const deleteLocalFile = (filePath) => {
    try {
        fs.unlinkSync(filePath);
        console.log("Local file deleted successfully:", filePath);
    } catch (error) {
        console.error("Failed to delete local file:", filePath, error);
    }
};

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) {
            console.warn("No file path provided for Cloudinary upload.");
            return null;
        }

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
        });
        console.log("File uploaded on cloudinary", response.url);
        deleteLocalFile(localFilePath);
        return response;
    } catch (error) {
        console.log("File upload on cloudinary failed!", error);
        deleteLocalFile(localFilePath);
        return null;
    }
};

export { uploadOnCloudinary };

import fs from "fs";

const deleteLocalFile = (localFilePath) => {
    try {
        fs.unlinkSync(localFilePath);
    } catch (error) {
        console.error("Failed to delete local file:", localFilePath, error);
    }
};

export { deleteLocalFile };

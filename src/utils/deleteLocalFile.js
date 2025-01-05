import fs from "fs";

const deleteLocalFile = (localFilePath) => {
    try {
        if (localFilePath) {
            fs.unlinkSync(localFilePath);
        } else {
            console.error("Nothing to delete. Filepath provided:", localFilePath);
        }
    } catch (error) {
        console.error("Failed to delete local file:", localFilePath, error);
    }
};

export { deleteLocalFile };

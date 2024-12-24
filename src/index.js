import dotenv from "dotenv";
dotenv.config();

import connectDB from "./db/index.js";

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        await connectDB(); // Handles DB connection and its errors
        app.listen(PORT, () => {
            console.log(`Server is running on port: ${PORT}`);
        });
    } catch (error) {
        console.error("Error starting the server:", error); // Only handle server-related errors here
    }
};

startServer();

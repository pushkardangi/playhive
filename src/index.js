import dotenv from "dotenv";
dotenv.config();

import connectDB from "./db/index.js";
import app from "./app.js";

const PORT = process.env.PORT || 3000;

(async () => {
    try {
        await connectDB(); // Handles DB connection and its errors
        app.listen(PORT, () => {
            console.log(`⚙️  Server is running on port: ${PORT}`);
        });
    } catch (error) {
        console.error("Error starting the server:", error); // handle server-related errors
    }
})();

import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

const corsOptions = {
    origin: process.env.CORS_ORIGIN,
    credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public")); // make files in the public folder accessible via HTTP requests
app.use(cookieParser());

// importing routes
import userRouter from "./routes/user.routes.js";

// declaring routes
// http://localhost:3000/api/v1/users
app.use("/api/v1/users", userRouter);


export default app;

// routes related to users resides in here

import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";

// middlewares
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/register").post(
    upload.fields([
        { name: "avatar", maxCount: 1 },
        { name: "coverImage", maxCount: 1 },
    ]),
    registerUser
);

export default router;

// routes related to users resides in here

import { Router } from "express";
const router = Router();

// controllers
import {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateUserProfile,
    updateAvatar,
    updateCoverImage,
} from "../controllers/user.controller.js";

// middlewares
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

// routes
router.route("/register").post(
    upload.fields([
        { name: "avatar", maxCount: 1 },
        { name: "coverImage", maxCount: 1 },
    ]),
    registerUser
);

router.route("/login").post(loginUser);

// secured routes
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/change-password").post(verifyJWT, changeCurrentPassword);
router.route("/get-user").get(verifyJWT, getCurrentUser);
router.route("/update-profile").post(verifyJWT, updateUserProfile);
router.route("/update-avatar").post(verifyJWT, upload.single("avatar"), updateAvatar);
router.route("/update-cover-image").post(verifyJWT, upload.single("coverImage"), updateCoverImage);

export default router;

// router.route(): Useful for chaining multiple HTTP methods (e.g., GET, POST) for the same route.
// It helps keep related methods organized in one place.

// Single HTTP methods router.get() and router.post(): More concise and preferred when you're only handling one HTTP method
// for a route. It's simpler and cleaner.

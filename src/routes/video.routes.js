import { Router } from "express";
import {
    publishVideo,
    updateVideo,
    getVideoById,
    getAllVideos,
    deleteVideo,
    togglePublishStatus,
} from "../controllers/video.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { validateVideoId } from "../middlewares/validateVideoId.middleware.js";

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router
    .route("/")
    .get(getAllVideos)
    .post(
        upload.fields([
            {
                name: "videoFile",
                maxCount: 1,
            },
            {
                name: "thumbnail",
                maxCount: 1,
            },
        ]),
        publishVideo
    );

router
    .route("/:videoId")
    .get(validateVideoId, getVideoById)
    .delete(validateVideoId, deleteVideo)
    .patch(validateVideoId, upload.single("thumbnail"), updateVideo);

router.route("/toggle/publish/:videoId").patch(validateVideoId, togglePublishStatus);

export default router;

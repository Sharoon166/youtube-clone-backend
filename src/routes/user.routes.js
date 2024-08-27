import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router
    .route("/register")
    .post(
        upload.fields([
            {
                name: "avatar",
                maxCount: 1,
            },
            {
                name: "coverImage",
                maxCount: 1,
            },
        ]),
        registerUser
    )
    .get((req, res) => {
        res.json({
            message: "use POST to register",
        });
    });

export default router;

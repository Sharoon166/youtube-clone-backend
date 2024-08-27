import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";

const router = Router();

router.route("/register").post(registerUser).get((req, res) => {
    res.json({
        message: "use POST to register",
    })
})

export default router;

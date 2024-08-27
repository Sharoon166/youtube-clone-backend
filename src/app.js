import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { JSON_LIMIT } from "./constants.js";
import path from "path";

const app = express();

app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    })
);
app.use(cookieParser());
app.use(express.json({ limit: JSON_LIMIT }));
app.use(
    express.urlencoded({
        extended: true,
        limit: JSON_LIMIT,
    })
);
app.use(express.static("public"));

// importing routes
import userRoute from "./routes/user.routes.js";

// routes declaration
app.use("/api/v1/users", userRoute);

app.get("*", (req, res) => {
    res.sendFile(path.join(path.resolve(),"public/404.html"));
});

export default app;

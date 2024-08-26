import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { JSON_LIMIT } from "./constants.js";

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

app.get("/", (req, res) => {
    res.send("Hello World!");
});

export default app;

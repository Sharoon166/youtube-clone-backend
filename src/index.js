import dotenv from "dotenv";
import connectDB from "./db/index.js";
import app from "./app.js";

dotenv.config({
    path: ".env",
});

connectDB()
    .then(() => {
        app.on("error", (err) => {
            console.log(err);
        });

        app.listen(process.env.PORT, () => {
            console.log(`Server on: http://localhost:${process.env.PORT}`);
        });
    })
    .catch((err) => {
        console.log(err);
    });

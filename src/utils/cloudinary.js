import { v2 as cloudinary } from "cloudinary";
import { unlink } from "fs/promises";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
            folder: "youtube-clone",
        });

        // File successfuly uploaded
        console.log("File uploaded successfully", response.url);

        return response;
    } catch (error) {
        await unlink(localFilePath); // remove locally saved file if upload fails
        return null;
    }
};

export { uploadOnCloudinary };

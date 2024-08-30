import { v2 as cloudinary } from "cloudinary";
import { unlinkSync } from "fs";

const uploadOnCloudinary = async (localFilePath) => {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    try {
        if (!localFilePath) return null;

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
            folder: "youtube-clone",
        });

        // File successfuly uploaded
        console.log("File uploaded successfully", response.url);

        unlinkSync(localFilePath);
        return response;
    } catch (error) {
        console.log(error);
        unlinkSync(localFilePath); // remove locally saved file if upload fails
        return null;
    }
};

export { uploadOnCloudinary };

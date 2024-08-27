import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

/**
 *  Collect user data
 *  Validate the data
 *  Check the email is not already registered
 *  Check Images, avatar and cover Image
 * Upload to cloudinary
 *  Create the user Object
 *  Store it in the DB
 *  Remove Password and add refresh token
 *  check user creation
 *  Send Response (JWT / redirect / error)
 */

const registerUser = asyncHandler(async (req, res) => {
    const { username, email, password, fullName, avatar, coverImage } =
        req.body;

    // Validation to check if all required fields are provided
    if (
        [username, email, password, fullName].some(
            (field) => field?.trim() === ""
        )
    ) {
        throw new ApiError(400, "Please provide all the fields");
    }

    const existingUser = User.findOne({
        $or: [{ email }, { username }],
    });

    if (existingUser) {
        throw new ApiError(409, "User already exists"); // 409 Conflict - The request conflicts with the current state of the server
    }
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required");
    }

    const [avatarFile, coverImageFile] = await Promise.all([
        uploadOnCloudinary(avatarLocalPath),
        uploadOnCloudinary(coverImageLocalPath),
    ]);
    
    if (!avatarFile) {
        throw new ApiError(400, "Avatar could not be uploaded");
    }

    const user = await User.create({
        username,
        email,
        password,
        fullName,
        avatar: avatarFile.url,
        coverImage: coverImageFile.url || "",
        watchHistory: [],
    });

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if (!createdUser) {
        throw new ApiError(
            500,
            "Something went wrong while registering the user"
        );
    }

    res.status(201).json(
        new ApiResponse(201, createdUser, "User registered successfully")
    );
});

export { registerUser };

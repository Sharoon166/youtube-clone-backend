import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

/**
 * TODOs
 *  Collect user data
 *  Validate the data
 *  Check the email is not already registered
 *  Check Images, avatar and cover Image
 *  Upload to cloudinary
 *  Create the user Object
 *  Store it in the DB
 *  Remove Password and add refresh token
 *  check user creation
 *  Send Response (JWT / redirect / error)
 */

const registerUser = asyncHandler(async (req, res) => {
    const { username, email, password, fullName } = req.body;

    // Validation to check if all required fields are provided
    if (
        [username, email, password, fullName].some(
            (field) => field?.trim() === ""
        )
    ) {
        throw new ApiError(400, "Please provide all the fields");
    }

    const existingUser = await User.findOne({
        $or: [{ email }, { username }],
    });

    if (existingUser) {
        throw new ApiError(409, "User already exists"); // 409 Conflict - The request conflicts with the current state of the server
    }
    const avatarLocalPath = req.files?.avatar?.at(0)?.path;
    const coverImageLocalPath = null;
    if (
        req.files &&
        Array.isArray(req.files.coverImage) &&
        req.files.coverImage.length > 0
    ) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required");
    }

    const avatarFile = await uploadOnCloudinary(avatarLocalPath);

    let coverImageFile = await uploadOnCloudinary(coverImageLocalPath);

    if (!avatarFile) {
        throw new ApiError(400, "Avatar could not be uploaded");
    }

    const user = await User.create({
        username,
        email,
        password,
        fullName,
        avatar: avatarFile.url,
        coverImage: coverImageFile?.url || "",
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

/**
 * TODOs
 *  Get email/username and password from user -> req.body
 *  check DB if that email/username exists
 *  if !Email/username then throw error Invalid Credentials
 *  if Email/username exists then check password
 *  if password is wrong throw error Invalid Credentials
 *  if password is correct then generate an access token and a refresh token
 *  send tokens to the user and also save refresh token in DB
 *  Send tokens to the user
 */
const loginUser = asyncHandler(async (req, res) => {
    const { email, username, password } = req.body;
    if (!email || !password) {
        throw new ApiError(400, "Please provide all the fields");
    }
    const user = await User.findOne({ $or: [{ email }, { username }] });

    if (!user) {
        throw new ApiError(404, "Invalid Credentials");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(403, "Invalid Credentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
        user._id
    );

    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );
    if (!loggedInUser) {
        throw new ApiError(500, "Something went wrong while logging in");
    }

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken,
                },
                "User logged in successfully"
            )
        );
});

const logoutUser = asyncHandler(async (req, res) => {
    const { _id: userId } = req.user;
    await User.findByIdAndUpdate(
        userId,
        { $set: { refreshToken: undefined } },
        {
            new: true,
        }
    );
    const options = {
        httpOnly: true,
        secure: true,
    };
    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, null, "User logged out successfully"));
});

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new ApiError(404, "User not found");
        }
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating tokens");
    }
};

export { registerUser, loginUser, logoutUser };

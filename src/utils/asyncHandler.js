export const asyncHandler = (requestHandler) => async (req, res, next) => {
    try {
        await requestHandler(req, res, next);
    } catch (error) {
        res.status(error.code || 500).json({
            success: false,
            message: error.message || "Error on server",
        });
    }
};

// ? Equivalent to above code
// const asyncHandler = (requestHandler) => {
//     return Promise.resolve(requestHandler(req, res, next)).catch(err => next(err));
// }

export { asyncHandler };

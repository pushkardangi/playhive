const asyncHandler = (requestHandler) => {
    return async (req, res, next) => {
        try {
            await requestHandler(req, res, next);
        } catch (error) {
            res.status(error.code || 500).json({
                success: false,
                message: error.message,
            });
            next(error);
        }
    };
};

export { asyncHandler };

// In Express, if an error occurs in an asynchronous route handler, it might not be caught unless explicitly handled,
// leading to unhandled promise rejections. Wrapping your route handlers in asyncHandler simplifies error management
// by eliminating the need for repetitive try-catch blocks.

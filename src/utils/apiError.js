class apiError extends Error {
    constructor(
        statusCode,
        message = "Something went wrong!",
        errors = [],
        stack = ""
    ) {
        super(message);
        this.statusCode = statusCode;
        this.data = null;
        this.message = message;
        this.success = false;
        this.errors = errors;

        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export { apiError };

// The apiError class is intended to provide a consistent and reusable format for handling and returning errors
// in API responses. This simplifies error management and ensures a uniform error structure across the application.
// It provides a clean, extensible, and reusable way to manage errors, making APIs easier to debug and maintain.

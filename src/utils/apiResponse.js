class apiResponse {
    constructor(
        statusCode,
        data,
        message="Success"
    ) {
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
        this.success = statusCode < 400;
    }
}

export { apiResponse };

// The apiResponse class is intended to simplify the process of returning responses to API clients.
// By standardizing the response structure, it becomes easier for clients to handle and parse responses programmatically.
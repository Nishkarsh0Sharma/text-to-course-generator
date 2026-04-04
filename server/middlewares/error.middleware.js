// catches forwarded errors
// logs the error once
// sends a consistent JSON message
// uses custome "statusCode" property if provided , otherwise defualt to 500.
const errorHandler = (error , req , res , next) => {
    console.log( "Centralized error handler :" , error.message );

    const statusCode = error.statusCode || 500; // if the error object has a statusCode property, use it, otherwise default to 500 (Internal Server Error)

    const message = error.message || "An unexpected error occurred"; // if the error object has a message property, use it, otherwise default to a generic error message

    res.status( statusCode ).json({
        success: false,
        message,
    });
};

export { errorHandler };
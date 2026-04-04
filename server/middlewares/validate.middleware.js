import mongoose from 'mongoose';

const validateObjectId = (paramName) => {
    return (req,res,next) => {

        // req.params[paramName] means we are accessing the value of the parameter with the name paramName from the request parameters. 
        // For example, if paramName is "courseId", then req.params[paramName] will give us the value of courseId from the URL parameters of the incoming request.
        const value = req.params[paramName];

        if(!mongoose.Types.ObjectId.isValid(value)){
            return res.status(400).json({ // 400 Bad Request
                success: false,
                message: `Invalid ${paramName}`,
            });
        }
        next(); // allow request to continue
    };
};

export { validateObjectId };
import { ApiError } from "../utils/ApiError";

export const notFound = (req, res, next) => {
    next(new ApiError(404,`Route not found - ${req.method} ${req.originalUrl}`));
};

export const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    if(err.name === "CastError"){
        statusCode = 400;
        message = `Invalid ${err.path}: ${err.value}`;  
    }

    if(err.code === 11000){
        statusCode = 409;
        const feild = Object.keys(err.keyValue|| {})[0] || "field";
        message = `A record with that ${feild} already exists.`;
    }
    if(err.name === "ValidationError"){
        statusCode = 400;
        message = Object.values(err.errors).map((val) => val.message).join(", ");
    }

    if(process.env.NODE_ENV === "production" && statusCode === 500){
        console.error(err);
    }

    res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === "production" && statusCode === 500
            ? {stack: err.stack} 
            : {}),
    });
}
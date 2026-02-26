export const ErrorHandler = (err, req, res, next) => {
 
   res.status(err.status|| 500).json({
     success: false,
     message: err.message || "Internal Server Error",
   });
 };
 
 export default ErrorHandler;
 
 
class customApiError extends Error {
   constructor(message, status) {
      super(message);
      this.status = status;
   }
}

export const CustomError = (msg , statusCode) => {
   return new customApiError(msg , statusCode);
}

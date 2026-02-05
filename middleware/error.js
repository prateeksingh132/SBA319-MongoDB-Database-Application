//////// Global error handling middleware

// Goal: create error handling middleware.
// similar to the sba 318 and warmup exercise we did in class.

// Global error handling middleware: it takes 4 arguements
export function globalErr(err, req, res, next) {

    // logic: if the error has a status code, use it, otherwise 500 (server error)
    const status = err.status || 500;
    const message = err.message || "Server Error";

    console.error(`ERROR CAUGHT: status - ${status} - ${message}`);


    //////////TESTING
    // console.log('TESTING: ERROR: ', status);
    // console.log('TESTING: ERROR: ', message);
    //////////

    // sending a simple json error response for now, instead of simpole message, i will see if i can refine it later.
    // FUTUREWORK: maybe make a nice error.html view later
    res.status(status).json({
        error: {
            message: message,
            status: status
        }
    });
}


// i created this custom 404 error middleware, i will keep it here. it adds robustness to my project.
// 
// Custom Middleware: 404 Not Found
// idea is that if the request gets to the bottom of the routes and matches nothing,
// then this function catches it and creates an error to pass to the global error handler.
export function error404(req, res, next) {

    // creating a custom error
    const error = new Error("Resource Not Found");
    error.status = 404;

    // pass it to the next error handler
    next(error);
}
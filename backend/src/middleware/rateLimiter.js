import {
  getRatelimiter,
  postRatelimiter,
  putDeleteRatelimiter,
} from "../config/upstash.js";

const rateLimiter = async (req, res, next) => {
  try {
    let success = false;
    let ratelimitInstance;
    const ipAddress = req.ip || req.connection.remoteAddress; // Kullanıcının IP adresini al

    switch (req.method) {
      case "GET":
        ratelimitInstance = getRatelimiter;
        break;
      case "POST":
        ratelimitInstance = postRatelimiter;
        break;
      case "PUT":
      case "DELETE":
        ratelimitInstance = putDeleteRatelimiter;
        break;
      default:
   
        return next();
    }

 
    const { success: rateSuccess } = await ratelimitInstance.limit(
      `api_rate_limit:${req.method}:${ipAddress}`
    );
    success = rateSuccess;

    if (!success) {
      return res.status(429).json({
        message: "Too many requests, please try again later",
      });
    }
    next();
  } catch (error) {
    console.log("Rate limit error", error);
    next(error);
  }
};

export default rateLimiter;
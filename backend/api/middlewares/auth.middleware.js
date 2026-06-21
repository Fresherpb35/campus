import jwt from "jsonwebtoken";

export const protect = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }
    const decoded = await jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(401).json({
        message: "Invalid credentails",
      });
    }
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
};

//  check admin:
export const isAdmin = async (req, res, next) => {
  try {
    if(req.user.role !== "admin"){
      return res.status(403).json({
        message: "Access denied"
      })
    }
    next()
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
};

//  check user:
export const isUser = async (req, res, next) => {
  try {
    // Allow regular users and admins to access user-protected routes
    if (!req.user || (req.user.role !== "user" && req.user.role !== "admin")) {
      return res.status(403).json({
        message: "Access denied",
      });
    }
    next()
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
};
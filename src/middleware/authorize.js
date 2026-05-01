/**
 * Middleware for checking user roles based on their JWT token info
 * @param {string[]} roles - Array of allowed roles (e.g. ['admin', 'analyst'])
 */
module.exports = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `User role '${req.user ? req.user.role : 'none'}' is not authorized to access this route`
      });
    }
    next();
  };
};

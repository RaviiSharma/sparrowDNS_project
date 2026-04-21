export const checkScope = (requiredScope) => {
  return (req, res, next) => {
    
    // If user is authenticated via JWT, skip scope checking
    if (req.user && req.user.via !== "apikey") {
      return next();
    }

    // If developer using API key:
    if (!req.apiKey) {
      return res.status(403).json({
        success: false,
        message: "API key required for this operation"
      });
    }

    const keyScope = req.apiKey.scope;

    // Full Access = everything allowed
    if (keyScope === "Full Access") return next();

    if (requiredScope === "read" && keyScope === "Read Only") return next();
    if (requiredScope === "write" && keyScope === "Write Only") return next();

    return res.status(403).json({
      success: false,
      message: "API key does not have the required permissions"
    });
  };
};

const jwt = require("jsonwebtoken");

const { JWT_ADMIN_PASSWORD } = require("../config");

function adminMiddleware(req, res) {
  const token = req.headers.token;
  const decoded = jwt.verify(token, JWT_ADMIN_PASSWORD);
  if (decoded) {
    req.userId = decoded.id;
    next();
  } else {
    res.json({
      message: "You are not signed in",
    });
  }
}

module.exports = {
  adminMiddleware,
};

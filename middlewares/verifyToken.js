import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.token;
  if (!authHeader) {
    return res.status(400).json({ err: "Token is required!" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(400).json({ err: "Token is not valid!" });
    }
    req.user = user;
    next();
  });
};

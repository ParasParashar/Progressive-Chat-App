import jwt from "jsonwebtoken";
import prisma from "../db/prisma.js";
const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    console.log("cookie data: " + token);
    if (!token) {
      return res.status(401).json({ error: "You need to login first." });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("decoded data: " + decoded);
    if (!decoded) {
      return res.status(401).json({ error: "Unauthorized!! Invalid token." });
    }
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        username: true,
        fullname: true,
        profilePic: true,
      },
    });
    console.log(user, "this is the user data");
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }
    req.user = user;
    next();
  } catch (error) {
    console.error("Error in getting protect route", error.message);
    res.status(401).json({ error: "Unauthorized access" });
  }
};
export default protectRoute;

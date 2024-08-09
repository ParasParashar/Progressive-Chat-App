import jwt from "jsonwebtoken";
const generateToken = (userId, res) => {
  try {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
      expiresIn: "15d",
    });
    res.cookie("jwt", token, {
      maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
      httpOnly: true, // Ensure this is set
      secure: process.env.NODE_ENV === "production", // Only true in production
      sameSite: "None", // Required for cross-origin cookies
    });

    return token;
  } catch (error) {
    console.error("Error in generating token", error.message);
  }
};
export default generateToken;

import jwt from "jsonwebtoken";
const generateToken = (userId, res) => {
  try {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
      expiresIn: "15d",
    });
    res.cookie("jwt", token, {
      maxAge: 15 * 24 * 60 * 60 * 1000,
    });
    return token;
  } catch (error) {
    console.error("Error in generating token", error.message);
  }
};
export default generateToken;

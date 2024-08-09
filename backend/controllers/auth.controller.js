import bcrypt from "bcryptjs";
import generateToken from "../utils/generateToken.js";
import prisma from "../db/prisma.js";
export const loginController = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(401).json({ error: "Invalid crendentails" });
    }
    const user = await prisma.user.findUnique({
      where: {
        username: username,
      },
    });
    if (!user) {
      console.log("soskd");
      return res.status(404).json({ error: "User not found" });
    }
    const isPasswordCorrect = await bcrypt.compare(password, user?.password);
    if (!isPasswordCorrect) {
      return res.status(404).json({ error: "Invalid credentials" });
    }
    generateToken(user.id, res);
    res.status(200).json({
      id: user.id,
      username: user.username,
      fullname: user.fullname,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.log("Error in login", error.message);
    res.status(500).json({ error: "Server Errro" + error.message });
  }
};
export const signupController = async (req, res) => {
  try {
    const { fullname, username, password, confirmPassword, Gender } = req.body;
    if (!fullname || !username || !password || !confirmPassword || !Gender) {
      return res.status(404).json({ error: "Please fill all the fields" });
    }
    if (password !== confirmPassword) {
      return res.status(404).json({ error: "Password not match" });
    }
    const user = await prisma.user.findUnique({
      where: {
        username: username,
      },
    });
    if (user) {
      return res.status(404).json({ error: "User name already registered" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);
    /* creating profile image */
    const boyProfilePic = `https://avatar.iran.liara.run/public/boy?username=${username}`;
    const girlProfilePic = `https://avatar.iran.liara.run/public/girl?username=${username}`;
    const newUser = await prisma.user.create({
      data: {
        fullname,
        username,
        password: hashPassword,
        gender: Gender,
        profilePic: Gender === "male" ? boyProfilePic : girlProfilePic,
      },
    });
    if (newUser) {
      generateToken(newUser.id, res);
      return res.status(201).json({
        id: newUser.id,
        fullname: newUser.fullname,
        username: newUser.username,
        profilePic: newUser.profilePic,
      });
    } else {
      return res.status(400).json({ error: "Invalid User data" });
    }
  } catch (error) {
    console.log("Error in signup", error.message);
    res.status(500).json({ error: "Internal Error" + error.message });
  }
};
export const logoutController = async (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    return res.status(200).json({ message: "Logout Successfully" });
  } catch (error) {
    console.log("Error in logout", error.message);
    res.status(500).json({ error: "Server Error " + error.message });
  }
};
export const getUserController = async (req, res) => {
  try {
    console.log(req.user.id, "not able to get the uiser id");
    const userId = req.user.id;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({
      id: user.id,
      username: user.username,
      fullname: user.fullname,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.log("Error in getting user", error.message);
    res.status(500).json({ error: "Server Error " + error.message });
  }
};

export const getUserDataController = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id: id },
      select: {
        id: true,
        fullname: true,
        profilePic: true,
      },
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({
      id: user.id,
      fullname: user.fullname,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.log("Error in getting user Data", error.message);
    res
      .status(500)
      .json({ error: "Server Error of getting the user" + error.message });
  }
};

import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendMail } from "../emails/sendMail.js";

export const signup = async (req, res) => {
  try {
    const { name, username, email, password } = req.body;

    if (!name || !username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if the email or username already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: "Username already exists" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user instance
    const user = new User({
      name,
      email,
      password: hashedPassword,
      username,
    });

    // Generate an activation token
    const activationToken = await jwt.sign(
      {
        name,
        email,
        password: hashedPassword,
        username,
      },
      process.env.JWT_SECRET,
      { expiresIn: "3d" }
    );

    // Construct the activation URL dynamically based on the environment
    const activationUrl = `${window.location.origin}/activate?token=${activationToken}`;

    // Send activation email
    await sendMail(user.email, activationUrl, "activation");

    // Return success message
    return res.status(201).json({
      success: true,
      message: `Please check your email (${user.email}) to activate your account!`,
    });
  } catch (error) {
    console.log("Error in signup: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const activation = async (req, res) => {
  const { activation_token } = req.body;

  try {
    // Verify the activation token
    const decoded = jwt.verify(activation_token, process.env.JWT_SECRET);
    const { name, email, password, username } = decoded;
    console.log("user ================>", decoded);

    // Check if the user already exists
    let user = await User.findOne({ email });
    //console.log(user);

    if (user) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists." });
    }

    // Create and save the user
    user = new User({ name, email, password, username });

    await user.save();

    return res.status(201).json({
      success: true,
      message: "Account created successfully.",
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error("Activation Error:", error);
    return res
      .status(400)
      .json({ success: false, message: "Invalid or expired token." });
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Create and send token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "3d",
    });
    await res.cookie("jwt-linkedin", token, {
      httpOnly: true,
      maxAge: 3 * 24 * 60 * 60 * 1000,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    res.json({ message: "Logged in successfully" });
  } catch (error) {
    console.error("Error in login controller:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const logout = (req, res) => {
  res.clearCookie("jwt-linkedin");
  res.json({ message: "Logged out successfully" });
};

export const getCurrentUser = async (req, res) => {
  try {
    res.json(req.user);
  } catch (error) {
    console.error("Error in getCurrentUser controller:", error);
    res.status(500).json({ message: "Server error" });
  }
};

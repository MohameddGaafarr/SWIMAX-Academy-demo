import User from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";

export async function login(req, res, next) {
  try {
    const { username, password } = req.body ?? {};
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    const user = await User.findOne({ username: String(username).trim() });
    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const match = await user.comparePassword(String(password));
    if (!match) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const token = generateToken(user._id);
    return res.json({
      token,
      user: { id: user.id, username: user.username },
    });
  } catch (err) {
    return next(err);
  }
}

export async function changePassword(req, res, next) {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const { currentPassword, newPassword } = req.body ?? {};
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "currentPassword and newPassword are required" });
    }

    const newPass = String(newPassword);
    if (newPass.length < 8) {
      return res.status(400).json({ message: "New password must be at least 8 characters" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const matches = await user.comparePassword(String(currentPassword));
    if (!matches) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    user.password = newPass;
    user.passwordChangedAt = new Date();
    await user.save();

    return res.json({ message: "Password changed successfully" });
  } catch (err) {
    return next(err);
  }
}

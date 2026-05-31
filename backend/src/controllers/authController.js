import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

function buildUserResponse(user) {
  return {
    id: user._id,
    username: user.username,
    email: user.email,
    role: user.role
  };
}

function signToken(user) {
  return jwt.sign(
    {
      userId: user._id.toString(),
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
}

function tokenExpiresIn(minutes) {
  return new Date(Date.now() + minutes * 60 * 1000);
}

function createVerificationToken(user) {
  const emailVerificationToken = crypto.randomBytes(32).toString("hex");
  const emailVerificationTokenExpires = tokenExpiresIn(30);

  user.emailVerificationToken = emailVerificationToken;
  user.emailVerificationTokenExpires = emailVerificationTokenExpires;

  return emailVerificationToken;
}

function buildClientBaseUrl(req) {
  return process.env.CLIENT_ORIGIN?.split(",")?.[0]?.trim() || `${req.protocol}://${req.get("host")}`;
}

export async function register(req, res) {
  try {
    const { username, email, password } = req.body;

    const normalizedEmail = String(email).toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const emailVerificationToken = crypto.randomBytes(32).toString("hex");
    const emailVerificationTokenExpires = tokenExpiresIn(30);

    const user = await User.create({
      username: username ? String(username).trim() : normalizedEmail.split("@")[0],
      email: normalizedEmail,
      password: hashedPassword,
      role: "user",
      emailVerified: false,
      emailVerificationToken,
      emailVerificationTokenExpires
    });

    const verifyLink = `${buildClientBaseUrl(req)}/verify-email?token=${emailVerificationToken}`;
    // If SMTP is not configured, we simulate verification by printing the link.
    console.log(`[SIMULATED EMAIL] Verify ${normalizedEmail}: ${verifyLink}`);

    return res.status(201).json({
      message: "Registered successfully. Verify your email before login.",
      user: buildUserResponse(user)
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to register" });
  }
}

export async function signup(req, res) {
  return register(req, res);
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required" });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!user.emailVerified) {
      return res.status(403).json({
        message: "Email not verified. Please verify your email before login."
      });
    }

    const accessToken = signToken(user);

    return res.json({
      accessToken,
      token: accessToken,
      user: buildUserResponse(user)
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to login" });
  }
}

export async function verifyEmail(req, res) {
  try {
    const { token } = req.body || {};

    if (!token) {
      return res.status(400).json({ message: "token is required" });
    }

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationTokenExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired verification token" });
    }

    user.emailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationTokenExpires = null;
    await user.save();

    return res.json({ message: "Email verified successfully" });
  } catch (_error) {
    return res.status(500).json({ message: "Failed to verify email" });
  }
}

export async function resendVerificationEmail(req, res) {
  try {
    const { email } = req.body || {};

    if (!email) {
      return res.status(400).json({ message: "email is required" });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.emailVerified) {
      return res.status(400).json({ message: "Email is already verified" });
    }

    const emailVerificationToken = createVerificationToken(user);
    await user.save();

    const verifyLink = `${buildClientBaseUrl(req)}/verify-email?token=${emailVerificationToken}`;
    console.log(`[SIMULATED EMAIL] Resend verify ${normalizedEmail}: ${verifyLink}`);

    return res.json({
      message: "A new verification email has been sent."
    });
  } catch (_error) {
    return res.status(500).json({ message: "Failed to resend verification email" });
  }
}

export async function forgotPassword(req, res) {
  try {
    const { email } = req.body || {};

    if (!email) {
      return res.status(400).json({ message: "email is required" });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (user) {
      const resetPasswordToken = crypto.randomBytes(32).toString("hex");
      user.resetPasswordToken = resetPasswordToken;
      user.resetPasswordTokenExpires = tokenExpiresIn(30);
      await user.save();

      const resetLink = `${buildClientBaseUrl(req)}/reset-password?token=${resetPasswordToken}`;
      // If SMTP is not configured, we simulate reset email by printing the link.
      console.log(`[SIMULATED EMAIL] Reset password ${normalizedEmail}: ${resetLink}`);
    }

    return res.json({
      message: "If the account exists, a password reset link has been generated."
    });
  } catch (_error) {
    return res.status(500).json({ message: "Failed to process forgot password" });
  }
}

export async function resetPassword(req, res) {
  try {
    const { token, password } = req.body || {};

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordTokenExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = null;
    user.resetPasswordTokenExpires = null;
    await user.save();

    return res.json({ message: "Password reset successful" });
  } catch (_error) {
    return res.status(500).json({ message: "Failed to reset password" });
  }
}

export async function profile(req, res) {
  try {
    const user = await User.findById(req.user.userId).select("username email role");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ user: buildUserResponse(user) });
  } catch (error) {
    return res.status(500).json({ message: "Failed to load profile" });
  }
}

export async function adminDashboard(_req, res) {
  return res.json({
    message: "Admin dashboard loaded",
    stats: {
      totalUsers: await User.countDocuments(),
      activeUsers: await User.countDocuments({ role: "user" }),
      adminUsers: await User.countDocuments({ role: "admin" })
    }
  });
}

export async function listUsers(_req, res) {
  try {
    const users = await User.find().select("username email role createdAt");
    return res.json({ users });
  } catch (error) {
    return res.status(500).json({ message: "Failed to load users" });
  }
}

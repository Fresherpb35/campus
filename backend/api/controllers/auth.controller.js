import { Auth } from "../model/auth.schema.js";
import { genToken } from "../../utils/genToken.js";
import { College } from "../model/college.schema.js";
export const signup = async (req, res, next) => {
  try {
    const { userName, email, password, college, isVerified, role } = req.body;
    if (!userName || !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }
    const isUserExist = await Auth.findOne({ email });
    if (isUserExist) {
      return res.status(400).json({
        message: "Email is already exist",
      });
    }
    const user = await Auth.create({
      userName,
      email,
      password,
      college,
      isVerified,
      role,
    });

    return res.status(201).json({
      id: user._id,
      message: "User Registered Successfully",
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
};

export const signin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }
    const user = await Auth.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "user not found",
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({
        message: "password is incorrect",
      });
    }

    //  check isverified
    if (user.isVerified === false) {
      return res.status(400).json({
        message: "You can sign in once the admin has verified you.",
      });
    }

    const token = await genToken(
      user._id,
      user.role,
      user.college ? user.college : null,
    );

    if (!token) {
      return res.status(400).json({
        message: "Token is not found",
      });
    }
    return res
      .status(200)
      .cookie("token", token, {
        httpOnly: true,
        secure: false,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json({
        message: "signin successfully",
        id: user._id,
        user: {
          id: user._id,
          userName: user.userName,
          email: user.email,
          role: user.role,
        },
      });
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
};

//  get all user for admin:
export const getAllusers = async (req, res, next) => {
  try {
    const college = await College.findOne({ admin: req.user.id });
    let users;
    if (!college) {
      // If admin hasn't created a college yet, return all unverified user requests so admin can act on them
        users = await Auth.find({ role: "user", isVerified: false }).select("-password");
    } else {
        // Only return unverified users for this admin's college
        users = await Auth.find({ role: "user", college: college._id, isVerified: false }).select("-password");
    }

    if (!users || users.length === 0) {
      return res.status(200).json({ data: [] });
    }

    return res.status(200).json({ data: users });
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
};

//  update user isVerified true by admin:
export const isVerifiedUser = async (req, res, next) => {
  try {
    console.log(req.params.id);
    const updated_user = await Auth.findByIdAndUpdate(
      req.params.id,
      { $set: { isVerified: true } },
      { new: true },
    );
    return res.json({
      message: "User verified successfully",
      data: updated_user,
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
};

//  reject/delete user by admin
export const rejectUser = async (req, res, next) => {
  try {
    const deletedUser = await Auth.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.json({ message: "User rejected and removed", data: deletedUser });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getUser = async (req, res) => {
  try {
    const user = await Auth.findById(req.user.id)
      .populate("college")
      .select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json(user);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const signout = async (req, res) => {
  try {
    res.clearCookie("token").status(200).json({
      message: "Signout successfully",
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { userName } = req.body;
    const user = await Auth.findByIdAndUpdate(
      req.user.id,
      { $set: { userName } },
      { new: true },
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "Profile updated successfully",
      data: user,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
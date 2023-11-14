import { comparePassword, hashPassword } from "../helpers/authHelper.js";
import userModel from "../models/userModel.js";
import JWT from "jsonwebtoken";

export const registerController = async (req, res) => {
  try {
    const { name, email, password, phone, address, answer } = req.body;
    //validation
    if (!name) {
      return res.send({
        message: "Name is required",
      });
    }
    if (!email) {
      return res.send({
        message: "Email is required",
      });
    }

    if (!password) {
      return res.send({
        message: "Password is required",
      });
    }

    if (!phone) {
      return res.send({
        message: "Phone no is required",
      });
    }

    if (!address) {
      return res.send({
        message: "Address is required",
      });
    }
    if (!answer) {
      return res.send({
        message: "Answer is required",
      });
    }
    //cehck user
    const existingUser = await userModel.findOne({ email });
    //existing user
    if (existingUser) {
      return res.status(200).send({
        success: false,
        message: "Already Registered Please LogIn...",
      });
    }
    //resgister user
    const hashedPassword = await hashPassword(password);

    const user = await new userModel({
      name,
      email,
      phone,
      address,
      password: hashedPassword,
      answer,
    }).save();
    res.status(201).send({
      success: true,
      message: "User Registered Successfully...",
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "error in Registration",
      error,
    });
  }
};

//POST LOGIN
export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    // validation
    if (!email || !password) {
      return res.status(404).send({
        success: false,
        message: "Invalid email or password",
      });
    }
    //check user
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not registered",
      });
    }
    const match = await comparePassword(password, user.password);
    if (!match) {
      return res.status(200).send({
        success: false,
        message: "Invalid Password",
      });
    }
    const token = await JWT.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.status(200).send({
      success: true,
      message: "logged in successfully",
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "error in login",
      error,
    });
  }
};

//forgotPasswordController

export const forgotPasswordController = async (req, res) => {
  try {
    const { email, answer, newPassword } = req.body;
    if (!email) {
      res.status(400).send({
        message: "Email is required",
      });
    }
    if (!answer) {
      res.status(400).send({
        message: "Answer is required",
      });
    }
    if (!newPassword) {
      res.status(400).send({
        message: "new Password is required",
      });
    }

    //check
    const user = await userModel.findOne({ email, answer });
    //validation
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "Wrong answer or email",
      });
    }
    const hashed = await hashPassword(newPassword);
    await userModel.findByIdAndUpdate(user._id, { password: hashed });
    res.status(200).send({
      success: true,
      message: "Password reset Successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "something went wrong",
      error,
    });
  }
};

// testController
export const testController = (req, res) => {
  try {
    res.send("protected route");
  } catch (error) {
    console.log(error);
    res.send({ error });
  }
};

// updating user  Profile
export const updatePofileController = async (req, res) => {
  try {
    const { name, email, password, address, phone } = req.body;
    const user = await userModel.findById(req.user._id);

    //password
    if (password && password.length < 6) {
      return res.json({ error: "Password is required and 6 charecer long" });
    }
    const hashedPassword = password ? await hashPassword(password) : undefined;

    const updatedUser = await userModel.findByIdAndUpdate(
      req.user._id,
      {
        name: name || user.name,
        password: hashedPassword || user.password,
        phone: phone || user.phone,
        address: address || user.address,
      },
      { new: true }
    );
    res.status(200).send({
      success: true,
      message: "Profile updated success fully ",
      updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      error,
      message: "Error while getting user Profiles",
      success: false,
    });
  }
};

// get all Users
export const getUsersController = async (req, res) => {
  try {
    const users = await userModel.find();
    res.status(200).send({
      success: true,
      users,
    });
  } catch (error) {
    console.log(error);
    res
      .status(400)
      .send({ success: false, message: "error in getting users", error });
  }
};

// iserrting keywords in preference array

export const insertKeywordController = async (req, res) => {
  try {
    const email = req.params.email;
    const { keyword } = req.body;

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    let preferences = user.preferences || [];
    preferences.push(keyword);

    if (preferences.length > 6) {
      preferences = preferences.slice(1);
    }
    await userModel.findOneAndUpdate({ email }, { preferences }, { new: true });

    res.status(200).send({
      success: true,
      preferences,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: true,
      error,
      message: "Error in inserting the keywords in database",
    });
  }
};

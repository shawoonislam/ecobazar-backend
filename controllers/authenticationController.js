const { mailVerification, resetPasswordMail } = require("../utils/email");
const User = require("../models/userModel");

const { emptyFieldValidation } = require("../utils/validation");
const tokenGenerator = require("../utils/tokenGenerator");
const existingData = require("../utils/exixtingData");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

let registrationController = async (req, res) => {
  const { email, password, confirmPassword, terms } = req.body;

  let users = await existingData(res, { email: email });
  if (users) {
    return res.send({
      success: false,
      message: "User exist",
    });
  }

  if (!terms) {
    return res.send({
      success: false,
      message: "Please Accept Our Terms and Condition",
    });
  }

  emptyFieldValidation(res, email, password, confirmPassword);

  if (password !== confirmPassword) {
    return res.send({
      success: false,
      message: "password no matched",
    });
  }

  const hash = bcrypt.hashSync(password, 10);

  let user = new User({
    email: email,
    password: hash,
    terms: terms,
  });

  await user.save();

  let token = tokenGenerator(
    {
      id: user._id,
      email: user.email,
    },
    process.env.ACCESS_TOKEN_SECRET,
    "1d",
  );

  mailVerification(token, email);

  res.send({
    success: true,
    message: "Registration Successfull, Please check your email for verification",
  });
};

let loginController = async (req, res) => {
  const { email, password } = req.body;

  let users = await User.findOne({ email: email });
  if (!users) {
    return res.send({ 
        success: false,
        message: "User not found" 
    });
  }
  emptyFieldValidation(res, email, password);

  let pass = bcrypt.compareSync(password, users.password);

  if (!pass) {
    return res.send({
      success: false,
      message: "Invalid Credential",
    });
  }

  res.send({
    success: true,
    message: "Login Successfull",
  });
};

let forgotPasswordController = async (req, res) => {
  let { email } = req.body;
  emptyFieldValidation(res, email);
  let users = await User.findOne({ email: email });
  if (!users) {
    return res.send({
      success: false,
      message: "User not found",
    });
  }

  let token = tokenGenerator(
    {
      id: users._id,
      email: users.email,
    },
    process.env.ACCESS_TOKEN_SECRET,
    "1d",
  );

  resetPasswordMail(token, email);

  res.send({
    success: true,
    message: "Please check your email",
  });
};

let resetPasswordController = (req, res) => {
  let { newPassword, confirmPassword } = req.body;
  let { token } = req.params;

  if (newPassword !== confirmPassword) {
    return res.send({
      success: false,
      message: "Confirm password not matched",
    });
  }

  jwt.verify(
    token,
    process.env.ACCESS_TOKEN_SECRET,
    async function (err, decoded) {
      if (err) {
        res.send({ message: "Unauthorized" });
      } else {
        const hash = bcrypt.hashSync(newPassword, 10);
        console.log(decoded);
        const updateData = await User.findByIdAndUpdate(
          { _id: decoded.id },
          { password: hash },
          { new: true },
        );
        res.send({
          success: true,
          message: "Password Updated",
          updateData,
        });
      }
    },
  );
};

let resendVerificationEmailController = async (req, res) => {
  let { email } = req.body;

  let user = await User.findOne({ email: email });

  let token = tokenGenerator(
    {
      id: user._id,
      email: user.email,
    },
    process.env.ACCESS_TOKEN_SECRET,
    "1d",
  );

  mailVerification(token, email);

  res.send({
    success: true,
    message: "Check your email for verification",
  });
};

let verifyEmailController = async (req, res) => {
  const { token } = req.params;

  jwt.verify(
    token,
    process.env.ACCESS_TOKEN_SECRET,
    async function (err, decoded) {
      if (err) {
        res.send({ message: "Unauthorized" });
      } else {
        const userId = decoded.id;
        let findUser = await User.findById(userId);
        if (findUser.isVerified) {
          return res.send({ message: "User already verified" });
        } else {
          findUser.isVerified = true;
          findUser.save();
          res.send({
            success: true,
            message: "Email verified successfully",
          });
        }
      }
    },
  );
};

module.exports = {
  registrationController,
  loginController,
  forgotPasswordController,
  resetPasswordController,
  resendVerificationEmailController,
  verifyEmailController,
};

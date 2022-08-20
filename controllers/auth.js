const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const dotenv = require("dotenv");
const otpGenerator = require("otp-generator");
const jwt = require("jsonwebtoken");

dotenv.config();

const User = require("../models/users");
const Store = require("../models/stores");
const Otp = require("../models/otp");
const mail = require("../utils/sendemail");
const Token = require("../models/token");
const { use } = require("passport");

var emailregex = /^[-!#$%&'*+\/0-9=?A-Z^_a-z{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/
exports.otp = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ Error: "Validation Failed" });
    }

    const { email } = req.body;

    var validemail = emailregex.test(email);

    if (!validemail) {
      const error = new Error('Please enter a valid email');
      error.statusCode = 422;
      throw error;
    }

    const user = await User.findOne({ email: email });
    if (user) {
      const error = new Error("User already exists !!");
      error.statusCode = 400;
      throw error;
    }

    const otp = otpGenerator.generate(4, {
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false
    });

    const result = await Otp.findOne({ email: email });
    if (result === null) {
      const newOtp = new Otp({ email: email, otp: otp });
      await newOtp.save();
    }
    else
      await Otp.updateOne({ email: email }, { $set: { otp: otp } });
    mail.sendEmail(email, otp);
    return res.status(201).json({ message: 'Otp sent' });
  }
  catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}

exports.otpVerification = async (req, res, next) => {
  try {
    const { email, otp, password, confirmPass} = req.body;
    const userInDb = await User.findOne({email:email });
    const storeInDb = await Store.findOne({ email:email });
    console.log(email)

    if (userInDb||storeInDb)
        return res.status(401).send('Already registered.');

    const newotp = await Otp.findOne({ email: email });
    if (!newotp) {
      const err = new Error('Otp is expired');
      err.statusCode = 422;
      throw err;
    }
    if (newotp.otp !== otp) {
      const err = new Error("Wrong Otp");
      err.statusCode = 420;
      throw err;
    }
  await newotp.remove();
  return res.status(200).json('otp verified');
}
  catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}





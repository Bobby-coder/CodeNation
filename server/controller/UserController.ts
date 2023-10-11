import dotenv from "dotenv";
import jwt, { Secret } from "jsonwebtoken";
import ErrorHandler from "../utils/ErrorHandler";
import { Request, Response, NextFunction } from "express";
import { User, IUser } from "../model/User";
import sendMail from "../utils/SendMail";
import { catchAsyncError } from "../utils/CatchAsyncError";
import { sendToken } from "../utils/Jwt";

// load env variables
dotenv.config();

interface IRegistrationBody {
  name: string;
  email: string;
  password: string;
  avatar?: string;
}

// Register User
export const registerUser = catchAsyncError(async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // extract user data from request body
    const { name, email, password } = req.body;

    // If name, email or password is not entered
    if (!name || !email || !password) {
      let message;
      !name && (message = "Please enter your name");
      !email && (message = "Please enter your email");
      !password && (message = "Please enter your password");
      !name && !email && (message = "Please enter your name & email");
      !email && !password && (message = "Please enter your email & password");
      !name && !password && (message = "Please enter your name & password");
      !name &&
        !email &&
        !password &&
        (message = "Please enter your name, email & password");

      return next(new ErrorHandler(message, 400));
    }

    // Check if user already exist
    const isEmailExist = await User.findOne({ email });
    if (isEmailExist) {
      return next(new ErrorHandler("Email already exist", 400));
    }

    const user: IRegistrationBody = {
      name,
      email,
      password,
    };

    // If email not exist then create activation token & activation code for the user using createActivationToken() function
    const activationToken = createActivationToken(user);
    const activationCode = activationToken.activationCode;

    // define data to send in email
    const data = { user: { name: user.name }, activationCode };

    // send mail
    try {
      await sendMail({
        userEmail: email,
        subject: "Activate your account",
        templateName: "activation-mail.ejs",
        templateData: data,
      });

      // return success response
      return res.status(201).json({
        success: true,
        message: `Please check your email ${user.email} to activate your account`,
        activationToken: activationToken.token,
      });
    } catch (err: any) {
      return next(new ErrorHandler(err.message, 400));
    }
  } catch (err: any) {
    return next(new ErrorHandler(err.message, 400));
  }
});

// return type  of createActivationToken function
interface IActivationToken {
  token: string;
  activationCode: string;
}

// createActivationToken function
export function createActivationToken(user: any): IActivationToken {
  // create activation code
  const activationCode = Math.floor(1000 + Math.random() * 9000).toString();

  // create token using jwt.sign().It accepts payload that we want to add inside token, a secret key & a options object
  const token = jwt.sign(
    { user, activationCode },
    process.env.ACTIVATION_SECRET_KEY as Secret,
    { expiresIn: "5m" }
  );

  return { token, activationCode };
}

// Activate User
export const activateUser = catchAsyncError(async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // extract user data from request body
    const { activationToken, activationCode } = req.body;

    // Verify activation token using jwt.verify(). It verify the token using secret key and returns the payload object that we have added while creating the token using jwt.sign()
    const newUser: { user: IUser; activationCode: string } = jwt.verify(
      activationToken,
      process.env.ACTIVATION_SECRET_KEY as Secret
    ) as { user: IUser; activationCode: string };

    // extract user details from newUser object
    const { name, email, password } = newUser.user;

    // Verify activation code
    if (newUser.activationCode !== activationCode) {
      return next(new ErrorHandler("Wrong OTP", 400));
    }

    // Save new user to db
    const data = await User.create({
      name,
      email,
      password,
    });

    // Return success response
    return res.status(200).json({
      success: true,
      message: "User created successfully",
      data,
    });
  } catch (err: any) {
    return next(new ErrorHandler(err.message, 400));
  }
});

// Login User
export const loginUser = catchAsyncError(async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // extract user email and password from request body
    const { email, password } = req.body;

    // If email or password is not entered
    if (!email || !password) {
      let message;
      !email && (message = "Please enter your email");
      !password && (message = "Please enter your password");
      !email && !password && (message = "Please your email & password");

      return next(new ErrorHandler(message, 400));
    }

    // If email & password are entered then check whether user is registered or not
    const user = await User.findOne({ email }).select("+password");

    // If user is not registered
    if (!user) {
      return next(
        new ErrorHandler(
          "Email is not registered, please register to login",
          400
        )
      );
    }

    // If user is registered then verify its password using comparePassword() function
    const isPasswordMatched = await user.comparePassword(password);

    // If password is wrong
    if (!isPasswordMatched) {
      return next(new ErrorHandler("Password is not correct", 400));
    }

    // If password is correct then save access & refresh token in cookie & send access token in response
    sendToken(user, 200, res);
  } catch (err: any) {
    return next(new ErrorHandler(err.message, 400));
  }
});

// Logout User
export const logoutUser = catchAsyncError(async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // Remove access token & refresh token from the cookie
    res.cookie("access_token", "", { maxAge: 1 });
    res.cookie("refresh_token", "", { maxAge: 1 });

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (err: any) {
    return next(new ErrorHandler(err.message, 400));
  }
});

import dotenv from "dotenv";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import ErrorHandler from "../utils/ErrorHandler";
import { Request, Response, NextFunction } from "express";
import { User, IUser } from "../model/User";
import sendMail from "../utils/SendMail";
import { catchAsyncError } from "../utils/CatchAsyncError";
import {
  accessTokenOptions,
  refreshTokenOptions,
  sendToken,
} from "../utils/Jwt";
import { redis } from "../config/redis";
import {
  getAllUsersService,
  getUserById,
  updateUserRoleService,
} from "../services/userService";
import cloudinary from "cloudinary";

// load env variables
dotenv.config();

interface IRegistrationBody {
  name: string;
  email: string;
  password: string;
  avatar?: string;
}

// Register User - It will send send otp to user email and a token in response
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
        data: { activationToken: activationToken.token },
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

// createActivationToken function - this will generate token & otp for account activation
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

// Activate User - It will verify access token & otp then activate the user account by storing its details in db
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
    const userData = await User.create({
      name,
      email,
      password,
    });

    // Return success response
    return res.status(200).json({
      success: true,
      message: "Your account is activated successfully",
      data: {
        userData,
      },
    });
  } catch (err: any) {
    return next(new ErrorHandler(err.message, 400));
  }
});

// type for login request
interface ILoginRequest {
  email: string;
  password: string;
}

// Login User - this function saves access & refresh token in the cookies & saves the user in the redis db
export const loginUser = catchAsyncError(async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // extract user email and password from request body
    const { email, password } = req.body as ILoginRequest;

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

    // If password is correct then generate access & refresh token and save them in cookie, save user to redis db & send access token in response
    sendToken(user, 200, res);
  } catch (err: any) {
    return next(new ErrorHandler(err.message, 400));
  }
});

// Logout User - this function will delete the access & refresh token from cookies & remove the logged in user from redis db
export const logoutUser = catchAsyncError(async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // Remove access token & refresh token from the cookie
    res.cookie("access_token", "", { maxAge: 1 });
    res.cookie("refresh_token", "", { maxAge: 1 });

    // Remove user id from redis session
    const userId = req.user?._id || "";
    redis.del(userId);

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (err: any) {
    return next(new ErrorHandler(err.message, 400));
  }
});

// update access token - this function updates the access token & refresh token, it extract user id using refresh token & then pass the user id as payload while creating the access token & refresh token & saves the updated tokens in cookie & returns access token in response
export const updateAccessToken = catchAsyncError(async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // extract refresh token from cookies
    const refresh_token = req.cookies.refresh_token as string;

    // if refresh token is not present
    if (!refresh_token) {
      return next(new ErrorHandler("Refresh token not found", 400));
    }

    // if refresh token is present, then verify it & get the decoded object
    const decoded = jwt.verify(
      refresh_token,
      process.env.REFRESH_TOKEN as string
    ) as JwtPayload;

    // if decoded object is not present then refresh token is invalid
    if (!decoded) {
      next(new ErrorHandler("Refresh token is not valid", 400));
    }

    // if decoded is present then get user from redis with user._id present inside decoded object
    const user = await redis.get(decoded.id);

    // if user is not present
    if (!user) {
      return next(new ErrorHandler("User not present", 400));
    }

    // if user is not then parse the user object
    const parsedUser = JSON.parse(user);

    // create the access token using jwt.sign()
    const accessToken = jwt.sign(
      { id: parsedUser._id },
      process.env.ACCESS_TOKEN as string,
      {
        expiresIn: "5m",
      }
    );

    // create the refresh token using jwt.sign()
    const refreshToken = jwt.sign(
      { id: parsedUser._id },
      process.env.REFRESH_TOKEN as string,
      { expiresIn: "3d" }
    );

    // save the user to request object
    req.user = parsedUser;

    // Save access & refresh token to cookies
    res.cookie("access_token", accessToken, accessTokenOptions);
    res.cookie("refresh_token", refreshToken, refreshTokenOptions);

    // send access token in response
    return res.status(200).json({
      success: true,
      message: "Access & Refresh token updated successfully",
      data: { accessToken },
    });
  } catch (err: any) {
    return next(new ErrorHandler(err.message, 400));
  }
});

// get user info
export const getUserInfo = catchAsyncError(async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // extract user id from request object
    const id = req.user?._id;
    // Fetch user details with user id & send user in response
    getUserById(id, res, next);
  } catch (err: any) {
    return next(new ErrorHandler(err.message, 400));
  }
});

// type for oauth login request
interface ISocialAuthBody {
  name: string;
  email: string;
  avatar: string;
}

// social oauth function - password less login
export const socialAuth = catchAsyncError(async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    //extract name , email & password from req
    const { name, email, avatar } = req.body as ISocialAuthBody;
    const user = await User.findOne({ email });
    if (!user) {
      const newUser = await User.create({ name, email, avatar });
      sendToken(newUser, 200, res);
    } else {
      sendToken(user, 200, res);
    }
  } catch (err: any) {
    return next(new ErrorHandler(err.message, 400));
  }
});

// type for update user info request
interface IUpdateUserInfo {
  name: string;
  email: string;
}

// update user info function
export const updateUserInfo = catchAsyncError(async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // extract name & email from request body
    const { name, email } = req.body as IUpdateUserInfo;

    // extract user Id from request object
    const userId = req.user?._id;

    // find user document with specified user id
    const user = await User.findById(userId);

    // If new email is entered & user is present or logged in then check if new email is already present in db or not
    if (email && user) {
      const isNewEmailRegirtered = await User.findOne({ email });
      if (isNewEmailRegirtered) {
        return next(new ErrorHandler("This Email is already registered", 400));
      }
      // if new Email is not registered then update the old email in user document with new email
      user.email = email;
    }

    // If new name is entered & user is present or logged in then update the old name in user document with new name
    if (name && user) {
      user.name = name;
    }

    // save changes made in user document to db using save()
    await user?.save();

    // update user in redis
    redis.set(userId, JSON.stringify(user));

    // return success response
    return res.status(201).json({
      success: true,
      message: "User info updated successfully",
      data: {
        user,
      },
    });
  } catch (err: any) {
    return next(new ErrorHandler(err.message, 400));
  }
});

// type for update user password request
interface IUpdateUserPassword {
  currentPassword: string;
  newPassword: string;
}

// update user password
export const updateUserPassword = catchAsyncError(async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // extract old & new password from request body
    const { currentPassword, newPassword } = req.body as IUpdateUserPassword;

    // If currentPassword, newPassword or both are not entered
    if (!currentPassword || !newPassword) {
      let message;
      !currentPassword && (message = "Please enter your current password");
      !newPassword && (message = "Please enter your new password");
      !currentPassword &&
        !newPassword &&
        (message = "Please enter your current password & new password");

      return next(new ErrorHandler(message, 400));
    }

    // extract user id from request object
    const userId = req.user?._id;

    // find user document with specified user id. DO select password because by default we have set password to select false in user schema.
    const user = await User.findById(userId).select("+password");

    // User with social login will not have any password because these types of logins are password less logins, thats if any social login user try to change the password, error response will be sent
    if (user?.password === undefined) {
      return next(new ErrorHandler("Invalid user", 400));
    }

    // compare whether current password is correct or not
    const isCurrentPasswordMatched = await user?.comparePassword(
      currentPassword
    );

    // if current password is not matched
    if (!isCurrentPasswordMatched) {
      return next(new ErrorHandler("Current password is not correct", 400));
    }

    // if current password is matched then update the current password in user document with new password
    user.password = newPassword;

    // save changes to db using save()
    await user.save();

    // update user in redis
    await redis.set(userId, JSON.stringify(user));

    // return success response
    return res.status(201).json({
      success: true,
      message: "Password updated successfully",
      data: {
        user,
      },
    });
  } catch (err: any) {
    return next(new ErrorHandler(err.message, 400));
  }
});

// update user profile picture
export const updateUserProfilePicture = catchAsyncError(async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // extract avatar or profile picture link from request body
    const { avatar } = req.body;

    // extract user id from request object
    const userId = req.user?._id;

    // find user document with specified user id
    const user = await User.findById(userId);

    //
    if (avatar && user) {
      // if user already have avatar or profile picture
      if (user?.avatar?.publicId) {
        // delete the existing avatar or profile picture
        await cloudinary.v2.uploader.destroy(user?.avatar?.publicId);

        // then upload the new avatar or profile picture in cloudinary
        const myCloud = await cloudinary.v2.uploader.upload(avatar, {
          folder: "avatars",
          width: 150,
        });
        // then upload publicId and secure url in User document
        user.avatar = {
          publicId: myCloud.public_id,
          url: myCloud.secure_url,
        };
      }
      // if user does not have avatar or profile picture
      else {
        // then upload the new avatar or profile picture in cloudinary
        const myCloud = await cloudinary.v2.uploader.upload(avatar, {
          folder: "avatars",
          width: 150,
        });
        // then upload publicId and secure url in User document
        user.avatar = {
          publicId: myCloud.public_id,
          url: myCloud.secure_url,
        };
      }
    }

    // save changes to db using save()
    await user?.save();

    // update user in redis
    await redis.set(userId, JSON.stringify(user));

    // return success response
    return res.status(201).json({
      success: true,
      message: "Profile Picture updated successfully",
      data: {
        user,
      },
    });
  } catch (err: any) {
    return next(new ErrorHandler(err.message, 200));
  }
});

// reset password link - This function will generate the reset password link and in that link it will append the user id & send the link in the mail
export const resetPasswordLink = catchAsyncError(async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // extract email from request body
    const { email } = req.body;

    // if email is not entered
    if (!email) {
      return next(new ErrorHandler("Please enter your email", 400));
    }

    // Find user with specified email & select password because by default password is not selected in user schema
    const user = await User.findOne({ email });

    // if email is not registered
    if (!user) {
      return next(
        new ErrorHandler(
          `This email: ${email} is not registered with us, please enter a valid email`,
          400
        )
      );
    }

    // If email is registered then a generate token for reset password which will expire in 5 minutes
    const resetPasswordToken = jwt.sign(
      { email },
      process.env.RESET_PASSWORD_SECRET_KEY as Secret,
      { expiresIn: "5m" }
    );

    // Create a new link to reset passwork & append reset password token to it, this link will not work after 5 minutes because token expiry is 5 minutes
    const resetPasswordLink = `http://localhost:8000/reset-password/${resetPasswordToken}`;

    // define data to send in email
    const data = { resetPasswordLink };

    // send reset password link in mail
    sendMail({
      userEmail: email,
      subject: "Reset Password",
      templateName: "reset-password.ejs",
      templateData: data,
    });

    return res.status(200).json({
      success: true,
      message:
        "Email sent successfully, please check your email to reset password",
    });
  } catch (err: any) {
    return next(new ErrorHandler(err.message, 400));
  }
});

// reset password - this function will extract userid & new password from request body & update the password,
export const resetPassword = catchAsyncError(async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // extract userId, password & confirm password from request body
    const { newPassword, confirmPassword, resetPasswordToken } = req.body;

    // Extract decoded object from resetPasswordToken which we have added to it as payload while creating the token
    const decoded: { email: string } = jwt.verify(
      resetPasswordToken,
      process.env.RESET_PASSWORD_SECRET_KEY as string
    ) as { email: string };

    // if decoded is not present means token is expired which ultimately means link will not work
    if (!decoded) {
      return next(
        new ErrorHandler("This link for reseting password is expired", 400)
      );
    }

    // if decoded is present then extract email from it
    const email = decoded.email;

    // if password, confirm password or both are not entered
    if (!newPassword || !confirmPassword) {
      let message;
      !newPassword && (message = "Please enter your new password");
      !confirmPassword &&
        (message = "Please enter your password again to confirm");
      !newPassword &&
        !confirmPassword &&
        (message = "Please enter your new password & confirm password");

      return next(new ErrorHandler(message, 400));
    }

    // if new password & confirm password
    if (newPassword !== confirmPassword) {
      return next(new ErrorHandler("Password does not match", 400));
    }

    // if password contains less then 6 characters
    if (newPassword.length < 6) {
      return next(
        new ErrorHandler("Password should contain atleast 6 characters", 400)
      );
    }

    // extract user with specified email
    const user = await User.findOne({ email }).select("+password");

    // if user is not present
    if (!user) {
      return next(new ErrorHandler("User not found", 400));
    }

    // update password in user document
    user.password = newPassword;

    // save changes to user model using save()
    user.save();

    // return success response
    return res.status(201).json({
      success: true,
      message: `Password reset successfully`,
    });
  } catch (err: any) {
    return next(new ErrorHandler(err.message, 400));
  }
});

// get all users for admin only
export const getAllUsersForAdmin = catchAsyncError(async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    getAllUsersService(res);
  } catch (err: any) {
    return next(new ErrorHandler(err.message, 400));
  }
});

// update user role - only admin can update
export const updateUserRole = catchAsyncError(async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { userId, role } = req.body;

    updateUserRoleService(res, userId, role);
  } catch (err: any) {
    return next(new ErrorHandler(err.message, 400));
  }
});

// delete user - only admin can delete
export const deleteUser = catchAsyncError(async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // extract user id from route parameters
    const userId = req.params.id;

    // find user
    const user = await User.findById(userId);

    // if user not found
    if (!user) {
      return next(new ErrorHandler("User not found", 400));
    }

    // delete user from db
    const deletedUser = await user.deleteOne({ userId });

    // delete user from redis cache also
    await redis.del(userId);

    // return success response
    return res.status(201).json({
      success: true,
      message: `User of ${userId} deleted successfully`,
      data: {
        deletedUser,
      },
    });
  } catch (err: any) {
    return next(new ErrorHandler(err.message, 400));
  }
});

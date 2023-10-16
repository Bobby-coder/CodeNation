import { Request, Response, NextFunction } from "express";
import { catchAsyncError } from "../utils/CatchAsyncError";
import ErrorHandler from "../utils/ErrorHandler";
import cloudinary from "cloudinary";
import { createCourse } from "../services/courseService";
import Course from "../model/Course";
import { redis } from "../config/redis";
import sendMail from "../utils/SendMail";

// upload course
export const uploadCourse = catchAsyncError(async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // extract course data from request body
    const data = req.body;
    // extract thumbnail from course data
    const thumbnail = data.thumbnail;

    // if thumbnail is present then upload thumbnail to cloudinary
    if (thumbnail) {
      const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
        folder: "courses",
      });

      data.thumbnail = {
        public_id: myCloud.public_id,
        url: myCloud.secure_url,
      };
    }

    // create course with course data extracted from request body
    createCourse(data, res, next);
  } catch (err: any) {
    return next(new ErrorHandler(err.message, 400));
  }
});

// edit cours
export const editCourse = catchAsyncError(async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // extract course data from request body
    const courseData = req.body;

    // extract thumbnail link from course data
    const thumbnail = courseData.thumbnail;

    // if thumbnail is present then destroy the current thumbnail & upload the new thumbnail
    if (thumbnail) {
      // destroy current thumbnail
      await cloudinary.v2.uploader.destroy(thumbnail.public_id);

      // upload new thumbnail
      const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
        folder: "courses",
      });

      courseData.thumbnail = {
        public_id: myCloud.public_id,
        url: myCloud.secure_url,
      };
    }
    // extract courseId from url parameter
    const courseId = req.params.id;

    // find course by id and update course with updated courseData
    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      { $set: courseData },
      { new: true }
    );

    // return success response
    return res.status(201).json({
      success: true,
      message: "Course updated successfully",
      data: {
        updatedCourse,
      },
    });
  } catch (err: any) {
    next(new ErrorHandler(err.message, 400));
  }
});

// get limited course data without purchasing
export const getLimitedCourseContent = catchAsyncError(async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    //extract courseId from url parameter
    const courseId = req.params.id;

    // get course from redis cache
    const isCourseCacheExist = await redis.get(courseId);

    // if course exist in redis cache then
    if (isCourseCacheExist) {
      // parse course data extracted from redis cache
      const course = JSON.parse(isCourseCacheExist);

      // return success response
      return res.status(200).json({
        success: true,
        message: "Course fetched successfully",
        data: {
          course,
        },
      });
    }
    // if course does not exist in redis cache then
    else {
      // fetch single course from mongo db except some fields which are only available to user who purchased the course
      const course = await Course.findById(courseId).select(
        "-courseData.videoUrl -courseData.suggestion -courseData.links -courseData.questions"
      );

      // save course data to redis cache
      await redis.set(courseId, JSON.stringify(courseId));

      // return success response
      return res.status(200).json({
        success: true,
        message: "Course fetched successfully",
        data: {
          course,
        },
      });
    }
  } catch (err: any) {
    return next(new ErrorHandler(err.message, 400));
  }
});

// get all courses limited data without purchasing
export const getAllCourses = catchAsyncError(async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // get all courses from redis cache
    const isAllCourseCacheExist = await redis.get("allCourses");

    // if all courses exist in redis cache then
    if (isAllCourseCacheExist) {
      // parse all courses data extracted from redis cache
      const courses = JSON.parse(isAllCourseCacheExist);

      // return success response
      return res.status(200).json({
        success: true,
        message: "All courses are fetched",
        data: {
          courses,
        },
      });
    }
    // if course does not exist in redis cache then
    else {
      // fetch all courses from mongo db except some fields which are only available to user who purchased the course
      const courses = await Course.find().select(
        "-courseData.videoUrl -courseData.suggestion -courseData.links -courseData.questions"
      );

      // save all coursea data to redis cache
      await redis.set("allCourses", JSON.stringify(courses));

      // return success response
      return res.status(200).json({
        success: true,
        message: "All courses are fetched",
        data: {
          courses,
        },
      });
    }
  } catch (err: any) {
    return next(new ErrorHandler(err.message, 400));
  }
});

// get full course access or data after purchasing
export const getFullCourseContent = catchAsyncError(async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // extract course id from url parameters
    const courseId = req.params.id;

    // extract list of courses that user purchased
    const userEnrolledCourseList = req.user?.courses;

    // extract id of purchased course
    const isCourseExist = userEnrolledCourseList?.find(
      (currentCourse: any) => currentCourse._id.toString() === courseId
    );

    // if course not purchased
    if (!isCourseExist) {
      return next(
        new ErrorHandler(
          "You have to purchase this course to access this course content",
          400
        )
      );
    }

    // find purchased courseusing its id
    const course = await Course.findById(courseId);

    // extract course data from course
    const content = course?.courseData;

    // return success response
    return res.status(200).json({
      success: true,
      message: "Fetched course succeesfully",
      data: {
        content,
      },
    });
  } catch (err: any) {
    return next(new ErrorHandler(err.message, 400));
  }
});

// add questions on specific course content or course video
export const addQuestion = catchAsyncError(async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // extract data from request body
    const { question, courseId, courseContentId } = req.body;

    // If question is not present
    if (!question) {
      let message;
      !question && (message = "Please enter your question");

      return next(new ErrorHandler(message, 400));
    }

    // find course by courseId
    const course = await Course.findById(courseId);

    // if courseContent not present
    if (!course) {
      return next(new ErrorHandler("Course ID is invalid", 400));
    }

    // find courseContent specified with courseContentId
    const courseContent = course?.courseData?.find((currCourseContent: any) =>
      currCourseContent._id.equals(courseContentId)
    );

    // if courseContent not present
    if (!courseContent) {
      return next(new ErrorHandler("Content ID is invalid", 400));
    }

    // extract user from request body
    const user = req.user;

    // define question object
    const questionObject: any = {
      user,
      question,
      questionReplies: [],
    };

    // add new question objectto course content
    courseContent.questions.push(questionObject);

    // save changes made to course
    await course?.save();

    // return success response
    return res.status(200).json({
      success: true,
      message: "Question added successfully",
      data: {
        course,
      },
    });
  } catch (err: any) {
    return next(new ErrorHandler(err.message, 400));
  }
});

// add answer & send mail to user who got reply on his/her question & send notification to admin if question owner replies on its own question
export const addAnswer = catchAsyncError(async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { answer, courseId, courseContentId, questionId } = req.body;

    const course = await Course.findById(courseId);

    if (!course) {
      return next(new ErrorHandler("Invalid course Id", 400));
    }

    const courseContent = course?.courseData.find((currContent) =>
      currContent._id.equals(courseContentId)
    );

    if (!courseContent) {
      return next(new ErrorHandler("Invalid course content Id", 400));
    }

    const questionObject = courseContent?.questions.find((currQuestion) =>
      currQuestion._id.equals(questionId)
    );

    if (!questionObject) {
      return next(new ErrorHandler("Invalid question Id", 400));
    }

    const user = req?.user;

    const answerObject: any = {
      user,
      answer,
    };

    questionObject.questionReplies?.push(answerObject);

    await course?.save();

    // if question owner replied on its own question
    if (questionObject.user._id === user?._id) {
      // send notification to admin
    }
    // if any other user or admin replied or answered on a question then send mail to question owner
    else {
      // define template data
      const templateData = {
        name: questionObject.user.name,
        title: courseContent.title,
      };

      try {
        await sendMail({
          userEmail: questionObject.user.email,
          subject: "You got a reply on your question",
          templateName: "question-reply.ejs",
          templateData,
        });
      } catch (err: any) {
        return next(new ErrorHandler(err.message, 500));
      }
    }

    return res.json({
      success: true,
      message: "Answer added successfully",
      data: {
        course,
      },
    });
  } catch (err: any) {
    return next(new ErrorHandler(err.message, 400));
  }
});

// add review
export const addReview = catchAsyncError(async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // extract data from request body
    const { review, rating } = req.body;

    // if not rating or review comment or both
    if (!review || !rating) {
      let message;
      !review && (message = "Please enter the review");
      !rating && (message = "Please enter the rating");
      !rating && !review && (message = "Please enter the review & rating");

      return next(new ErrorHandler(message, 400));
    }

    // extract user from request object
    const user = req.user;

    //extract courseId from url parameters
    const courseId = req.params.id;

    // find course by courseId
    const course = await Course.findById(courseId);

    // if course not found
    if (!course) {
      return next(new ErrorHandler("Course not found", 400));
    }

    // extract list of courses purchased by user
    const coursesPurchasedByUser = user?.courses;

    // check if user has purchased the course or not
    const isCoursePurchased = coursesPurchasedByUser?.find(
      (currCourse: any) => currCourse._id.toString() === courseId.toString()
    );

    // if not purchased
    if (!isCoursePurchased) {
      return next(
        new ErrorHandler("This course is not purchased by the user", 400)
      );
    }

    // define review object
    const reviewObject: any = {
      user,
      comment: review,
      rating,
    };

    // add reviews to course document
    course.reviews.push(reviewObject);

    let totalRating: number = 0;

    // calculate total rating of course
    course.reviews.forEach(
      (currCourse: any) => (totalRating += currCourse.rating)
    );

    // calculate average rating
    course.rating = totalRating / course.reviews.length;

    // save changes made to course document
    await course.save();

    // return success response
    return res.status(200).json({
      success: true,
      message: "Review added successfully",
      data: {
        course,
      },
    });
  } catch (err: any) {
    return next(new ErrorHandler(err.message, 400));
  }
});

// add reply to review - only admin can reply
export const addReplyToReview = catchAsyncError(async function(req:Request, res:Response, next:NextFunction){
  try{
    const {reply, courseId, reviewId} = req.body

    if(!reply){
      return next(new ErrorHandler("Please add your reply", 400))
    }

    const course = await Course.findById(courseId)

    if(!course){
      return next(new ErrorHandler("Course not found", 400))
    }

    const review = course?.reviews.find((currRev:any) => currRev._id.equals(reviewId))

    if(!review){
      return next(new ErrorHandler("Review not found", 400))
    }

    const user = req?.user

    const replyObject:any = {
      user,
      comment:reply
    }

    // if review replies list is empty or not present then initialize an empty review reply array
    if(!review.commentReplies){
      review.commentReplies = []
    }

    review.commentReplies?.push(replyObject)

    await course?.save()

    // return success response
    return res.status(200).json({
      success: true,
      message: "Review added successfully",
      data: {
        course,
      },
    });
  }catch(err:any){
    return next(new ErrorHandler(err.message, 400))
  }
})
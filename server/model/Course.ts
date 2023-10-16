import mongoose, { Document, Model, Schema } from "mongoose";
import { IUser } from "./User";

// interface for Comment schema
interface IComment extends Document {
  user: IUser;
  question: string;
  questionReplies?: IComment[];
}

// interface for review schema & model
interface IReview extends Document {
  user: IUser;
  rating: number;
  comment: string;
  commentReplies?: IComment[];
}

// interface for Link schema
interface ILink extends Document {
  title: string;
  url: string;
}

// interface for Course Data schema
interface ICourseData extends Document {
  title: string;
  description: string;
  videoUrl: string;
  videoSection: string;
  videoLength: number;
  videoPlayer: string;
  links: ILink[];
  suggestion: string;
  questions: IComment[];
}

// interface for Course schema & model
export interface ICourse extends Document {
  name: string;
  description: string;
  price: number;
  estimatePrice?: number;
  thumbnail: object;
  tags: string;
  level: string;
  demourl: string;
  benefits: { title: string }[];
  prerequisites: { title: string }[];
  reviews: IReview[];
  courseData: ICourseData[];
  rating?: number;
  purchased?: number;
}

// schema for review
const reviewSchema = new Schema<IReview>({
  user: Object,
  rating: {
    type: Number,
    default: 0,
  },
  comment: String,
  commentReplies: [Object],
});

// schema for Link
const linkSchema = new Schema<ILink>({
  title: String,
  url: String,
});

// schema for Comment
const commentSchema = new Schema<IComment>({
  user: Object,
  question: String,
  questionReplies: [Object],
});

// schema for Course content
const courseContentSchema = new Schema<ICourseData>({
  title: String,
  description: String,
  videoUrl: String,
  videoSection: String,
  videoLength: Number,
  videoPlayer: String,
  links: [linkSchema],
  suggestion: String,
  questions: [commentSchema],
});

// schema for Course
const courseSchema = new Schema<ICourse>(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    estimatePrice: {
      type: Number,
    },
    thumbnail: {
      public_id: {
        type: String,
      },
      url: {
        type: String,
      },
    },
    tags: {
      type: String,
      required: true,
    },
    level: {
      type: String,
      required: true,
    },
    demourl: {
      type: String,
      required: true,
    },
    benefits: [{ title: String }],
    prerequisites: [{ title: String }],
    reviews: [reviewSchema],
    courseData: [courseContentSchema],
    rating: {
      type: Number,
      default: 0,
    },
    purchased: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// model for Course
const Course: Model<ICourse> = mongoose.model("Course", courseSchema);

export default Course;

// course data is list of course contents

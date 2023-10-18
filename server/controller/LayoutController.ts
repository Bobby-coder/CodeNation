import { Request, Response, NextFunction } from "express";
import { catchAsyncError } from "../utils/CatchAsyncError";
import ErrorHandler from "../utils/ErrorHandler";
import cloudinary from "cloudinary";
import Layout from "../model/Layout";

// create layout - only for admin
export const createLayout = catchAsyncError(async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { type } = req.body;

    // if type already exist
    const isTypeExist = await Layout.findOne({ type });
    if (isTypeExist) {
      return next(
        new ErrorHandler(`You have already created a ${type} layout`, 400)
      );
    }

    if (type === "banner") {
      const { image, title, subTitle } = req.body;
      const myCloud = await cloudinary.v2.uploader.upload(image, {
        folder: "layout",
      });

      // define banner object
      const banner = {
        image: {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        },
        title,
        subTitle,
      };

      // create layout document
      await Layout.create({ type: "banner", banner });
    }

    // create faq layout
    if (type === "FAQ") {
      // extract faq objects List from request object. Each faq object contain a question and answer.
      const { faqList } = req.body;

      await Layout.create({ type: "FAQ", faq: faqList });
    }

    // create category layout
    if (type === "Categories") {
      // extract Category objects List from request object. Each Category object contain a question and answer.
      const { categoriesList } = req.body;

      await Layout.create({
        type: "Categories",
        categories: categoriesList,
      });
    }

    return res.status(200).json({
      success: "true",
      message: "Layout created successfully",
    });
  } catch (err: any) {
    return next(new ErrorHandler(err.message, 400));
  }
});

// edit layout - only for admin
export const editLayout = catchAsyncError(async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { type } = req.body;

    // edit banner layout
    if (type === "banner") {
      // extract updated banner data from request body
      const { image, title, subTitle } = req.body;

      // find specific banner Layout that needs to be updated
      const bannerLayout: any = await Layout.findOne({ type: "banner" });

      // if banner Layout exists then destroy the current image
      if (bannerLayout) {
        const bannerData = bannerLayout.banner;
        await cloudinary.v2.uploader.destroy(bannerData.image.public_id);
      }

      // upload new image to cloudinary
      const myCloud = await cloudinary.v2.uploader.upload(image);
      // define banner object and update layout document
      const banner = {
        image: {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        },
        title,
        subTitle,
      };

      bannerLayout.banner = banner;

      await bannerLayout?.save();
    }

    // edit faq layout
    if (type === "FAQ") {
      // extract faq objects List from request object. Each faq object contain a question and answer.
      const { faqList } = req.body;

      const faqLayout = await Layout.findOne({ type: "FAQ" });

      if (!faqLayout) {
        return next(new ErrorHandler("FAQ layout not found", 400));
      }

      faqLayout.faq = faqList;

      await faqLayout?.save();
    }

    // edit category layout
    if (type === "Categories") {
      // extract Category objects List from request object. Each Category object contain a question and answer.
      const { categoriesList } = req.body;

      const categoryLayout = await Layout.findOne({ type: "Categories" });

      if (!categoryLayout) {
        return next(new ErrorHandler("category layout not found", 400));
      }

      categoryLayout.categories = categoriesList;

      await categoryLayout?.save();
    }

    // return success response
    return res.status(200).json({
      success: "true",
      message: `${type} Layout updated successfully`,
    });
  } catch (err: any) {
    return next(new ErrorHandler(err.message, 400));
  }
});

// get layout by type
export const getLayout = catchAsyncError(async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { layoutType } = req.body;

    const layout = await Layout.findOne({ type: layoutType });

    if(!layout){
      return next(new ErrorHandler("Layout not found", 500));
    }

    return res.status(201).json({
      success: true,
      message: `${layoutType} layout fetched successfully`,
      data: {
        layout,
      },
    });
  } catch (err: any) {
    return next(new ErrorHandler(err.message, 500));
  }
});

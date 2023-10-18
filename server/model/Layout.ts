import { Schema, Model, Document, model } from "mongoose";

interface IFaqItem extends Document {
  question: string;
  answer: string;
}

interface ICategory extends Document {
  title: string;
}

interface IBannerImage extends Document {
  public_id: string;
  url: string;
}

interface ILayout extends Document {
  type: string;
  faq: IFaqItem[];
  categories: ICategory[];
  banner: {
    image: IBannerImage;
    title: string;
    subTitle: string;
  };
}

const faqItemSchema = new Schema<IFaqItem>({
  question: {
    type: String,
  },
  answer: {
    type: String,
  },
});

const categorySchema = new Schema<ICategory>({
  title: {
    type: String,
  },
});

const bannerImageSchema = new Schema<IBannerImage>({
  public_id: String,
  url: String,
});

const layoutSchema = new Schema<ILayout>({
  type: {
    type: String,
  },
  faq: [faqItemSchema],
  categories: [categorySchema],
  banner: {
    image: bannerImageSchema,
    title: String,
    subTitle: String,
  },
});

const Layout: Model<ILayout> = model("Layout", layoutSchema);

export default Layout;

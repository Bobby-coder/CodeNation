import { FC } from "react";

interface HeadingProps {
  title: string;
  description: string;
  keywords: string;
}

// Helper function to update title, description & keywords of any page
const Heading: FC<HeadingProps> = ({ title, description, keywords }) => {
  return (
    <>
      <title>{title}</title>
      <meta name="viewport" content="width=device-width initial-scale=1" />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
    </>
  );
};

export default Heading;
"use client";
import { FC, useState } from "react";
import Heading from "./utils/Heading";
import Header from "./components/Header";
import Hero from "./components/Hero";

interface PageProps {}

const Page: FC<PageProps> = (props) => {
  const [open, setOpen] = useState(false);
  const [activeItem, setActiveItem] = useState(0);

  return (
    <div>
      <Heading
        title="CodeNation"
        description="CodeNation is a plateform for students to learn and get help from teachers"
        keywords="NextJS Typescript, Tailwind, NodeJS, ExpressJS, MongoDB"
      />

      <Header open={open} setOpen={setOpen} activeItem={activeItem} />

      <Hero />
    </div>
  );
};

export default Page;

"use client";
import Link from "next/link";
import { FC, useState } from "react";
import NavItems from "../utils/NavItems";
import { ThemeSwitcher } from "../utils/ThemeSwitcher";
import { HiOutlineMenuAlt3, HiOutlineUserCircle } from "react-icons/hi";

type HeaderProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  activeItem: number;
};

const Header: FC<HeaderProps> = function ({ setOpen, activeItem }) {
  const [isFixedHeader, setIsFixedHeader] = useState(false);
  const [openSidebar, setOpenSidebar] = useState(false);

  // if scrollbar is scroolled 85px down then isFixedHeader will be true & it will make Header fixed at the top
  if (typeof window !== "undefined") {
    window.addEventListener("scroll", function () {
      if (window.scrollY > 85) {
        setIsFixedHeader(true);
      } else {
        setIsFixedHeader(false);
      }
    });
  }

  // if user clicked on screen then close the sidebar
  function handleClose(e: any) {
    if (e.target.id === "screen") {
      setOpenSidebar(false);
    }
  }

  return (
    <div className="w-full relative">
      <div
        className={`${
          isFixedHeader
            ? "fixed top-0 left-0 w-full h-[80px] z-[80] border-b dark:bg-opacity-50 dark:bg-gradient-to-b dark:from-gray-900 dark:to-black dark:border-[#ffffff1c] shadow-xl transition duration-500"
            : "w-full border-b dark:border-[#ffffff1c] h-[80px] z-[80] dark:shadow"
        }`}
      >
        <div className="w-[95%] 800px:w-[92%] m-auto py-2 h-full">
          {/*Desktop Header*/}
          <div className="w-full h-[80px] flex items-center justify-between px-3">
            {/*Logo*/}
            <div>
              <Link
                href={"/"}
                className="font-extrabold text-[22px] leading-[35px] sm:text-2xl lg:text-3xl tracking-tight font-Poppins text-black dark:text-white"
              >
                <span>Code</span>
                <span className="bg-gradient bg-clip-text text-transparent">
                  Nation
                </span>
              </Link>
            </div>
            <div className="flex items-center">
              {/*Navigation Items*/}
              <NavItems activeItem={activeItem} isMobile={false} />
              {/*Light & Dark mode Toggle*/}
              <ThemeSwitcher />
              {/*Menu button only for mobile*/}
              <div className="800px:hidden">
                <HiOutlineMenuAlt3
                  size={25}
                  className="cursor-pointer dark:text-white text-black"
                  onClick={() => setOpenSidebar(true)}
                />
              </div>
              {/*Profile Icon for 800px plus screens*/}
              <HiOutlineUserCircle
                size={25}
                className="hidden 800px:block cursor-pointer dark:text-white text-black"
                onClick={() => setOpen(true)}
              />
            </div>
          </div>
        </div>
        {/*Mobile Side Bar*/}
        {openSidebar && (
          <div
            className="fixed w-full h-screen top-0 left-0 z-[999] dark:bg-[unset] bg-[#0000024]"
            onClick={handleClose}
            id="screen"
          >
            <div className="w-[70%] fixed z-[9999] h-screen bg-white dark:bg-slate-900 dark:bg-opacity-90 top-0 right-0">
              {/*Navigation Items*/}
              <NavItems activeItem={activeItem} isMobile={true} />
              {/*Profile Icon*/}
              <HiOutlineUserCircle
                size={25}
                className="cursor-pointer ml-5 my-6 text-black dark:text-white"
                onClick={() => setOpen(true)}
              />
              <br />
              <p className="text-[16px] px-2 pl-5 text-black dark:text-white">
                Copyright © {new Date().getFullYear()} CodeNation
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;

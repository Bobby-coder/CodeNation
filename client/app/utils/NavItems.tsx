import Link from "next/link";
import { FC } from "react";

export const navItemsData = [
  {
    name: "Courses",
    url: "/courses",
  },
  {
    name: "About",
    url: "/about",
  },
  {
    name: "Policy",
    url: "/policy",
  },
  {
    name: "FAQ",
    url: "/faq",
  },
];

type NavItemProps = {
  activeItem: number;
  isMobile: boolean;
};

// Navigation Bar Component
const NavItems: FC<NavItemProps> = function ({ activeItem, isMobile }) {
  return (
    <>
      {/*Navigation bar for 800px + screens*/}
      <div className="hidden 800px:flex">
        {navItemsData &&
          navItemsData.map((currItem, index) => {
            return (
              <>
                {/*Single Navigation Item*/}
                <Link href={currItem.url} key={crypto.randomUUID()} passHref>
                  <span
                    className={`${
                      activeItem === index
                        ? "dark:text-[#37a39a] text-[crimson]"
                        : "dark:text-white text-black"
                    } text-[18px] px-6 font-Poppins font-[400]`}
                  >
                    {currItem.name}
                  </span>
                </Link>
              </>
            );
          })}
      </div>
      {/*Navigation bar for mobile screens*/}
      {isMobile && (
        <div className="800px:hidden mt-5 flex-col">
          {/*Logo*/}
          <div className="text-center">
            <Link
              href={"/"}
              className="text-[25px] font-Poppins font-[500] text-black dark:text-white"
            >
              CodeNation
            </Link>
          </div>
          <div className="flex flex-col gap-8 mt-10">
            {navItemsData &&
              navItemsData.map((currItem, index) => {
                return (
                  <>
                    {/*Single Navigation Item*/}
                    <Link
                      href={currItem.url}
                      key={crypto.randomUUID()}
                      passHref
                    >
                      <span
                        className={`${
                          activeItem === index
                            ? "dark:text-[#37a39a] text-[crimson]"
                            : "dark:text-white text-black"
                        } text-[18px] px-6 font-Poppins font-[400]`}
                      >
                        {currItem.name}
                      </span>
                    </Link>
                  </>
                );
              })}
          </div>
        </div>
      )}
    </>
  );
};

export default NavItems;

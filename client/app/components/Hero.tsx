import Link from "next/link";
import { FC } from "react";
type HeroProps = {};

const Hero: FC<HeroProps> = function (props) {
  return (
    <>
      <div className="w-[95%] m-auto flex justify-center items-center h-[70vh] 800px:h-[90vh] translate-y-0 opacity-100 transition-all duration-1000 ease-in-out">
        <div className="w-[90%] 800px:w-[80%]">
          {/*Heading*/}
          <h1 className="font-extrabold text-[25px] leading-[35px] sm:text-3xl lg:text-5xl tracking-tight text-center text-black dark:text-white font-Poppins 800px:leading-[60px]">
            Unleash your inner{" "}
            <span className="bg-gradient bg-clip-text text-transparent">
              programming
            </span>{" "}
            <br />
            <span className="bg-gradient bg-clip-text text-transparent">
              genius
            </span>{" "}
            with our community.
          </h1>
          <div className="pt-2"></div>
          <div className="w-full text-center">
            {/*Description for desktop screens*/}
            <p className="800px:block hidden font-poppins 800px:text-[22px] 800px:leading-[32px] text-[16px] leading-[23px] font-semibold dark:text-[#A3B3BC] text-gray-500 mt-5 mb-10">
              Empower your programming journey with CodeNation <br /> dedicated
              community and comprehensive resources.
            </p>
            {/*Description for mobile screens*/}
            <p className="800px:hidden block font-poppins 800px:text-[22px] 800px:leading-[32px] text-[16px] leading-[25px] font-semibold dark:text-[#A3B3BC] text-gray-500 mt-5 mb-10">
              Empower your programming journey with CodeNation dedicated community
              and comprehensive resources.
            </p>
            {/*Explore courses button*/}
            <div className="flex w-full justify-center font-Poppins font-[600]">
              <Link href="/courses">
                <div className="flex flex-row justify-center items-center py-3 px-6 rounded-full cursor-pointer bg-[#2190ff] min-h-[45px] w-full text-[16px] font-Poppins font-semibold">
                  Explore Courses
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Hero;

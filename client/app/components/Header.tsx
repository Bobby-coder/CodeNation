"use client";
import Link from "next/link";
import Image from "next/image";
import { FC, useState, useEffect } from "react";
import NavItems from "../utils/NavItems";
import { ThemeSwitcher } from "../utils/ThemeSwitcher";
import { HiOutlineMenuAlt3, HiOutlineUserCircle } from "react-icons/hi";
import CustomModal from "../utils/CustomModal";
import Login from "./Login";
import SignUp from "./SignUp";
import Verification from "./Verification";
import { useSelector } from "react-redux";
import avatar from "../../public/assets/avatar.png";
import Avatar from "react-avatar";
import {
  useLogoutQuery,
  useSocialAuthMutation,
} from "@/redux/features/auth/authApi";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

type HeaderProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  activeItem: number;
  route: string;
  setRoute: (route: string) => void;
};

const Header: FC<HeaderProps> = function ({
  setOpen,
  activeItem,
  setRoute,
  open,
  route,
}) {
  const [isFixedHeader, setIsFixedHeader] = useState(false);
  const [openSidebar, setOpenSidebar] = useState(false);
  const { user } = useSelector((state: any) => state.auth);
  const { data: sessionData } = useSession();

  const [socialAuth, { isSuccess, error }] = useSocialAuthMutation();

  const [logout, setLogout] = useState(false);
  const {} = useLogoutQuery(undefined, {
    skip: !logout ? true : false,
  });

  useEffect(() => {
    if (!user) {
      if (sessionData) {
        socialAuth({
          email: sessionData?.user?.email,
          name: sessionData?.user?.name,
          avatar: sessionData?.user?.image,
        });
      }
    }
    if (sessionData===null) {
      if (isSuccess) {
        toast.success("Login Successfull");
      }
    }
    if (sessionData===null) {
      setLogout(true);
    }
  }, [isSuccess, error]);

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
              {user && (
                <Link href="/profile">
                  <Image
                    src={user.avatar ? user.avatar.url : avatar}
                    alt="user image"
                    className="w-[30px] h-[30px] rounded-full cursor-pointer"
                    width={30}
                    height={30}
                  />
                </Link>
              )}
              
            {
              !user && (
                <Image
                  src={avatar}
                  alt="user image"
                  className="w-[30px] h-[30px] rounded-full cursor-pointer"
                  onClick={() => setOpen(true)}
                  width={30}
                  height={30}
                />
              )
            }
              {/*Profile picture when user has used oauth log in*/}
              {/* {!user && sessionData?.user?.image && (
                <Link href="/profile">
                  <Image
                    src={sessionData?.user?.image}
                    alt="user image"
                    className="w-[30px] h-[30px] rounded-full cursor-pointer"
                    width={30}
                    height={30}
                  />
                </Link>
              )} */}

              {/*if user does not have any profile picture, show profile picture generated from user's first & last name initials*/}
              {/* {user && !user.avatar && (
                <Link href="/profile">
                  <Avatar
                    name={user.name}
                    round={true}
                    size="30"
                    textSizeRatio={1.8}
                    maxInitials={1}
                  />
                </Link>
              )} */}

              {/*Profile picture when user is not logged in*/}
              {/* {!user && !sessionData && (
                <Image
                  src={avatar}
                  alt="user image"
                  className="w-[30px] h-[30px] rounded-full cursor-pointer"
                  onClick={() => setOpen(true)}
                />
              )} */}
            </div>
          </div>
        </div>
        {/*Mobile Navigation side Bar*/}
        {openSidebar && (
          <div
            className="fixed w-full h-screen top-0 left-0 z-[999] dark:bg-[unset] bg-[#0000024]"
            onClick={handleClose}
            id="screen"
          >
            <div className="w-[70%] fixed z-[9999] h-screen bg-white dark:bg-slate-900 dark:bg-opacity-90 top-0 right-0">
              {/*Navigation Items*/}
              <NavItems activeItem={activeItem} isMobile={true} />
              {/*Profile picture when user has used oauth log in*/}
              {!user && sessionData?.user?.image && (
                <Link href="/profile">
                  <Image
                    src={sessionData?.user?.image}
                    alt="user image"
                    className="w-[30px] h-[30px] rounded-full cursor-pointer]"
                    width={30}
                    height={30}
                  />
                </Link>
              )}

              {/*if user does not have any profile picture, show profile picture generated from user's first & last name initials*/}
              {user && !user.avatar && (
                <Link href="/profile">
                  <Avatar
                    name={user.name}
                    round={true}
                    size="30"
                    textSizeRatio={1}
                  />
                </Link>
              )}

              {/*Profile picture when user is not logged in*/}
              {!user && !sessionData && (
                <Image
                  src={avatar}
                  alt="user image"
                  className="w-[30px] h-[30px] rounded-full cursor-pointer"
                  onClick={() => setOpen(true)}
                />
              )}
              <br />
              <p className="text-[16px] px-2 pl-5 text-black dark:text-white">
                Copyright © {new Date().getFullYear()} CodeNation
              </p>
            </div>
          </div>
        )}
      </div>

      {/*Logout Modal - If url end point is sign-up then show Sign-up modal*/}
      {route === "login" && (
        <>
          {open && (
            <CustomModal
              open={open}
              setOpen={setOpen}
              setRoute={setRoute}
              activeItem={activeItem}
              component={Login}
            />
          )}
        </>
      )}

      {/*Logout Modal - If url end point is sign-up then show Sign-up modal*/}
      {route === "sign-up" && (
        <>
          {open && (
            <CustomModal
              open={open}
              setOpen={setOpen}
              setRoute={setRoute}
              activeItem={activeItem}
              component={SignUp}
            />
          )}
        </>
      )}

      {/*OTP Verification Modal - If url end point is verification then show otp verification modal**/}
      {route === "verification" && (
        <>
          {open && (
            <CustomModal
              open={open}
              setOpen={setOpen}
              setRoute={setRoute}
              activeItem={activeItem}
              component={Verification}
            />
          )}
        </>
      )}
    </div>
  );
};

export default Header;

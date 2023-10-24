import { useLoadUserQuery } from "@/redux/features/api/apiSlice";
import { FC, ReactNode, useState } from "react";
import Loader from "./Loader";

interface CustomProps {
  children: ReactNode;
}

const Custom: FC<CustomProps> = function ({ children }) {
  const { isLoading } = useLoadUserQuery({});

  return <>{isLoading ? <Loader /> : <> {children} </>}</>;
};

export default Custom;

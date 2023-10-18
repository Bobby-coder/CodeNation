import express from "express";
import { authorizedRoles, isAuthenticated } from "../middleware/auth";
import { createLayout, editLayout, getLayout } from "../controller/LayoutController";

const layoutRouter = express.Router();

layoutRouter.post(
  "/create-layout",
  isAuthenticated,
  authorizedRoles("admin"),
  createLayout
);

layoutRouter.put(
  "/edit-layout",
  isAuthenticated,
  authorizedRoles("admin"),
  editLayout
);

layoutRouter.get("/get-layout", isAuthenticated, getLayout)
export default layoutRouter;

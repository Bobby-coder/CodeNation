import express from "express";
import { authorizedRoles, isAuthenticated } from "../middleware/auth";
import { createOrder, getAllOrders } from "../controller/OrderController";

const orderRouter = express.Router();

orderRouter.post("/order/create", isAuthenticated, createOrder);

orderRouter.get("/order/all-orders",isAuthenticated, authorizedRoles("admin"), getAllOrders)

export default orderRouter;

import express from "express";
import { body } from "express-validator";
import {
  createOrder,
  paymentVerification,
} from "../controllers/planController.js";
import { authOrApiKey } from "../middleware/authOrApiKey.js";
import { isAdmin } from "../middleware/isAdmin.js";

const router = express.Router();

// Route to create a Razorpay order for the selected plan
router.post(
  "/create-order",
  authOrApiKey,
  body("plan")
    .isString()
    .notEmpty()
    .withMessage("Plan is required and must be a string"),
  createOrder,
);

// Route to verify Razorpay payment and update user plan
router.post(
  "/verify-payment",
  authOrApiKey,
  body("razorpay_order_id").notEmpty().withMessage("Order ID is required"),
  body("razorpay_payment_id").notEmpty().withMessage("Payment ID is required"),
  body("razorpay_signature").notEmpty().withMessage("Signature is required"),
  body("plan").isString().notEmpty().withMessage("Plan is required"),
  paymentVerification,
);

router.use((req, res) => {
  res
    .status(400)
    .send({ status: false, message: "invalid http request in planRoutes" });
});

export default router;

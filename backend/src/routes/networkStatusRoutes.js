import express from "express";
import { getNetworkStatus } from "../controllers/networkStatusController.js";
import { authOrApiKey } from "../middleware/authOrApiKey.js";
import { isAdmin } from "../middleware/isAdmin.js";

const router = express.Router();

router.get("/getNetworkStatus", authOrApiKey, getNetworkStatus);

router.use((req, res) => {
  res
    .status(400)
    .send({
      status: false,
      message: "invalid http request in networkStatusRoutes",
    });
});

export default router;

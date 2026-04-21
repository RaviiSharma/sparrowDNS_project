import express from "express";
import {
  getApiKeys,
  createApiKey,
  updateApiKey,
  deleteApiKey,
  getApiUsage,
  regenerateApiKey
} from "../controllers/apiKeyController.js";
// import { authOrApiKey } from "../middleware/authMiddleware.js";
import { authOrApiKey } from "../middleware/authOrApiKey.js";


const router = express.Router();

// All routes require authentication
router.use(authOrApiKey);

// API Key routes
router.get("/getApiKeys", getApiKeys);
router.post("/createApiKey", createApiKey);
router.put("/updateApiKey/:id", updateApiKey);
router.delete("/deleteApiKey/:id", deleteApiKey);
router.post("/regenerateApiKey/:id", regenerateApiKey);

// API Usage routes
router.get("/getApiKeyUsage", getApiUsage);


router.use((req, res) => {
    res
        .status(400)
        .send({ status: false, message: "invalid http request in apiKeyRoutes" });
});

export default router;

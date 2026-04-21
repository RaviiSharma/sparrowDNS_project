import express from "express";
import {
  listDefaultNameservers,
  listWhiteLabelNameservers,
  saveCustomNameserver,
} from "../controllers/nameserverController.js";

import { authOrApiKey } from "../middleware/authOrApiKey.js";
import { isAdmin } from "../middleware/isAdmin.js";

const router = express.Router();

router.get("/listDefaultNameservers", listDefaultNameservers); // default nameservers, public
router.get(
  "/listWhiteLabelNameservers",
  authOrApiKey,
  listWhiteLabelNameservers,
); // custom, auth required
router.post("/saveCustomNameserver", authOrApiKey, saveCustomNameserver); // save new custom

router.use((req, res) => {
  res
    .status(400)
    .send({
      status: false,
      message: "invalid http request in nameserverRoutes",
    });
});

export default router;

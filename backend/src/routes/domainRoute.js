// routes/domainApi.js
import express from "express";
import{addDomainsToMonitore,listMonitoredDomains,updateEmailsOfDomain,log} from "../controllers/domainController.js";
import {authOrApiKey} from '../middleware/authOrApiKey.js';
import { isAdmin } from '../middleware/isAdmin.js';



const router = express.Router();


router.post("/addDomainsToMonitore",authOrApiKey,isAdmin,addDomainsToMonitore)
router.get("/listMonitoredDomains",authOrApiKey,isAdmin,listMonitoredDomains)
router.put("/updateEmailsOfDomain",authOrApiKey,isAdmin,updateEmailsOfDomain)
router.get("/log/ActiveAlerts",authOrApiKey,isAdmin,log)


router.use((req, res) => {
    res
        .status(400)
        .send({ status: false, message: "invalid http request in domainRoutes" });
});


export default router;

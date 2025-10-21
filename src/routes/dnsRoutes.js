import express from 'express';
import { createZone, addRecord, listZones, getRecord, updateRecord, deleteRecord, getZoneByName, deleteZone, getServerStatus,systemHealthController } from '../controllers/dnsController.js';
import{userRegistration} from '../controllers/userController.js';

import { scanDomainController } from '../controllers/dnsController.js';

import { createZoneAndImportController } from "../controllers/dnsController.js";

// import {scanDomainNameSever} from "../controllers/dnsController.js";

const router = express.Router();
//
// router.post("/dns/scanDomainNameSever", scanDomainNameSever);

// POST /api/dns/import-zone
router.post("/dns/import-zone", createZoneAndImportController);

//scan domain
router.post('/dns/scan', scanDomainController);

//user
router.post("/userRegistration",userRegistration);

// GET /api/system/health
router.get("/health", systemHealthController);
// GET Server Status
router.get('/server-status', getServerStatus);

//zones
router.post('/create-zone', createZone);
router.get('/get-zone', getZoneByName);
router.delete('/delete-zone', deleteZone);
router.get('/list-zones', listZones);

//records
router.post('/add-record', addRecord);
router.post('/get-recordbyfilter', getRecord);
/**if you want to rename record , please give newRecordName field */
router.post('/update-record', updateRecord); //CRUD + update record types (5 api)
router.post('/delete-record', deleteRecord);



export default router;

import express from 'express';
import { createZone, addRecord, listZones, getRecord, updateRecord, deleteRecord, getZoneByName, deleteZone, getServerStatus,systemHealthController,} from '../controllers/dnsController.js';
import{userRegistration} from '../controllers/userController.js';

import { scanDomainController } from '../controllers/dnsController.js';

import { createZoneAndImportController } from "../controllers/dnsController.js";

import { checkNameserverController } from "../controllers/dnsController.js";


import  { getDNSQueries24h }  from "../controllers/dnsController.js";
import  { getZoneDNSQueries24h }  from "../controllers/dnsController.js";



// scan nameservers for a domain

const router = express.Router();

//zone_dnsQueries_24h
router.post('/dns/zone_dnsQueries_24h', getZoneDNSQueries24h);

//dnsQueries_24h
router.get('/dns/dnsQueries_24h', getDNSQueries24h);

// legacy (commented):
router.post("/dns/check-nameserver", checkNameserverController);



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

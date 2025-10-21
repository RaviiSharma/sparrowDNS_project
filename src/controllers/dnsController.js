import { createZoneService, getZoneByNameService,addRecordService, listZonesService, getRecordService, updateRecordService, deleteRecordService, deleteZoneService, } from '../services/powerdnsService.js';

import { validateZoneType } from "../utils/validateZoneType.js";
import { validateZoneFields } from "../utils/validateZoneFields.js";

import ZoneMeta from "../models/zoneMetaModel.js";
import ActivityLog from "../models/activityLogModel.js";


const zoneNameRegex = /^(?!-)[a-zA-Z0-9-]{1,63}(?<!-)(\.[a-zA-Z0-9-]{1,63}(?<!-))*\.$/;


import axios from "axios";

// PowerDNS credentials from .env
const PDNS_URL = process.env.PDNS_URL;          // e.g. "http://138.199.159.199:8081/api/v1"
const PDNS_API_KEY = process.env.PDNS_API_KEY;  // your API key

if (!PDNS_URL) {
  console.error("❌ Missing PDNS_URL in .env file");
}

// Axios client for PowerDNS API
const client = axios.create({
  baseURL: PDNS_URL,
  headers: {
    "X-API-Key": PDNS_API_KEY,
    "Content-Type": "application/json",
  },
});

import mongoose from "mongoose";

// ✅ Controller: System Health Check
export const systemHealthController = async (req, res) => {
  const healthReport = {
    backend: false,
    mongoDB: false,
    powerDNS: false,
    details: {},
  };

  try {
    // 🧩 Backend
    healthReport.backend = true;
    healthReport.details.backend = "Backend server is running.";

    // 🗄️ MongoDB Connection Check
    if (mongoose.connection.readyState === 1) {
      healthReport.mongoDB = true;
      healthReport.details.mongoDB = "MongoDB connected.";
    } else {
      healthReport.details.mongoDB = "MongoDB not connected.";
    }

    // 🌐 PowerDNS Connection Check
    try {
      const response = await client.get("/servers/localhost");
      if (response?.status === 200) {
        healthReport.powerDNS = true;
        healthReport.details.powerDNS = "PowerDNS reachable.";
      }
    } catch (err) {
      healthReport.details.powerDNS = `PowerDNS unreachable: ${err.message}`;
    }

    // 🟢 Final health status
    const allHealthy = healthReport.backend && healthReport.mongoDB && healthReport.powerDNS;

    return res.status(allHealthy ? 200 : 500).json({
      status: allHealthy,
      message: allHealthy
        ? "✅ All systems operational."
        : "⚠️ Some systems are down.",
      data: healthReport,
      timestamp: new Date().toISOString(),
    });

  } catch (err) {
    console.error("❌ System health check failed:", err);
    return res.status(500).json({
      status: false,
      message: "Internal server error while checking system health.",
      error: err.message,
    });
  }
};




//zones 

export const listZones = async (req, res) => {
  try {
    const zones = await listZonesService();

    //  Check if zones exist
    if (!zones || zones.length === 0) {
      return res.status(404).json({
        status: false,
        message: "No DNS zones found.",
        data: [],
      });
    }

    //  Successful response
    return res.status(200).json({
      status: true,
      message: "Zones fetched successfully.",
      count: zones.length,
      data: zones,
    });

  } catch (err) {
    console.error("Error in listZones controller:", err);

    if (err instanceof Error) {
      return res.status(400).json({ status: false, message: err.message });
    }

    return res.status(500).json({
      status: false,
      message: "Internal Server Error while fetching zones.",
    });
  }
};


export const createZone = async (req, res) => {
  try {
    const { name, kind, masters = [], nameservers = [], owner, description, tags } = req.body;

    // Validate zone name
    if (!name || typeof name !== "string") {
      return res
        .status(400)
        .json({ status: false, message: "Zone name (string) is required." });
    }

    if (!zoneNameRegex.test(name)) {
      return res.status(400).json({
        status: false,
        message: `Invalid zone name '${name}'. Must be a valid domain ending with a dot.`,
      });
    }

    //  Check Zone Type
    const { valid: validKind, message: kindMsg } = validateZoneType(kind);
    if (!validKind)
      return res.status(400).json({ status: false, message: kindMsg });

    //  Check Masters & Nameservers
    const { valid, message } = validateZoneFields(kind, masters, nameservers);
    if (!valid)
      return res.status(400).json({ status: false, message });

    //  Normalize zone name to end with a dot
    const formattedName = name.endsWith(".") ? name : name + ".";

    //  Create Zone via PowerDNS API
    const data = await createZoneService({
      name: formattedName,
      kind,
      masters,
      nameservers,
    });

    // If zone already exists
    if (data?.exists) {
      return res
        .status(409)
        .json({ status: false, message: `Zone '${formattedName}' already exists in pdns.` });
    }
    const existingZone = await ZoneMeta.findOne({ zoneName: name });
    if (existingZone) {
      return res.status(409).json({ status: false, message: `Zone '${name}' already exists in MongoDB metadata.` });
    }

    // 2️⃣ Store metadata in MongoDB
    const meta = await ZoneMeta.create({
      zoneName: formattedName,
      owner: owner, // Assuming owner ID is passed in req.body or derived from auth
      description: description || '',
      tags: tags || [],
      syncedWithPDNS: true,
    });

    // 3️⃣ Log activity in MongoDB
    await ActivityLog.create({
      userId: owner, // Assuming owner ID is the userId
      action: 'CREATE_ZONE',
      target: formattedName,
      details: { kind, masters, nameservers, description, tags, zoneMetaId: meta._id },
      ip: req.ip || 'unknown', // Assuming req.ip is available
    });

    //  Success response
    return res.status(201).json({
      status: true,
      message: `Zone '${formattedName}' created successfully.`,
      data,
    });

  } catch (err) {
    console.error(" Error in createZone controller:", err);

    //  Friendly duplicate key error handling
    if (err.code === 11000 && err.keyPattern?.zoneName) {
      return res.status(409).json({
        status: false,
        message: `Zone '${err.keyValue.zoneName}' already exists in MongoDB.`,
      });
    }


    if (err instanceof Error) {
      return res.status(400).json({ status: false, message: err.message });
    }

    return res
      .status(500)
      .json({ status: false, message: "Internal Server Error." });
  }
};


export const getZoneByName = async (req, res) => {
  try {
    const { zoneName } = req.body;

    if (!zoneName || typeof zoneName !== 'string') {
      return res.status(400).send({ status: false, message: 'Zone name (string) is required.' });
    }

    const zoneData = await getZoneByNameService(zoneName);

    if (zoneData?.notFound) {
      return res.status(404).send({ status: false, message: `Zone '${zoneName}' not found.` });
    }

    return res.status(200).send({
      status: true,
      message: `Zone '${zoneName}' fetched successfully.`,
      data: zoneData,
    });

  } catch (err) {
    console.error('Error in getZoneByName controller:', err);
    return res.status(500).send({ status: false, message: 'Internal Server Error.' });
  }
};

/** ================================
 *  DELETE ZONE CONTROLLER
 *  ================================ */
export const deleteZone = async (req, res) => {
  try {
    const { zoneName } = req.body;
    const userId = req.user?._id || null; // From JWT middleware (if implemented)

    if (!zoneName || typeof zoneName !== 'string') {
      return res.status(400).send({ status: false, message: 'Zone name (string) is required.' });
    }

    const data = await deleteZoneService(zoneName);

    if (data?.notFound) {
      return res.status(404).send({ status: false, message: `Zone '${zoneName}' not found in pdns.` });
    }

    // ✅ 2️⃣ Delete metadata from MongoDB (if exists)
    const deletedMeta = await ZoneMeta.findOneAndDelete({ zoneName });

    // ✅ 3️⃣ Log the delete action
    await ActivityLog.create({
      userId:"60d0fe4f53115d0015a1a1a1",
      action: "DELETE_ZONE",
      target: zoneName,
      details: {
        from: "PowerDNS + MongoDB",
        metaDeleted: !!deletedMeta,
      },
      ip: req.ip||unknown,
    });

    return res.status(200).json({
      status: true,
      message: `Zone '${zoneName}' deleted successfully from PowerDNS and MongoDB.`,
      data: {
        pdns: data,
        metaDeleted: !!deletedMeta,
      },
    });

  } catch (err) {
    console.error('Error in deleteZone controller:', err);
    return res.status(500).send({ status: false, message: 'Internal Server Error.' });
  }
};

// Regex for zone name validation

// Helper function to validate nameservers
const validateNameservers = (res, nameservers) => {
  if (!Array.isArray(nameservers) || nameservers.length === 0) {
    return res.status(400).send({ status: false, message: 'Nameservers (array of strings) are required.' });
  }
  for (const ns of nameservers) {
    if (typeof ns !== 'string' || !zoneNameRegex.test(ns)) {
      return res.status(400).send({ status: false, message: `Invalid nameserver: '${ns}'. Must be a valid hostname ending with a dot.` });
    }
  }
  return null;
};

/** RECORD VALIDATION HELPERS **/

// Helper function to validate record content based on type
const validateRecordContent = (res, type, content) => {
  switch (type) {
    case 'A':
      if (!/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(content)) {
        return res.status(400).send({ status: false, message: `Invalid content for A record. Must be a valid IPv4 address.` });
      }
      break;

    case 'AAAA':
      if (
        !/^([0-9a-fA-F]{1,4}:){7}([0-9a-fA-F]{1,4}|:)$|^((?:[0-9A-Fa-f]{1,4}(?::[0-9A-Fa-f]{1,4})*)?)::((?:[0-9A-Fa-f]{1,4}(?::[0-9A-Fa-f]{1,4})*)?)$/.test(
          content
        )
      ) {
        return res.status(400).send({ status: false, message: `Invalid content for AAAA record. Must be a valid IPv6 address.` });
      }
      break;

    case 'CNAME':
    case 'NS':
      if (!/^([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.$/.test(content)) {
        return res.status(400).send({ status: false, message: `Invalid content for ${type} record. Must be a valid hostname ending with a dot.` });
      }
      break;

    case 'MX':
      if (!/^\d+\s+([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.$/.test(content)) {
        return res.status(400).send({ status: false, message: `Invalid content for MX record. Must be in format '<preference> <hostname>.'` });
      }
      break;

    case 'TXT':
      if (typeof content !== 'string') {
        return res.status(400).send({ status: false, message: `Invalid content for TXT record. Must be a string.` });
      }
      break;

    case 'SRV':
      if (!/^\d+\s+\d+\s+\d+\s+([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.$/.test(content)) {
        return res.status(400).send({ status: false, message: `Invalid content for SRV record. Must be in format '<priority> <weight> <port> <target>.'` });
      }
      break;

    default:
      if (typeof content !== 'string' || content.trim() === '') {
        return res.status(400).send({ status: false, message: `Invalid content for ${type} record. Must be a non-empty string.` });
      }
      break;
  }
};

// Regex for record name validation
const recordNameRegex = /^(?![0-9-])[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.$/;

// Allowed DNS record types
const allowedTypes = [
  'A', 'AAAA', 'CNAME', 'MX', 'NS', 'SOA', 'TXT',
  'PTR', 'SRV', 'CAA', 'SSHFP', 'DNSKEY', 'RRSIG',
  'NSEC', 'NSEC3', 'NSEC3PARAM', 'DS', 'TLSA',
  'SPF', 'HINFO', 'NAPTR', 'LOC'
];

/** ================================
 *  ADD RECORD CONTROLLER
 *  ================================ */
export const addRecord = async (req, res) => {
  try {
    const { zone, recordName, type, content, ttl } = req.body;

    // ===== Validation =====
    if (!zone || typeof zone !== 'string') {
      return res.status(400).send({ status: false, message: 'Zone name (string) is required.' });
    }

    if (!recordName || typeof recordName !== 'string') {
      return res.status(400).send({ status: false, message: 'Record name (string) is required.' });
    }

    if (!recordNameRegex.test(recordName)) {
      return res.status(400).send({ status: false, message: `Invalid record name '${recordName}'. Hostname cannot start with a number or hyphen and must end with a dot.` });
    }

    if (!type || typeof type !== 'string') {
      return res.status(400).send({ status: false, message: 'Record type (string) is required.' });
    }

    const recordType = type.toUpperCase();
    if (!allowedTypes.includes(recordType)) {
      return res.status(400).send({ status: false, message: `Invalid record type '${type}'. Allowed types: ${allowedTypes.join(', ')}` });
    }

    if (!content || typeof content !== 'string') {
      return res.status(400).send({ status: false, message: 'Record content (string) is required.' });
    }

    // Validate record content by type
    const contentError = validateRecordContent(res, recordType, content);
    if (contentError) return contentError;

    if (ttl && (typeof ttl !== 'number' || ttl < 60)) {
      return res.status(400).send({ status: false, message: 'TTL must be a number greater than or equal to 60.' });
    }

    // ===== Service Call =====
    const data = await addRecordService(req.body);

    // ✅ Handle zone not found
    if (data?.notFound) {
      return res.status(404).send({ status: false, message: `Zone '${zone}' not found in PowerDNS.` });
    }

    return res.status(201).send({
      status: true,
      message: 'Record added successfully.',
      data,
    });

  } catch (err) {
    console.error('Error in addRecord:', err);
    return res.status(500).send({ status: false, message: 'Internal Server Error.' });
  }
};

/** ================================
 *  GET RECORD CONTROLLER
 *  ================================ */
export const getRecord = async (req, res) => {
  try {
    const { zone, recordName, type } = req.body;

    if (!zone || typeof zone !== 'string') {
      return res.status(400).send({ status: false, message: 'Zone (string) is required.' });
    }

    if (recordName && typeof recordName !== 'string') {
      return res.status(400).send({ status: false, message: 'recordName must be a string if provided.' });
    }

    if (type && typeof type !== 'string') {
      return res.status(400).send({ status: false, message: 'type must be a string if provided.' });
    }

    const data = await getRecordService({ zone, recordName, type });

    // ✅ Handle zone not found
    if (data?.notFound) {
      return res.status(404).send({ status: false, message: `Zone '${zone}' not found in PowerDNS.` });
    }

    // ✅ Handle empty results
    if (!data || data.length === 0) {
      return res.status(404).send({ status: false, message: 'No record found for the given zone/criteria.' });
    }

    return res.status(200).send({
      status: true,
      message: 'Record(s) found.',
      count: data.length,
      data,
    });

  } catch (err) {
    console.error('Error in getRecord:', err.message);
    return res.status(500).send({ status: false, message: 'Internal Server Error.' });
  }
};
/** ================================
 *  UPDATE RECORD CONTROLLER
 *  ================================ */

export const updateRecord = async (req, res) => {
  try {
    const { zone, recordName, type, records, ttl, newRecordName } = req.body;

    const data = await updateRecordService({ zone, recordName, type, records, ttl, newRecordName });
    
    if (data?.notFound) {
      return res
        .status(404)
        .send({ status: false, message: `Zone '${req.body.zone}' not found in PowerDNS.` });
    }

    if (!zone || typeof zone !== 'string') {
      return res.status(400).send({ status: false, message: 'Zone (string) is required.' });
    }

    if (!recordName || typeof recordName !== 'string') {
      return res.status(400).send({ status: false, message: 'recordName (string) is required for update.' });
    }

    if (!recordNameRegex.test(recordName)) {
      return res.status(400).send({ status: false, message: `Invalid record name '${recordName}'. Hostname cannot start with a number or hyphen.` });
    }

    if (!type || typeof type !== 'string') {
      return res.status(400).send({ status: false, message: 'Record type (string) is required.' });
    }

    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).send({ status: false, message: 'records (array) with at least one record is required.' });
    }

    const recordType = type.toUpperCase();
    if (!allowedTypes.includes(recordType)) {
      return res.status(400).send({
        status: false,
        message: `Invalid record type: '${type}'. Allowed types are: ${allowedTypes.join(', ')}`
      });
    }

    // ✅ Validate each record content
    for (const record of records) {
      if (!record.content || typeof record.content !== 'string') {
        return res.status(400).send({
          status: false,
          message: 'Each record in records array must have content (string).'
        });
      }

      // ✅ Correct validation call
      const validationError = validateRecordContent(res, recordType, record.content);
      if (validationError) return validationError;
    }

    if (newRecordName && typeof newRecordName !== 'string') {
      return res.status(400).send({ status: false, message: 'newRecordName must be a string if provided.' });
    }

    if (ttl && (typeof ttl !== 'number' || ttl < 60)) {
      return res.status(400).send({ status: false, message: 'TTL must be a number greater than or equal to 60.' });
    }

    


    return res.status(200).send({
      status: true,
      message: newRecordName ? 'Record renamed and updated successfully.' : 'Record updated successfully.',
      data,
    });

  } catch (err) {
    console.error('Error in updateRecord:', err);
    return res.status(500).send({ status: false, message: 'Internal Server Error.' });
  }
};


/** ================================
 *  DELETE RECORD CONTROLLER
 *  ================================ */
export const deleteRecord = async (req, res) => {
  try {
    const { zone, recordName, type } = req.body;

    if (!zone || typeof zone !== 'string') {
      return res.status(400).send({ status: false, message: 'Zone (string) is required.' });
    }

    if (!recordName || typeof recordName !== 'string') {
      return res.status(400).send({ status: false, message: 'recordName (string) is required for update.' });
    }

    if (!recordNameRegex.test(recordName)) {
      return res.status(400).send({ status: false, message: `Invalid record name '${recordName}'. Hostname cannot start with a number or hyphen.` });
    }

    if (!type || typeof type !== 'string') {
      return res.status(400).send({ status: false, message: 'Record type (string) is required.' });
    }
    const recordType = type.toUpperCase();
    if (!allowedTypes.includes(recordType)) {
      return res.status(400).send({
        status: false,
        message: `Invalid record type: '${type}'. Allowed types are: ${allowedTypes.join(', ')}`
      });
    }


    const data = await deleteRecordService({ zone, recordName, type });

    if (data?.notFound) {
      return res
        .status(404)
        .send({ status: false, message: `Zone '${zone}' not found in PowerDNS.` });
    }

    if (data?.recordNotFound) {
      return res
        .status(404)
        .send({ status: false, message: `Record '${recordName}' of type '${type}' not found in zone '${zone}'.` });
    }


    return res.status(200).send({
      status: true,
      message: 'Record deleted successfully.',
      data,
    });

  } catch (err) {
    console.error('Error in deleteRecord:', err);
    return res.status(500).send({ status: false, message: 'Internal Server Error.' });
  }
};

// ✅ Controller: Get PowerDNS Server Status
export const getServerStatus = async (req, res) => {
  try {
    // Fetch server status
    const response = await client.get("/servers/localhost");

    const data = response.data;

    // Optional: derive more readable info
    const serverInfo = {
      id: data.id,
      daemonType: data.daemon_type,
      version: data.version,
      url: data.url,
      configDir: data.config_dir,
      recursor: data.recursor,
      zonesUrl: data.zones_url,
      statisticsUrl: data.statistics_url,
    };

    // Respond with clean JSON
    return res.status(200).json({
      status: true,
      message: "PowerDNS server status fetched successfully.",
      data: serverInfo,
    });

  } catch (err) {
    console.error("❌ Error in getServerStatusController:", err.message);

    // Handle common error codes
    if (err.response?.status === 401) {
      return res.status(401).json({
        status: false,
        message: "Unauthorized: Invalid or missing API key.",
      });
    }

    if (err.response?.status === 404) {
      return res.status(404).json({
        status: false,
        message: "Server not found — check PowerDNS configuration.",
      });
    }

    // Fallback for unexpected errors
    return res.status(500).json({
      status: false,
      message: "Failed to fetch PowerDNS server status.",
      error: err.message,
    });
  }
};


//scan domain 

import { scanDNSRecords } from '../services/dnsScanService.js';

/**
 * Scan domain + validate nameservers
 */
export const scanDomainController = async (req, res) => {
  try {
    const { domain } = req.body;

    // 🛑 Validation
    if (!domain) {
      return res.status(400).json({
        success: false,
        message: '❌ Domain field is required.'
      });
    }

    // 🧾 Yahan apne nameservers define karo
    const ourNameservers = [
      'ns1.in.select',
      'ns2.in.select'
      // 'ns1.sparrowhost.com',
      // 'ns2.sparrowhost.com'
    ];

    // 🔍 Perform DNS scan
    const { records, hasAnyRecord, isValidNS } = await scanDNSRecords(domain, ourNameservers);

    if (!hasAnyRecord) {
      return res.status(404).json({
        success: false,
        domain,
        message: `⚠️ No DNS records found for domain: ${domain}`,
        records,
        isValidNS
      });
    }

    return res.status(200).json({
      success: true,
      domain,
      message: '✅ DNS records scanned successfully.',
      isValidNS,
      records
    });
  } catch (error) {
    console.error('DNS Scan Error:', error.message);

    res.status(500).json({
      success: false,
      message: `Failed to scan DNS records for ${req.body?.domain || 'unknown domain'}`,
      error: error.message
    });
  }
};


/** ________________ createZoneAndImportController ______________________________          */

import { createZone1, importRecords } from "../services/powerdnsService.js";

export const createZoneAndImportController = async (req, res) => {
  try {
    console.log('createZoneAndImportController')
    const { domain, importRecords: shouldImport, records } = req.body;

    if (!domain) {
      return res.status(400).json({
        success: false,
        message: "❌ Domain name is required.",
      });
    }

    // Step 1️⃣ Create Zone
    const zoneResponse = await createZone1(domain);
    if (!zoneResponse.success && zoneResponse.message !== "Zone already exists.") {
      return res.status(500).json({
        success: false,
        message: "❌ Zone creation failed.",
        error: zoneResponse.message,
      });
    }

    // Step 2️⃣ Import Records (if selected)
    if (shouldImport && records && Object.keys(records).length > 0) {
      const importRes = await importRecords(domain, records);

      if (importRes.success) {
        return res.status(200).json({
          success: true,
          message: "✅ Zone created and DNS records imported successfully.",
          zone: domain,
          importedRecords: importRes.imported,
        });
      } else {
        return res.status(207).json({
          success: true,
          message: "⚠️ Zone created but no records imported.",
          zone: domain,
          error: importRes.message,
        });
      }
    }

    // Step 3️⃣ If import not required
    return res.status(200).json({
      success: true,
      message: "✅ Zone created successfully (no records imported).",
      zone: domain,
    });
  } catch (error) {
    console.error("Zone import error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error while creating or importing zone.",
      error: error.message,
    });
  }
};

/**__________________________________________scanDomainNameServer_______________________________________________________________ */


// import { default as whoiser } from "whoiser";


// export const scanDomainNameSever = async (req, res) => {
//   try {
//     const { domain } = req.body;
//     if (!domain) {
//       return res.status(400).json({ success: false, message: "Domain name is required." });
//     }

//     console.log(`🔍 Scanning domain: ${domain}`);

//     // Dynamically import whoiser and perform WHOIS lookup
//     const whoiserModule = await import('whoiser');
//     const data = await whoiserModule.default(domain);

//     const domainData = data[domain] || data[Object.keys(data)[0]]; // sometimes whoiser returns domain in lowercase
//     const currentNameservers = domainData?.nameServers || [];

//     // Define SparrowDNS official nameservers
//     const sparrowNameservers = ["ns1.sparrowdns.com", "ns2.sparrowdns.com"];

//     // Compare (case-insensitive)
//     const usingSparrowDNS = currentNameservers.some(ns =>
//       sparrowNameservers.includes(ns.toLowerCase())
//     );

//     let message = "";
//     if (usingSparrowDNS) {
//       message = "✅ Domain is already using SparrowDNS nameservers.";
//     } else {
//       message = "⚠️ Please update your nameservers to ns1.sparrowdns.com and ns2.sparrowdns.com.";
//     }

//     return res.status(200).json({
//       success: true,
//       domain,
//       currentNameservers,
//       sparrowNameservers,
//       usingSparrowDNS,
//       message
//     });

//   } catch (error) {
//     console.error("WHOIS scan error:", error.message);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to scan domain.",
//       error: error.message
//     });
//   }
// };
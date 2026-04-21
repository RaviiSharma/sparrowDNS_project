import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const PDNS_URL = process.env.PDNS_URL;
const API_KEY = process.env.PDNS_API_KEY;

const client = axios.create({
  baseURL: PDNS_URL,
  headers: {
    "X-API-Key": API_KEY,
    "Content-Type": "application/json",
  },
});

export const listZonesService = async () => {
  try {
    console.log(
      "Calling PowerDNS API at:",
      `${PDNS_URL}/servers/localhost/zones`
    );
    const res = await client.get("/servers/localhost/zones");
    const zoneSummaries = res.data;

    // Fetch details for each zone in parallel
    const detailedZones = await Promise.all(
      zoneSummaries.map(async (zone) => {
        try {
          const detailRes = await client.get(
            `/servers/localhost/zones/${encodeURIComponent(zone.id)}`
          );
          return detailRes.data;
        } catch (error) {
          console.error(
            `Failed to get details for zone ${zone.id}:`,
            error.message
          );
          return { id: zone.id, error: error.message };
        }
      })
    );

    console.log("Detailed zones fetched:", detailedZones);
    return detailedZones;
  } catch (error) {
    console.error("Error in listZonesService:", error.message);
    throw error;
  }
};

export const createZoneService = async ({ name, nameservers }) => {
  if (!name || typeof name !== "string") {
    throw new Error("Zone name (string) is required");
  }

  // Check if zone already exists
  try {
    const existingZone = await client.get(`/servers/localhost/zones/${name}`);
    if (existingZone.data) {
      return { exists: true }; // Indicate that the zone already exists
    }
  } catch (error) {
    // If it's a 404, the zone doesn't exist, which is good. Otherwise, rethrow the error.
    if (error.response && error.response.status !== 404) {
      console.error("Error checking for existing zone:", error.message);
      throw error;
    }
  }

  const payload = {
    name: name.endsWith(".") ? name : name + ".",
    kind: "Native",
    masters: [],
    nameservers,
  };
  const res = await client.post("/servers/localhost/zones", payload);
  return res.data;
};

/**   RECORDS  */

export const addRecordService = async ({
  zone,
  recordName,
  type,
  content,
  ttl,
}) => {
  console.log(zone, recordName, type, content, ttl);
  console.log("addRecordService");

  //  Step 1: Validate if zone exists
  try {
    await client.get(`/servers/localhost/zones/${zone}`);
  } catch (error) {
    console.log(error);
    if (error.response && error.response.status === 404) {
      //  Return a clean flag instead of throwing
      return { notFound: true };
    } else {
      console.error("Error checking zone existence:", error.message);
      throw error; // Other unexpected errors still get thrown
    }
  }

  //  Step 2: Build record payload
  const payload = {
    rrsets: [
      {
        name: recordName.endsWith(".") ? recordName : recordName + ".",
        type: type.toUpperCase(),
        changetype: "REPLACE",
        ttl: ttl || 3600,
        records: [{ content: content, disabled: false }],
      },
    ],
  };

  //  Step 3: Make patch request to PowerDNS
  const res = await client.patch(`/servers/localhost/zones/${zone}`, payload);
  return res.data;
};

export const getZoneByNameService = async (zoneName) => {
  try {
    const res = await client.get(`/servers/localhost/zones/${zoneName}`);
    return res.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return { notFound: true };
    } else {
      console.error(
        `Error in getZoneByNameService for zone ${zoneName}:`,
        error.message
      );
      throw error;
    }
  }
};

export const deleteZoneService = async (zoneName) => {
  try {
    const res = await client.delete(`/servers/localhost/zones/${zoneName}`);
    return res.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return { notFound: true };
    } else {
      console.error(
        `Error in deleteZoneService for zone ${zoneName}:`,
        error.message
      );
      throw error;
    }
  }
};

// Get DNS record(s) for a given zone and record name/type

export const getRecordService = async ({ zone, recordName, type }) => {
  try {
    console.log("getRecordService");
    console.log("zone", zone, "recordName", recordName, "type", type);

    const res = await client.get(`/servers/localhost/zones/${zone}`);
    const rrsets = res.data.rrsets || [];

    // Filter by record name and type if provided
    const filtered = rrsets.filter((rrset) => {
      const nameMatch =
        recordName && typeof recordName === "string"
          ? rrset.name ===
            (recordName.endsWith(".") ? recordName : recordName + ".")
          : true;

      const typeMatch = type ? rrset.type === type.toUpperCase() : true;

      return nameMatch && typeMatch;
    });

    console.log("filtered", filtered);
    return filtered;
  } catch (error) {
    //  Handle 404 zone not found from PowerDNS API
    if (error.response && error.response.status === 404) {
      return { notFound: true };
    }

    console.error("Error in getRecordService:", error.message);
    throw error;
  }
};

// Update DNS record for a given zone, record name, and type (flexible for any type/fields)
// If newRecordName is provided, delete the old record and add the new one
export const updateRecordService = async ({
  zone,
  recordName,
  type,
  records,
  ttl,
  newRecordName,
}) => {
  console.log("updateRecordService");

  const oldName = recordName.endsWith(".") ? recordName : recordName + ".";
  const newName = newRecordName
    ? newRecordName.endsWith(".")
      ? newRecordName
      : newRecordName + "."
    : oldName;

  //  Check if zone exists
  try {
    await client.get(`/servers/localhost/zones/${zone}`);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return { notFound: true };
    } else {
      console.error("Error checking zone existence:", error.message);
      throw error;
    }
  }

  // If renaming, delete old and add new
  if (newRecordName && newName !== oldName) {
    // Fetch the existing record for the old name and type

    let oldRecords = [];
    let oldTtl = undefined;
    try {
      const zoneData = await client.get(`/servers/localhost/zones/${zone}`);
      const rrsets = zoneData.data.rrsets || [];
      const match = rrsets.find(
        (rrset) => rrset.name === oldName && rrset.type === type
      );
      if (match && Array.isArray(match.records)) {
        oldRecords = match.records;
        oldTtl = match.ttl;
      }
    } catch (err) {
      oldRecords = [];
      oldTtl = undefined;
    }

    // Delete old record using its actual records array and TTL
    const deletePayload = {
      rrsets: [
        {
          name: oldName,
          type,
          changetype: "DELETE",
          ttl: oldTtl || 3600,
          records: oldRecords,
        },
      ],
    };
    await client.patch(`/servers/localhost/zones/${zone}`, deletePayload);

    // Add new record (do not change this logic)
    const addPayload = {
      rrsets: [
        {
          name: newName,
          type,
          changetype: "REPLACE",
          ttl: ttl || 3600,
          records,
        },
      ],
    };
    const res = await client.patch(
      `/servers/localhost/zones/${zone}`,
      addPayload
    );
    return res.data;
  } else {
    // Only update the record (no rename)
    const payload = {
      rrsets: [
        {
          name: oldName,
          type,
          changetype: "REPLACE",
          ttl: ttl || 3600,
          records,
        },
      ],
    };
    const res = await client.patch(`/servers/localhost/zones/${zone}`, payload);
    return res.data;
  }
};


//deleteRecordService
export const deleteRecordService = async ({ zone, recordName, type }) => {
  if (!zone || !recordName || typeof recordName !== "string" || !type) {
    throw new Error("zone, recordName (string), and type are required");
  }

  // Check if zone exists
  try {
    await client.get(`/servers/localhost/zones/${zone}`);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return { notFound: true };
    } else {
      console.error("Error checking zone existence:", error.message);
      throw error;
    }
  }

  //  Check if record exists
  try {
    const zoneData = await client.get(`/servers/localhost/zones/${zone}`);
    const rrsets = zoneData.data.rrsets || [];
    const recordNameWithDot = recordName.endsWith(".")
      ? recordName
      : recordName + ".";
    const recordExists = rrsets.find(
      (rrset) => rrset.name === recordNameWithDot && rrset.type === type
    );

    if (!recordExists) {
      return { recordNotFound: true }; // Record not found
    }
  } catch (error) {
    console.error("Error fetching records for existence check:", error.message);
    throw error;
  }

  const payload = {
    rrsets: [
      {
        name: recordName.endsWith(".") ? recordName : recordName + ".",
        type,
        changetype: "DELETE",
        records: [],
      },
    ],
  };
  const res = await client.patch(`/servers/localhost/zones/${zone}`, payload);
  return res.data;
};










//deleteMultipleRecordsService
export const deleteMultipleRecordsService = async ({ zone, records }) => {
  console.log("deleteMultipleRecordsService (partial):", zone, records);

  if (!zone) throw new Error("zone is required");
  if (!Array.isArray(records)) return { invalidRecordsParam: true };
  if (records.length === 0) return { noRecordsProvided: true };

  // 1. Ensure zone exists
  try {
    await client.get(`/servers/localhost/zones/${zone}`);
  } catch (error) {
    if (error.response && error.response.status === 404)
      return { notFound: true };
    throw error;
  }

  // 2. Fetch zone rrsets
  let zoneData;
  try {
    zoneData = await client.get(`/servers/localhost/zones/${zone}`);
  } catch (error) {
    console.error("Error fetching zone data:", error.message);
    throw error;
  }
  const rrsets = zoneData.data.rrsets || [];

  // 3. Normalize requested deletions into map: key=name|type, value=set(contentsToRemove)
  const wantedMap = new Map();
  for (const r of records) {
    if (!r || !r.name || !r.type) continue;
    const name = r.name.endsWith(".") ? r.name : r.name + ".";
    const type = r.type.toUpperCase();
    if (type === "SOA" || type === "NS") continue; // never delete SOA/NS
    let values = [];
    if (Array.isArray(r.values)) values = r.values;
    else if (Array.isArray(r.contents)) values = r.contents;
    else if (Array.isArray(r.records))
      values = r.records; // optional compatibility
    else if (typeof r.content === "string") values = [r.content];
    else if (r.value) values = [r.value];
    // If no specific values provided, treat as delete whole rrset
    if (values.length === 0) values = ["*__ALL__*"];
    const key = `${name}|${type}`;
    const existing = wantedMap.get(key) || new Set();
    values.forEach((v) => existing.add(v));
    wantedMap.set(key, existing);
  }

  if (wantedMap.size === 0) return { noValidDeleteRequests: true };

  // 4. Build patch rrsets
  const patchRRSets = [];
  const deleteSummary = [];

  for (const rrset of rrsets) {
    const key = `${rrset.name}|${rrset.type}`;
    if (!wantedMap.has(key)) continue;
    if (rrset.type === "SOA" || rrset.type === "NS") continue;

    const targets = wantedMap.get(key);
    const deleteAll = targets.has("*__ALL__*");

    const currentRecords = rrset.records || [];
    let remainingRecords;
    let removedRecords;

    if (deleteAll) {
      remainingRecords = [];
      removedRecords = currentRecords.map((r) => r.content);
    } else {
      remainingRecords = currentRecords.filter((r) => !targets.has(r.content));
      removedRecords = currentRecords
        .filter((r) => targets.has(r.content))
        .map((r) => r.content);
    }

    if (removedRecords.length === 0) continue; // nothing matched

    // Decide changetype
    if (remainingRecords.length === 0) {
      patchRRSets.push({
        name: rrset.name,
        type: rrset.type,
        changetype: "DELETE",
        records: [], // DELETE payload
      });
    } else {
      patchRRSets.push({
        name: rrset.name,
        type: rrset.type,
        changetype: "REPLACE",
        ttl: rrset.ttl || 3600,
        records: remainingRecords.map((r) => ({
          content: r.content,
          disabled: !!r.disabled,
        })),
      });
    }

    deleteSummary.push({
      name: rrset.name,
      type: rrset.type,
      deletedValues: removedRecords,
      remainingCount: remainingRecords.length,
    });
  }

  if (patchRRSets.length === 0) return { noMatchingRecords: true };

  const payload = { rrsets: patchRRSets };
  const res = await client.patch(`/servers/localhost/zones/${zone}`, payload);

  return {
    status: true,
    deletedSetsAffected: patchRRSets.length,
    details: deleteSummary,
    pdns: res.data,
  };
};

/***************************** importRecords not working correctly ******************* */

export const zoneExists = async (zoneName) => {
  try {
    await client.get(
      `/servers/localhost/zones/${encodeURIComponent(zoneName)}`
    );
    return true; // Zone exists
  } catch (error) {
    if (error.response?.status === 404) {
      return false; // Zone does not exist
    }
    throw error; // Other errors rethrow
  }
};

// ✅ Create Zone (2-step method)
export const createZoneInPowerDNS = async (zoneName, rrsets) => {
  try {
    const canonicalZoneName = zoneName.endsWith(".")
      ? zoneName
      : `${zoneName}.`;

    // 1️⃣ If zone already exists, return it
    const exists = await zoneExists(canonicalZoneName);
    if (exists) {
      const existingZone = await client.get(
        `/servers/localhost/zones/${canonicalZoneName}`
      );
      return existingZone.data;
    }

    // 2️⃣ Create base zone (without rrsets)
    await client.post(`/servers/localhost/zones`, {
      name: canonicalZoneName,
      kind: "Native",
      nameservers: ["ns1.select.in.", "ns2.select.in."], // basic NS for creation
    });

    // 3️⃣ Patch zone to add SOA + NS rrsets
    const patchRes = await client.patch(
      `/servers/localhost/zones/${canonicalZoneName}`,
      {
        rrsets,
      }
    );

    return patchRes.data;
  } catch (error) {
    throw new Error(
      `PowerDNS zone creation failed: ${
        error.response?.data?.error || error.message
      }`
    );
  }
};

export const createMinimalZoneRRsets = (
  zoneName,
  nsRecords = ["ns1.select.in.", "ns2.select.in."]
) => {
  const canonicalZoneName = zoneName.endsWith(".") ? zoneName : `${zoneName}.`;
  const nsRecordsCanonical = nsRecords.map((ns) =>
    ns.endsWith(".") ? ns : `${ns}.`
  );

  const soaRecord = {
    name: canonicalZoneName,
    type: "SOA",
    ttl: 3600,
    changetype: "REPLACE",
    records: [
      {
        content: `ns1.select.in. hostmaster.${canonicalZoneName} 1 3600 3600 604800 3600`,
        disabled: false,
      },
    ],
  };

  const nsRecordSet = {
    name: canonicalZoneName,
    type: "NS",
    ttl: 3600,
    changetype: "REPLACE",
    records: nsRecordsCanonical.map((ns) => ({
      content: ns,
      disabled: false,
    })),
  };

  console.log("✅ Created minimal RRsets for zone:", [soaRecord, nsRecordSet]);
  return [soaRecord, nsRecordSet];
};

/** for super admin , to get all details */

import StatsModel from "../models/statsModel.js";

export const fetchDNSQueryStats = async () => {
  const POWERDNS_URL = `${process.env.PDNS_URL}/servers/localhost/statistics`;
  const PDNS_API_KEY = process.env.PDNS_API_KEY;

  try {
    const response = await axios.get(POWERDNS_URL, {
      headers: { "X-API-Key": PDNS_API_KEY },
    });

    const responseData = response.data || {};
    const statsArray = Array.isArray(responseData)
      ? responseData
      : responseData.statistics || [];

    const udpQueriesObj = statsArray.find((x) => x.name === "udp-queries");
    const tcpQueriesObj = statsArray.find((x) => x.name === "tcp-queries");
    const latencyObj = statsArray.find((x) => x.name === "latency");

    const udpQueries = udpQueriesObj ? +udpQueriesObj.value : 0;
    const tcpQueries = tcpQueriesObj ? +tcpQueriesObj.value : 0;
    const dnsQueries = udpQueries + tcpQueries;
    const latency = latencyObj ? +latencyObj.value : 0;

    // Round timestamp to start of current hour
    const now = new Date();
    const roundedHour = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      now.getHours()
    );

    // Upsert current hour stats
    await StatsModel.updateOne(
      { hour: roundedHour },
      { hour: roundedHour, dnsQueries, latency },
      { upsert: true }
    );

    // Calculate previous 24h window: (48h ago to 24h ago)
    const prev24hStart = new Date(roundedHour.getTime() - 48 * 60 * 60 * 1000);
    const prev24hEnd = new Date(roundedHour.getTime() - 24 * 60 * 60 * 1000);

    // Aggregate previous 24h queries
    const prev24hStats = await StatsModel.find({
      hour: { $gte: prev24hStart, $lt: prev24hEnd },
    });
    const yesterdayQueries = prev24hStats.reduce(
      (sum, stat) => sum + stat.dnsQueries,
      0
    );

    // Calculate % change from yesterday
    let changeFromYesterday = "N/A";
    if (yesterdayQueries === 0 && dnsQueries > 0) {
      changeFromYesterday = "+100% (new queries)";
    } else if (yesterdayQueries > 0) {
      const percentChange =
        ((dnsQueries - yesterdayQueries) / yesterdayQueries) * 100;
      changeFromYesterday =
        (percentChange > 0 ? "+" : "") + percentChange.toFixed(1) + "%";
    }

    return {
      status: true,
      data: {
        totalQueries24h: dnsQueries,
        avgResponseTime: latency + "ms",
        changeFromYesterday,
      },
    };
  } catch (error) {
    return {
      status: false,
      message: "Failed to fetch DNS stats from PowerDNS",
      error: error.message,
    };
  }
};

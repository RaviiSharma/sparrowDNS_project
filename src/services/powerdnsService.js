
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();



const PDNS_URL = process.env.PDNS_URL;
const API_KEY = process.env.PDNS_API_KEY;

const client = axios.create({
  baseURL: PDNS_URL,
  headers: {
    'X-API-Key': API_KEY,
    'Content-Type': 'application/json'
  }
});

// console.log(" PowerDNS Client Configured:", PDNS_URL);




// // Helper function to validate record content based on type
// const validateRecordContent = (type, content) => {
//   switch (type) {
//     case 'A':
//       // Basic IPv4 regex
//       if (!/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(content)) {
//         throw new Error(`Invalid content for A record. Must be a valid IPv4 address.`);
//       }
//       break;
//     case 'AAAA':
//       // Basic IPv6 regex (simplified)
//       if (!/^([0-9a-fA-F]{1,4}:){7}([0-9a-fA-F]{1,4}|:)$|^((?:[0-9A-Fa-f]{1,4}(?::[0-9A-Fa-f]{1,4})*)?)::((?:[0-9A-Fa-f]{1,4}(?::[0-9A-Fa-f]{1,4})*)?)$/.test(content)) {
//         throw new Error(`Invalid content for AAAA record. Must be a valid IPv6 address.`);
//       }
//       break;
//     case 'CNAME':
//     case 'NS':
//       // Should be a hostname, often ending with a dot
//       if (!/^([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.$/.test(content)) {
//         throw new Error(`Invalid content for ${type} record. Must be a valid hostname ending with a dot.`);
//       }
//       break;
//     case 'MX':
//       // Format: <preference> <hostname>.
//       if (!/^\d+\s+([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.$/.test(content)) {
//         throw new Error(`Invalid content for MX record. Must be in format '<preference> <hostname>.'`);
//       }
//       break;
//     case 'TXT':
//       // TXT records can contain almost any text, but often quoted
//       if (typeof content !== 'string') {
//         throw new Error(`Invalid content for TXT record. Must be a string.`);
//       }
//       break;
//     case 'SRV':
//         // SRV format: <priority> <weight> <port> <target>.
//         if (!/^\d+\s+\d+\s+\d+\s+([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.$/.test(content)) {
//             throw new Error(`Invalid content for SRV record. Must be in format '<priority> <weight> <port> <target>.'`);
//         }
//         break;
//     // Add more cases for other record types as needed
//     default:
//       // For unsupported or generic types, just check if it's a non-empty string
//       if (typeof content !== 'string' || content.trim() === '') {
//         throw new Error(`Invalid content for ${type} record. Must be a non-empty string.`);
//       }
//       break;
//   }
// };

// //recordNameRegex

// const recordNameRegex = /^(?![0-9-])[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.$/;

 const listZonesService = async () => {
  try {
    console.log("Calling PowerDNS API at:", `${PDNS_URL}/servers/localhost/zones`);
    const res = await client.get('/servers/localhost/zones');
    console.log("Zones response received", res.data);
    return res.data;
  } catch (error) {
    console.error(" Error in listZonesService:", error.message);
    throw error;
  }
};

 const createZoneService = async ({ name, nameservers }) => {
  if (!name || typeof name !== 'string') {
    throw new Error('Zone name (string) is required');
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
      console.error('Error checking for existing zone:', error.message);
      throw error;
    }
  }

  const payload = {
    name: name.endsWith('.') ? name : name + '.',
    kind: 'Native',
    masters: [],
    nameservers
  };
  const res = await client.post('/servers/localhost/zones', payload);
  return res.data;
};

/**   RECORDS  */

const addRecordService = async ({ zone, recordName, type, content, ttl }) => {
  console.log("addRecordService");

  // ✅ Step 1: Validate if zone exists
  try {
    await client.get(`/servers/localhost/zones/${zone}`);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      // ✅ Return a clean flag instead of throwing
      return { notFound: true };
    } else {
      console.error('Error checking zone existence:', error.message);
      throw error; // Other unexpected errors still get thrown
    }
  }

  // ✅ Step 2: Build record payload
  const payload = {
    rrsets: [
      {
        name: recordName.endsWith('.') ? recordName : recordName + '.',
        type: type.toUpperCase(),
        changetype: 'REPLACE',
        ttl: ttl || 3600,
        records: [{ content: content, disabled: false }]
      }
    ]
  };

  // ✅ Step 3: Make patch request to PowerDNS
  const res = await client.patch(`/servers/localhost/zones/${zone}`, payload);
  return res.data;
};

const getZoneByNameService = async (zoneName) => {
  try {
    const res = await client.get(`/servers/localhost/zones/${zoneName}`);
    return res.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return { notFound: true };
    } else {
      console.error(`Error in getZoneByNameService for zone ${zoneName}:`, error.message);
      throw error;
    }
  }
};

const deleteZoneService = async (zoneName) => {
  try {
    const res = await client.delete(`/servers/localhost/zones/${zoneName}`);
    return res.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return { notFound: true };
    } else {
      console.error(`Error in deleteZoneService for zone ${zoneName}:`, error.message);
      throw error;
    }
  }
};

// Get DNS record(s) for a given zone and record name/type

const getRecordService = async ({ zone, recordName, type }) => {
  try {
    console.log("getRecordService");
    const res = await client.get(`/servers/localhost/zones/${zone}`);
    const rrsets = res.data.rrsets || [];

    // Filter by record name and type if provided
    const filtered = rrsets.filter(rrset => {
      const nameMatch = recordName && typeof recordName === 'string'
        ? rrset.name === (recordName.endsWith('.') ? recordName : recordName + '.')
        : true;

      const typeMatch = type ? rrset.type === type.toUpperCase() : true;

      return nameMatch && typeMatch;
    });

    return filtered;

  } catch (error) {
    // ✅ Handle 404 zone not found from PowerDNS API
    if (error.response && error.response.status === 404) {
      return { notFound: true };
    }

    console.error('Error in getRecordService:', error.message);
    throw error;
  }
};

// Update DNS record for a given zone, record name, and type (flexible for any type/fields)
// If newRecordName is provided, delete the old record and add the new one
const updateRecordService = async ({ zone, recordName, type, records, ttl, newRecordName }) => {

  console.log("updateRecordService");

  const oldName = recordName.endsWith('.') ? recordName : recordName + '.';
  const newName = newRecordName ? (newRecordName.endsWith('.') ? newRecordName : newRecordName + '.') : oldName;

  //  Check if zone exists
  try {
    await client.get(`/servers/localhost/zones/${zone}`);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return { notFound: true };
    } else {
      console.error('Error checking zone existence:', error.message);
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
      const match = rrsets.find(rrset => rrset.name === oldName && rrset.type === type);
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
          changetype: 'DELETE',
          ttl: oldTtl || 3600,
          records: oldRecords
        }
      ]
    };
    await client.patch(`/servers/localhost/zones/${zone}`, deletePayload);

    // Add new record (do not change this logic)
    const addPayload = {
      rrsets: [
        {
          name: newName,
          type,
          changetype: 'REPLACE',
          ttl: ttl || 3600,
          records
        }
      ]
    };
    const res = await client.patch(`/servers/localhost/zones/${zone}`, addPayload);
    return res.data;
  } else {
    // Only update the record (no rename)
    const payload = {
      rrsets: [
        {
          name: oldName,
          type,
          changetype: 'REPLACE',
          ttl: ttl || 3600,
          records
        }
      ]
    };
    const res = await client.patch(`/servers/localhost/zones/${zone}`, payload);
    return res.data;
  }
};


// Delete DNS record for a given zone, record name, and type
const deleteRecordService = async ({ zone, recordName, type }) => {
  if (!zone || !recordName || typeof recordName !== 'string' || !type) {
    throw new Error('zone, recordName (string), and type are required');
  }


  // Check if zone exists
  try {
    await client.get(`/servers/localhost/zones/${zone}`);


  } catch (error) {
    if (error.response && error.response.status === 404) {
      return { notFound: true };
    } else {
      console.error('Error checking zone existence:', error.message);
      throw error;
    }
  }

  // ✅ Check if record exists
  try {
    const zoneData = await client.get(`/servers/localhost/zones/${zone}`);
    const rrsets = zoneData.data.rrsets || [];
    const recordNameWithDot = recordName.endsWith('.') ? recordName : recordName + '.';
    const recordExists = rrsets.find(
      rrset => rrset.name === recordNameWithDot && rrset.type === type
    );

    if (!recordExists) {
      return { recordNotFound: true }; // Record not found
    }
  } catch (error) {
    console.error('Error fetching records for existence check:', error.message);
    throw error;
  }
  
   
  const payload = {
    rrsets: [
      {
        name: recordName.endsWith('.') ? recordName : recordName + '.',
        type,
        changetype: 'DELETE',
        records: []
      }
    ]
  };
  const res = await client.patch(`/servers/localhost/zones/${zone}`, payload);
  return res.data;
};


/***************************** importRecords not working correctly ******************* */

// ✅ Create Zone
export const createZone1 = async (domain) => {
  try {
    const payload = {
      name: domain.endsWith('.') ? domain : domain + '.',
      kind: 'Native',
      masters: [],
      nameservers: ['ns1.in.select.', 'ns1.in.select.'], // Default nameservers for a fresh zone
    };
    const res = await client.post('/servers/localhost/zones', payload);
    return { success: true, message: 'Zone created successfully.', data: res.data };
  } catch (error) {
    if (error.response && error.response.status === 409) {
      return { success: true, message: 'Zone already exists.' };
    }
    console.error(`Error creating zone for ${domain}:`, error.message);
    return { success: false, message: `Failed to create zone: ${error.message}` };
  }
};

// ✅ Import Records into Zone
export const importRecords = async (domain, records) => {
  try {
    console.log('importRecords')
    const rrsets = Object.entries(records).flatMap(([type, values]) =>
      values.map(content => {
        let formattedContent = content;
        // Ensure names (like for CNAME, NS, MX targets) have a trailing dot if they are supposed to be FQDNs
        let recordName = domain.endsWith('.') ? domain : domain + '.';

        if (type.toUpperCase() === 'MX') {
          if (!/^\d+\s/.test(content)) {
            formattedContent = `10 ${content}`;
          }
          // Ensure MX target has a trailing dot
          const parts = formattedContent.split(' ');
          if (parts.length > 1 && !parts[1].endsWith('.')) {
            formattedContent = `${parts[0]} ${parts[1]}.`;
          }
        } else if (['CNAME', 'NS'].includes(type.toUpperCase())) {
          // Ensure CNAME and NS content (target) has a trailing dot
          if (!content.endsWith('.')) {
            formattedContent = `${content}.`;
          }
        } else if (type.toUpperCase() === 'TXT') {
          // PowerDNS sometimes expects TXT records to be quoted, or just raw string
          // For now, let's assume it should be a raw string and handle potential quoting later if needed
          // If the content is not already quoted and contains spaces, it might need to be quoted
          if (!content.startsWith('"') && !content.endsWith('"') && content.includes(' ')) {
              formattedContent = `"${content}"`;
          }
        }

        return {
          name: recordName,
          type,
          changetype: 'REPLACE',
          ttl: 3600, // Default TTL for imported records
          records: [{ content: formattedContent, disabled: false }]
        };
      })
    );

    console.log('Payload to PowerDNS API:', JSON.stringify({ rrsets }, null, 2)); // Log the full payload

    const payload = {
      rrsets
    };
    const res = await client.patch(`/servers/localhost/zones/${domain}`, payload);
    console.log('res',res)

    return { success: true, message: 'Records imported successfully.', imported: res.data };

  } catch (error) {
    console.error(`Error importing records for ${domain}:`, error.message);
    // Log detailed error response from PowerDNS if available
    if (error.response && error.response.data) {
      console.error('PowerDNS API Error Details:', error.response.data);
    }
    return { success: false, message: `Failed to import records: ${error.message}` };
  }
};

export { listZonesService, createZoneService, addRecordService, getRecordService, updateRecordService, deleteRecordService, getZoneByNameService, deleteZoneService, };

import { getZoneByNameService } from './powerdnsService.js';

export const scanDNSRecords = async (domain, ourNameservers = []) => {
  if (!domain) throw new Error('Domain name is required');

  // Fetch zone from PowerDNS API
  const zoneData = await getZoneByNameService(domain);
  if (zoneData.notFound) {
    return { records: {}, hasAnyRecord: false, isValidNS: false };
  }

  // Transform rrsets into a simpler records map
  const records = {};
  let hasAnyRecord = false;

  for (const rrset of zoneData.rrsets) {
    const type = rrset.type;
    records[type] = rrset.records.map(r => r.content);
    if (rrset.records.length > 0) hasAnyRecord = true;
  }

  // Validate NS
  let isValidNS = false;
  if (records.NS && records.NS.length > 0 && ourNameservers.length > 0) {
    const lowerNS = records.NS.map(ns => ns.toLowerCase());
    const lowerOur = ourNameservers.map(ns => ns.toLowerCase());
    isValidNS = lowerOur.some(our => lowerNS.includes(our));
  }
  console.log('Scanned DNS records for', domain, ':', records);

  return { records, hasAnyRecord, isValidNS };
};

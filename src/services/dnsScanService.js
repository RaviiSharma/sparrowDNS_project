// import dns from 'dns/promises';

//  const scanDNSRecords = async (domain) => {
//   if (!domain) throw new Error('Domain name is required');

//   const recordTypes = ['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'NS', 'SOA'];
//   const results = {};

//   for (const type of recordTypes) {
//     try {
//       const res = await dns.resolve(domain, type);
//       results[type] = res;
//     } catch (err) {
//       results[type] = [];
//     }
//   }

//   return results;
// };

import dns from 'dns/promises';

/**
 * Scan DNS Records + Validate Nameservers
 */
export const scanDNSRecords = async (domain, ourNameservers = []) => {
  if (!domain) throw new Error('Domain name is required');

  const recordTypes = ['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'NS', 'SOA'];
  const results = {};
  let hasAnyRecord = false;
  let isValidNS = false;

  for (const type of recordTypes) {
    try {
      const res = await dns.resolve(domain, type);
      results[type] = res;
      if (res && res.length > 0) hasAnyRecord = true;
    } catch {
      results[type] = [];
    }
  }

  // ✅ Check if user’s NS match with our nameservers
  if (results.NS && results.NS.length > 0 && ourNameservers.length > 0) {
    const lowerNS = results.NS.map(ns => ns.toLowerCase());
    const lowerOur = ourNameservers.map(ns => ns.toLowerCase());
    isValidNS = lowerOur.some(our => lowerNS.includes(our));
  }

  return { records: results, hasAnyRecord, isValidNS };
};


// export {scanDNSRecords}

// /**-------------------------------------------------------------------------------------------------------- */

// import whois from "whois";
// import MonitoredDomain from "../models/monitoredDomainModel.js";
// import DomainAlertLog from "../models/domainAlertLogModel.js";
// import { sendChangeAlert } from "../services/emailService.js";

// // Helper function
// function extractNameservers(whoisData) {
//   const patterns = [
//     /Name Server:\s*(.+)/gim,
//     /nameserver:\s*(.+)/gim,
//     /nserver:\s*(.+)/gim,
//     /Name Servers?:\s*(.+)/gim,
//   ];
//   let matches = [];
//   for (const re of patterns) {
//     const found = whoisData ? whoisData.match(re) : [];
//     if (found) matches = matches.concat(found);
//   }
//   let servers = matches
//     .map((m) => m.split(":")[1]?.trim())
//     .filter(Boolean)
//     .map((s) => s.split(/\s+/)[0].toLowerCase().replace(/\.$/, ""))
//     .filter(Boolean);
//   servers = servers.filter((ns) => !/^[a-d]\.nic\.[a-z0-9-]+$/.test(ns));
//   return [...new Set(servers)];
// }

// const allowedServers = ["ns1.exampledomain.com", "ns2.exampledomain.com"];

// // Returns array of JSON status objects for each domain processed
// export async function checkDomainsNow() {
//   const domains = await MonitoredDomain.find();
//   const results = [];
//   console.log("🟢 Checking nameservers for", domains.length, "domains");

//   for (const doc of domains) {
//     const domain = doc.domain.toLowerCase().replace(/\.$/, "");
//     try {
//       // WHOIS logic
//       const tld = domain.split(".").pop();
//       const whoisServers = {
//         shop: "whois.nic.shop",
//         mom: "whois.nic.mom",
//         com: "whois.verisign-grs.com",
//         net: "whois.verisign-grs.com",
//         org: "whois.pir.org",
//         info: "whois.afilias.net",
//         biz: "whois.neulevel.biz",
//         io: "whois.nic.io",
//         in: "whois.nixiregistry.in",
//       };
//       const registry = whoisServers[tld];
//       const options = registry
//         ? { server: registry, timeout: 20000, follow: 0 }
//         : { timeout: 20000, follow: 3 };
//       // console.log(`🔍 WHOIS options for ${domain}:`, options);

//       const whoisData = await new Promise((resolve) => {
//         whois.lookup(domain, options, (err, data) => {
//           if (err) {
//             console.warn("⚠️ WHOIS error for", domain, ":", err.message);
//             return resolve(null);
//           }
//           // console.log("📄 RAW WHOIS for", domain, ":\n", data);
//           resolve(data);
//         });
//       });

//       if (!whoisData) {
//         console.error(`❌ WHOIS fetch failed for ${domain}`);
//         results.push({
//           success: false,
//           domain,
//           message: "WHOIS server did not respond.",
//         });
//         continue;
//       }

//       const currentNameservers = extractNameservers(whoisData);
//       const lastNameservers = (doc.lastWhois?.nameservers || []).map((ns) =>
//         ns.toLowerCase()
//       );

//       // console.log(`🌐 Domain: ${domain}`);
//       // console.log("➡️ Current NS:", currentNameservers);
//       // console.log("⬅️ Last NS:", lastNameservers);

//       const currentIsAllowed = allowedServers.some((ns) =>
//         currentNameservers.includes(ns)
//       );
//       const nameserversChanged =
//         JSON.stringify(currentNameservers) !== JSON.stringify(lastNameservers);

//       if (!currentIsAllowed && nameserversChanged) {
//         await DomainAlertLog.create({
//           domain: doc.domain,
//           owner: doc.owner,
//           emailSentTo: doc.alertEmails,
//           changes: {
//             nameservers: { old: lastNameservers, new: currentNameservers },
//           },
//           checkedAt: new Date(),
//         });
//         const emailSent = await sendChangeAlert(doc.alertEmails, doc.domain, {
//           nameservers: { old: lastNameservers, new: currentNameservers },
//         });
//         const msg = emailSent
//           ? "Nameserver change detected and alert email sent."
//           : "Nameserver change detected but email sending failed!";
//         console.log(
//           `Logging + emailing alert for ${domain} to:`,
//           doc.alertEmails,
//         );
//         results.push({
//           success: emailSent,
//           domain,
//           currentNameservers,
//           lastNameservers,
//           message: msg,
//           emailSent,
//         });
//       } else {
//         results.push({
//           success: true,
//           domain,
//           currentNameservers,
//           lastNameservers,
//           message: "Domain NS unchanged or matches allowed servers.",
//         });
//       }

//       doc.lastWhois = { ...doc.lastWhois, nameservers: currentNameservers };
//       doc.lastCheck = new Date();
//       await doc.save();
//     } catch (err) {
//       console.error(`❌ Error for ${domain} WHOIS:`, err.message);
//       await DomainAlertLog.create({
//         domain: doc.domain,
//         owner: doc.owner,
//         emailSentTo: doc.alertEmails,
//         changes: null,
//         error: err.message,
//         checkedAt: new Date(),
//       });
//       results.push({
//         success: false,
//         domain,
//         message: "Internal processing error.",
//         error: err.message,
//       });
//     }
//   }
//   // console.log("✅ Domain nameserver check complete.");
//   return results; // Could use this in API or dashboard if needed
// }

import whois from "whois";
import MonitoredDomain from "../models/monitoredDomainModel.js";
import DomainAlertLog from "../models/domainAlertLogModel.js";
import { sendChangeAlert } from "../services/emailService.js";

// Helper to extract nameservers from WHOIS data
function extractNameservers(whoisData) {
  const patterns = [
    /Name Server:\s*(.+)/gim,
    /nameserver:\s*(.+)/gim,
    /nserver:\s*(.+)/gim,
    /Name Servers?:\s*((?:.+\n)+?)(?:\n\n|$)/gim, // also capture multi-line blocks
  ];
  let matches = [];
  for (const re of patterns) {
    const found = whoisData ? whoisData.match(re) : [];
    if (found) matches = matches.concat(found);
  }
  let servers = matches
    .map((m) => m.split(":")[1]?.trim())
    .filter(Boolean)
    .map((s) => s.split(/\s+/)[0].toLowerCase().replace(/\.$/, ""))
    .filter(Boolean);
  // filter out known registrar glue nameservers
  servers = servers.filter((ns) => !/^[a-d]\.nic\.[a-z0-9-]+$/.test(ns));
  // deduplicate
  return [...new Set(servers)];
}

const allowedServers = ["ns1.exampledomain.com", "ns2.exampledomain.com"];

export async function checkDomainsNow() {
  const domains = await MonitoredDomain.find();
  const results = [];
  console.log("🟢 Checking nameservers for", domains.length, "domains");

  for (const doc of domains) {
    const domain = doc.domain.toLowerCase().trim().replace(/\.$/, "");
    const owner = doc.owner;
    try {
      if (!owner) throw new Error("Domain owner missing in DB document");

      // WHOIS settings
      const tld = domain.split(".").pop();
      const whoisServers = {
        shop: "whois.nic.shop",
        mom: "whois.nic.mom",
        com: "whois.verisign-grs.com",
        net: "whois.verisign-grs.com",
        org: "whois.pir.org",
        info: "whois.afilias.net",
        biz: "whois.neulevel.biz",
        io: "whois.nic.io",
        in: "whois.nixiregistry.in",
      };
      const registry = whoisServers[tld];
      const options = registry
        ? { server: registry, timeout: 20000, follow: 0 }
        : { timeout: 20000, follow: 3 };

      const whoisData = await new Promise((resolve) => {
        whois.lookup(domain, options, (err, data) => {
          if (err) {
            console.warn("⚠️ WHOIS error for", domain, ":", err.message);
            return resolve(null);
          }
          resolve(data);
        });
      });

      if (!whoisData) {
        console.error(`❌ WHOIS fetch failed for ${domain}`);
        results.push({
          success: false,
          domain,
          message: "WHOIS server did not respond.",
        });
        continue;
      }

      // Extract and compare nameservers
      const currentNameservers = extractNameservers(whoisData);
      const lastNameservers = (doc.lastWhois?.nameservers || []).map((ns) =>
        ns.toLowerCase()
      );

      const currentIsAllowed = allowedServers.some((ns) =>
        currentNameservers.includes(ns)
      );
      const nameserversChanged =
        JSON.stringify(currentNameservers) !== JSON.stringify(lastNameservers);

        console.log("nameserversChanged:", nameserversChanged);

      if (!currentIsAllowed && nameserversChanged) {
        await DomainAlertLog.create({
          domain: doc.domain,
          owner: owner, // must set owner here to fix error
          message: "Nameserver change detected.",
          emailSentTo: doc.alertEmails,
          changes: {
            nameservers: { old: lastNameservers, new: currentNameservers },
          },
          checkedAt: new Date(),
        });

        const emailSent = await sendChangeAlert(doc.alertEmails, doc.domain, {
          nameservers: { old: lastNameservers, new: currentNameservers },
        });

        results.push({
          success: emailSent,
          domain,
          currentNameservers,
          lastNameservers,
          message: emailSent
            ? "Nameserver change detected and alert email sent."
            : "Nameserver change detected but email sending failed!",
          emailSent,
        });
      } else {
        results.push({
          success: true,
          domain,
          currentNameservers,
          lastNameservers,
          message: "Domain NS unchanged or matches allowed servers.",
        });
      }

      // Update domain document with latest WHOIS info
      doc.lastWhois = { ...doc.lastWhois, nameservers: currentNameservers };
      doc.lastCheck = new Date();
      await doc.save();
    } catch (err) {
      console.error(`❌ Error for ${domain} WHOIS:`, err.message);
      // Log error with owner if possible
      await DomainAlertLog.create({
        domain: doc.domain,
        owner: doc.owner || null,
        emailSentTo: doc.alertEmails,
        changes: null,
        error: err.message,
        checkedAt: new Date(),
      });
      results.push({
        success: false,
        domain,
        message: "Internal processing error.",
        error: err.message,
      });
    }
  }
  return results;
}

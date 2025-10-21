// utils/validateZoneFields.js
export const validateZoneFields = (kind, masters, nameservers) => {
    // -------- masters validation --------
    if (kind === "Slave") {
      if (!Array.isArray(masters) || masters.length === 0) {
        return {
          valid: false,
          message: "For 'Slave' zones, 'masters' field must be a non-empty array of IPs.",
        };
      }
  
      const invalidIP = masters.find(
        (ip) => !/^(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)$/.test(ip)
      );
  
      if (invalidIP) {
        return {
          valid: false,
          message: `Invalid IP address in masters: ${invalidIP}`,
        };
      }
    } else {
      if (!Array.isArray(masters)) {
        return { valid: false, message: "'masters' must be an array." };
      }
      if (masters.length > 0) {
        return {
          valid: false,
          message: `'masters' must be empty for '${kind}' zones.`,
        };
      }
    }
  
    // -------- nameservers validation --------
    if (!Array.isArray(nameservers) || nameservers.length === 0) {
      return {
        valid: false,
        message: "'nameservers' must be a non-empty array of strings.",
      };
    }
  
    const invalidNS = nameservers.find(
      (ns) => typeof ns !== "string" || !ns.endsWith(".")
    );
  
    if (invalidNS) {
      return {
        valid: false,
        message: `Invalid nameserver '${invalidNS}'. It must be a string ending with a dot '.'`,
      };
    }
  
    return { valid: true };
  };
  
import { createZone1, importRecords } from "../services/powerdnsService.js";
import ZoneMeta from "../models/zoneMetaModel.js";
import { deleteZoneService } from "../services/powerdnsService.js";
import ActivityLog from "../models/activityLogModel.js"

export const createZoneAndImportController = async (req, res) => {
  try {
   
    const { domain, importRecords: shouldImport, records } = req.body;

    if (!domain) {
      return res.status(400).json({
        success: false,
        message: "❌ Domain name is required.",
      });
    }

    // Validate domain name format and characters using regex
    // Allows subdomains and standard domain names with TLDs: e.g. example.com, sub.example.co.uk
    const domainRegex = /^(?!\-)(?:[a-zA-Z0-9\-]{1,63}\.)+[a-zA-Z]{2,63}$/;
    if (!domainRegex.test(domain)) {
      return res.status(400).json({
        success: false,
        message: "❌ Invalid domain name format or characters.",
      });
    }

    // Step 1️⃣ Create Zone
    const zoneResponse = await createZone1(domain);

    console.log("Zone response:",zoneResponse)
  
    if (!zoneResponse.success && zoneResponse.message !== "Zone already exists.") {
      return res.status(400).json({
        success: false,
        message: "Zone already exists.",
        error: zoneResponse.message,
      });
    }

    // Step 1.5️⃣ Store zone metadata in database
    try {
      const existingZone = await ZoneMeta.findOne({ zoneName: domain });
      if (!existingZone) {
        const zoneMeta = new ZoneMeta({
          zoneName: domain,
          syncedWithPDNS: true,
          description: `Zone created via API on ${new Date().toISOString()}`,
          owner:req.user.id
        });
        await zoneMeta.save();
        console.log("Zone created successfully.")
      } else {
        // Update existing zone metadata
        existingZone.syncedWithPDNS = true;
        await existingZone.save();
      }
    } catch (dbError) {
      console.error("Database error while saving zone metadata:", dbError);
      // Continue with the process even if DB save fails
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

export const listZones = async (req, res) => {
  try {
    // const zones = await listZonesService();
    const zones = await ZoneMeta.find({owner:req.user.id})
    
    //  Check if zones exist
    if (!zones || zones.length === 0) {
      return res.status(200).json({
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

export const deleteZone = async (req, res) => {
  try {
    const { zoneName } = req.body;
    const userId = req.user?.id || null; // From JWT middleware (if implemented)

    if (!zoneName || typeof zoneName !== 'string') {
      return res.status(400).send({ status: false, message: 'Zone name (string) is required.' });
    }

    const data = await deleteZoneService(zoneName);

    if (data?.notFound) {
      return res.status(404).send({ status: false, message: `Zone '${zoneName}' not found in pdns.` });
    }

    // ✅ 2️⃣ Delete metadata from MongoDB (if exists)
    const deletedMeta = await ZoneMeta.findOneAndDelete({ zoneName, owner:userId });

    // ✅ 3️⃣ Log the delete action
    await ActivityLog.create({
      userId:userId,
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
      message: `Zone '${zoneName}' deleted successfully `,
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
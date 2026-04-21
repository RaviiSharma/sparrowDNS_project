// For demo: global variable to hold the current status, updated every 5 seconds
let cachedStatus = {
  systemsOperational: true,
  uptime: "100%",
  globalResponseTime: 12, // ms
  ddosProtection: "Active",
  recentIncidents: []
};

// (Optionally) Simulate recent incidents
const incidentExamples = [
  {
    date: "2025-11-07T14:32:00Z",
    description: "Short outage in EU region",
    status: "Resolved"
  }
];

// Function to randomize mock data
function updateStatus() {
  // Randomize between 10–20ms response
  cachedStatus.globalResponseTime = Math.floor(Math.random() * 11) + 10;
  // Uncomment below to test/incidents
  // cachedStatus.recentIncidents = Math.random() < 0.2 ? incidentExamples : [];
}
// Update every 5 seconds
setInterval(updateStatus, 5000);

// Easy getter for controller
export function getRealTimeNetworkStatus() {
  return cachedStatus;
}

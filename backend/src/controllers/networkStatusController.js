import { getRealTimeNetworkStatus } from '../services/networkStatusService.js';

export const getNetworkStatus = async (req, res) => {
  // Setup CORS headers for any frontend:
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  const status = getRealTimeNetworkStatus(); // returns mocked data—no await!
  res.json(status);
};

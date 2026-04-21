import Nameserver from '../models/nameserverModel.js';

export const getDefaultNameservers = async () => {
  return Nameserver.find({ type: 'default' });
};

export const getCustomNameservers = async (userId) => {
  return Nameserver.find({ type: 'custom', owner: userId });
};

export const addCustomNameserver = async (userId, name) => {
  // Add business plan check if needed
  return Nameserver.create({ type: 'custom', owner: userId, name });
};

export const setNameserverStatus = async (id, status) => {
  return Nameserver.findByIdAndUpdate(id, { status }, { new: true });
};

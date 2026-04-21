import { getDefaultNameservers, getCustomNameservers, addCustomNameserver, setNameserverStatus } from '../services/nameserverService.js';

export const listDefaultNameservers = async (req, res, next) => {
  try {
    const nameservers = await getDefaultNameservers();
    res.json({ nameservers });
  } catch (err) { next(err); }
};

export const listWhiteLabelNameservers = async (req, res, next) => {
  try {
    const nameservers = await getCustomNameservers(req.user.id);
    res.json({ nameservers });
  } catch (err) { next(err); }
};

export const saveCustomNameserver = async (req, res, next) => {
  try {
    const { name } = req.body;
    const nameserver = await addCustomNameserver(req.user.id, name);
    res.status(201).json({ nameserver });
  } catch (err) { next(err); }
};

import ApiKey from '../models/apiKeyModel.js';
import crypto from 'crypto';

export const createApiKey = async (userId, name, scope) => {
  // Secret key generation
  const key = 'sk_' + crypto.randomBytes(14).toString('hex');
  const apiKey = await ApiKey.create({
    user: userId,
    name,
    key,
    scope,
  });
  return apiKey;
};

export const listApiKeys = async (userId) => {
  return ApiKey.find({ user: userId });
};

export const updateApiKeyStatus = async (apiKeyId, status) => {
  return ApiKey.findByIdAndUpdate(apiKeyId, { status }, { new: true });
};

export const deleteApiKey = async (apiKeyId) => {
  return ApiKey.findByIdAndDelete(apiKeyId);
};

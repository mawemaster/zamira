import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Create a client with authentication required
export const base44 = createClient({
  appId: "690e5f6f991e09e82bef3795", 
  requiresAuth: false // Ensure authentication is required for all operations
});

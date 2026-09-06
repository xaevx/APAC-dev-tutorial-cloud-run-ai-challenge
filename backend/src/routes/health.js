import express from 'express';
import { config } from '../config.js';

const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    status: 'HEALTHY',
    service: 'MindLoom AI Backend',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
    security: {
      secretManagerEnabled: config.useSecretManager,
      geminiKeyConfigured: Boolean(config.geminiApiKey),
      authEnforcement: 'STRICT_FIREBASE_ID_TOKEN'
    }
  });
});

export default router;

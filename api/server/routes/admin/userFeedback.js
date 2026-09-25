const express = require('express');
const { logger } = require('@librechat/data-schemas');
const { SystemCapabilities } = require('@librechat/data-schemas');
const { requireCapability } = require('~/server/middleware/roles/capabilities');
const { requireJwtAuth } = require('~/server/middleware');
const { listFeedbacks } = require('~/models');

const router = express.Router();
const requireAdminAccess = requireCapability(SystemCapabilities.ACCESS_ADMIN);

router.use(requireJwtAuth, requireAdminAccess);

/**
 * GET /api/admin/user-feedback
 * Lists all user feedbacks with pagination, newest first.
 */
router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));

    const result = await listFeedbacks({ page, limit });
    res.json(result);
  } catch (error) {
    logger.error('Error listing user feedbacks:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;

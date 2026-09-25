const express = require('express');
const multer = require('multer');
const { logger } = require('@librechat/data-schemas');
const { createFeedback } = require('~/models');
const { requireJwtAuth } = require('~/server/middleware');
const sendEmail = require('~/server/utils/sendEmail');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.use(requireJwtAuth);

/**
 * POST /api/user-feedback
 * Submits user feedback (bug report or general feedback) with optional screenshot.
 */
router.post('/', upload.single('screenshot'), async (req, res) => {
  try {
    const { type, message, pageUrl } = req.body;

    if (!type || !['bug', 'feedback'].includes(type)) {
      return res.status(400).json({ error: 'Invalid feedback type. Must be "bug" or "feedback".' });
    }

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message is required.' });
    }

    const screenshotData = req.file
      ? `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`
      : undefined;

    const input = {
      userId: req.user.id,
      type,
      message: message.trim(),
      screenshotData,
      pageUrl: typeof pageUrl === 'string' ? pageUrl : undefined,
      userAgent: req.headers['user-agent'],
    };

    await createFeedback(input);

    const notificationEmails = process.env.FEEDBACK_NOTIFICATION_EMAILS;
    if (notificationEmails) {
      const recipients = notificationEmails.split(',').map((e) => e.trim()).filter(Boolean);
      const appTitle = process.env.APP_TITLE || 'LibreChat';
      const emailPayload = {
        name: 'Admin',
        appTitle,
        type: input.type,
        isBug: input.type === 'bug',
        message: input.message,
        pageUrl: input.pageUrl || '',
        userId: input.userId,
        hasScreenshot: !!input.screenshotData,
        date: new Date().toLocaleString(),
      };
      for (const recipient of recipients) {
        sendEmail({
          email: recipient,
          subject: `[${appTitle}] New ${input.type} report`,
          payload: emailPayload,
          template: 'feedbackNotification.handlebars',
          throwError: false,
        }).catch((err) => logger.error('[userFeedback] Failed to send notification email:', err));
      }
    }

    res.status(201).json({ message: 'Feedback submitted successfully.' });
  } catch (error) {
    logger.error('Error submitting user feedback:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;

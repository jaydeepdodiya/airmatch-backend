const express = require('express');
const chatController = require('../controllers/chat.controller');

const router = express.Router();

router.get('/sessions', chatController.listChatSessions);
router.get('/sessions/by-match/:matchRequestId', chatController.getChatSessionByMatchRequest);
router.get('/sessions/:id', chatController.getChatSession);
router.post('/sessions/:id/ensure-firestore', chatController.ensureChatSessionFirestore);
router.post('/sessions/:id/notify', chatController.notifyNewMessage);

module.exports = router;

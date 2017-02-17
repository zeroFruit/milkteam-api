import chatController from '../controller/chat';

const router = (app) => {
  app.get('/chat/left/:id', chatController.getLeftChats);
  app.get('/chat/right/:id', chatController.getRightChats);
}

module.exports = router;

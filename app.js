import './config/env/env';

import express    from 'express';
import bodyParser from 'body-parser';
import {mongoose} from './config/mongodb';

//import socketIO   from 'socket.io';
import http       from 'http';
import path       from 'path'; // for test

const app     = express();
const port    = process.env.PORT;

app.use(bodyParser.json());

import Router from './router/index';
Router(app);

let server = http.Server(app);

// import socketIO       from 'socket.io';
// const MAIN_CHAT_URL = '/api/socket/main';
// const ioMainChat = socketIO(server, {path: MAIN_CHAT_URL});

import mainChatSocket from './socket/mainChat';
mainChatSocket(server);
//
// import subChatSocket from './socket/subChat';
// subChatSocket.connect(server);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, './public/index.html'));
})

server.listen(port, () => {
  console.log(`Connteced to port ${port}`);
});

module.exports = {app, server};

import './config/env/env';

import express    from 'express';
import bodyParser from 'body-parser';
import {mongoose} from './config/mongodb';

//import socketIO   from 'socket.io';
import http       from 'http';
import path       from 'path'; // for test
import cors       from 'cors';

const app     = express();
const port    = process.env.PORT;
const corsOptions = {
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
  exposedHeaders: "x-auth",
};

app.use(bodyParser.json());
app.use(cors(corsOptions));

//Socket 테스트위해 임시허용
const publicPath = path.join(__dirname, '../public');
app.use(express.static(publicPath));

import Router from './router/index';
Router(app);

let server = http.Server(app);

import mainChatSocket from './socket/mainChat';
mainChatSocket(server);
//
import subChatSocket from './socket/subChat';
subChatSocket(server);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'))
});


server.listen(port, () => {
  console.log(`Connteced to port ${port}`);
});

// Graceful stop
process.on('SIGINT', () => {
  setTimeout(() => {
    process.exit();
  }, 300)
});

module.exports = {app, server};

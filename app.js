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
  exposedHeaders: "x-auth",
};

app.use(bodyParser.json());
app.use(cors(corsOptions));

//Socket 테스트위해 임시허용
const publicPath = path.join(__dirname, '../public');
app.use(express.static(publicPath));

// for cross domain origin problem
// app.all('/', function(req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Headers", "X-Requested-With");
//   next();
//  });

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

// app.get('/main1', (req, res) => {
//   console.log('connected');
//   res.sendFile(path.join(__dirname, 'public/socket/index1.html'))
// });
//
// app.get('/main2', (req, res) => {
//   res.sendFile(path.join(__dirname, 'public/socket/index2.html'))
// });
//
// app.get('/sub1', (req, res) => {
//   res.sendFile(path.join(__dirname, 'public/socket/sub_index.html'))
// });
//
// app.get('/sub2', (req, res) => {
//   res.sendFile(path.join(__dirname, 'public/socket/sub_index2.html'))
// });
//
// app.get('/upload_img', (req, res) => {
//   res.sendFile(path.join(__dirname, 'public/s3test.html'));
// })

server.listen(port, () => {
  console.log(`Connteced to port ${port}`);
});

module.exports = {app, server};

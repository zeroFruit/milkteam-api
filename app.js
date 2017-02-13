import './config/env/env';

import express    from 'express';
import bodyParser from 'body-parser';
import {mongoose} from './config/mongodb';

const app     = express();
const port    = process.env.PORT;

app.use(bodyParser.json());

import Router from './router/index';
Router(app);

app.listen(port, () => {
  console.log(`Connteced to port ${port}`);
});

module.exports = {app};

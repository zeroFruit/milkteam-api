import './config/env/env';

import express    from 'express';
import {mongoose} from './config/mongodb';

const app     = express();
const port    = process.env.PORT;

import Router from './router/index';

Router(app);

app.listen(port, () => {
  console.log(`Connteced to port ${port}`);
});

module.exports = {app};

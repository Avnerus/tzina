import express from 'express';
import _ from 'lodash';

const app = express();
const server = require('http').Server(app);

app.use(express.static('public'));

server.listen(9966, function () {
      console.log('listening on port 9966!');
});

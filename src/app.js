const express = require('express');
const app = express();
const path = require('path');

const http = require('http').Server(app);
const socketio = require('socket.io')(http);

const { setupRoutes } = require('./modules');

app.use('/', setupRoutes());

const LOG_FILE_PATH = path.join(__dirname, './logs/server.log');

const Tail = require('./modules/tail/tail.service');
const tail = new Tail(LOG_FILE_PATH);
tail.bootstrap();


socketio.on('connection', (socket) => {
    console.log('New connection established', socket.id);
    tail.on('new-logs', (data) => {
        socket.emit('new-logs', data);
    })
    // new connection
    const latestData = tail.getLatestLogs();
    socket.emit('new-connection', latestData);
});

http.listen(process.env.PORT, () => {
    console.log('Server started on port:', process.env.PORT);
})
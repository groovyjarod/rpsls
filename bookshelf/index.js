// console.log('Hello World');
// const express = require('express');
// const app = express();
// const http = require('http');
// const server = http.createServer(app);
// const { Server } = require('socket.io');
// const io = new Server(server);
// // const logger = require('morgan');
// // const helmet = require('helmet');
// // const port = 3000;
// // const db = require('./db.json');

// app.use(express.static('public'));

// // also referred to as stubbing (whenever a callback only ever logs)
// io.on('connection', (socket) => {
//   socket.on('rpsls', (buf) => {
//     socket.emit('rpsls', buf);
//     console.log(`Message: ${msg}`);
//     // io.emit('chat message', msg)
//   });
//   // socket.on('cat', (msg) => console.log(`Message: ${msg}`))
//   // socket.on('disconnect', () => console.log('User disconnected.'))
// });

// form.addEventListener;

// server.listen(3000, () => console.log('listening of *:3000'));

// // app.get('/', (req, res) => {
// //   res.sendFile(__dirname + '/index.html');
// // });

// // app.get('/', (req, res) => {
// //   res.send('Hello World!');
// // });
// // app.get('*', (req, res, err) => {
// //   res.send('File Not Found, Poser.');
// //   res.sendFile();
// // });

// // const server = app.listen(port, () => {
// //   console.log(`Example app listening on port ${port}`);
// // });

// // load middleware

// // app.use(logger('dev'));

// // app.use(helmet());

// // REST endpoints

// // // Read get all logs /logs?courseId=cs4690&uvuId=10111111
// // app.get('/api/v1/logs', (req, res, err) => {
// //   const { courseId, uvuId } = req.query;
// //   // DEBUG res.send(`get Logs ${courseId} ${uvuId}`)

// //   // get data from the json file filter for only what you need and then send it back
// // });

// // app.get('/api/v2/logs', (req, res, err) => {
// //   const { courseId, uvuId } = req.query;
// //   // DEBUG res.send(`get Logs ${courseId} ${uvuId}`)

// //   // get data from the json file filter for only what you need and then send it back
// // });

// // function gracefulShutdown() {
// //   server.close(() => console.log('Server is now shut down.'));
// // }

// // process.on('SIGINT', gracefulShutdown);

// // create post (server id)

// // read get 1

// // update put (client id, full replace) patch (partial replace)

// // delete deletes

// // list gets all

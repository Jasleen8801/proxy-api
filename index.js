const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session');
const cookieParser = require('cookie-parser');
// const net = require('net');
const dotenv = require('dotenv');
dotenv.config();

const ConnectToDB = require('./utils/db');
const studentRoutes = require('./routes/student');
const adminRoutes = require('./routes/admin');
const teacherRoutes = require('./routes/teacher');

const app = express();
// const tcp_server = net.createServer();

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  session({
    secret: process.env.SECRET_KEY,
    cookie: { maxAge: 60000 },
    resave: false,
    saveUninitialized: false,
  })
);

const allowedOrigins = ['http://localhost:8000', '*'];
const corsOptions = {
  origin: function(origin, callback) {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
};

app.use(cors(corsOptions));

ConnectToDB();

app.use('/student', studentRoutes);
app.use('/admin', adminRoutes);
app.use('/teacher', teacherRoutes);

// tcp_server.on('connection', (socket) => {
//   console.log(`New connection from ${socket.remoteAddress}:${socket.remotePort}`);

//   socket.on('data', (data) => {
//     const receivedData = data.toString();
//     console.log(`Received data from client: ${receivedData}`);
//     socket.write(`Received data: ${receivedData}`);
    
//   });

//   socket.on('end', () => {
//     console.log(`Client ${socket.remoteAddress}:${socket.remotePort} disconnected`);
//   });
// });

const port = process.env.PORT || 3000;
// const tcp_port = process.env.TCP_PORT || 3001;

app.listen(port, () => {
  console.log(`Server is running on port ${port}.`);
});

// tcp_server.listen(tcp_port, () => {
//   console.log(`TCP Server listening on port ${tcp_port}`);
// });
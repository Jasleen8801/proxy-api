const net = require('net');
const mdnsService = require('./mdns');
const markAttendance = require('../../utils/markAttendance');

const startTCPServer = (port) => {
  const server = net.createServer(async (socket) => {
    socket.on('data', (data) => { 
      console.log(data.toString());
      const dataObj = JSON.parse(data.toString());
      const response = markAttendance(dataObj);
      socket.write(JSON.stringify(response));
    });
    socket.on('end', () => {
      console.log('Client disconnected');
    });
    socket.on('error', (err) => {
      console.log(err);
    });
  });

  server.listen(port, () => {
    console.log(`TCP Server started at port ${port}`);
  });

  mdnsService.on('teacherServiceDiscovered', (service) => {
    const studentSocket = net.connect(service.port, service.host, () => {
      console.log('Connected to teacher at ', service.host, service.port);
      studentSocket.write('Hello from student');
    });

    studentSocket.on('error', (err) => {
      console.log(err);
    });

    studentSocket.on('end', () => {
      console.log('Disconnected from teacher');
    });
  })
}

module.exports = startTCPServer;
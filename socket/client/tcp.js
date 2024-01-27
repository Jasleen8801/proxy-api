const net = require('net');

const sendAttendanceData = (host, port, data) => {
  const socket = net.connect(port, host, () => {
    socket.write(JSON.stringify(data), (err) => {
      if (err) {
        console.log(err);
      } else {
        console.log('Attendance Data Sent');
      }
    });
    socket.end();
  });

  socket.on('error', (err) => {
    console.log(err);
  });
}

module.exports = sendAttendanceData;
const mdnsService = require('./mdns');
const sendAttendanceData = require('./tcp');

const startSocketClient = (port, data) => {
  mdnsService.discoverService(data.networkInterface);

  mdnsService.on('serviceDiscovered', (service) => {
    console.log('Teacher service discovered', service);
    sendAttendanceData(port, service.host, data);
  });

  mdnsService.on('error', (err) => {
    console.log(err);
  });
};

module.exports = { startSocketClient };
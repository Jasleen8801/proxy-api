const mdnsService = require('./mdns');
const startTCPServer = require('./tcp');

const startSocketClient = (port, data) => {
  mdnsService.on('serviceDiscovered', (service) => {
    console.log('Teacher service discovered', service);
    startTCPServer(port, service.host, data);
  });

  mdnsService.discoverService(data.networkInterface);
};

module.exports = startSocketClient;
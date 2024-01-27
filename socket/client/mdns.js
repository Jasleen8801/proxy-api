const mdns = require('mdns');
const EventEmitter = require('events');

class MDNSService extends EventEmitter {
  discoverService(networkInterface) {
    const browser = mdns.createBrowser(
      mdns.tcp('http'),
      { resolverSequence: [mdns.rst.DNSServiceResolve(), 'DNSServiceGetAddrInfo'] },
      { networkInterface: networkInterface }
    );

    browser.on('serviceUp', (service) => {
      this.emit('serviceDiscovered', {
        name: service.name,
        type: service.type,
        host: service.host,
        port: service.port,
      });
    });

    browser.start();
  }
}

const MDNSService = new MDNSService();
module.exports = MDNSService;
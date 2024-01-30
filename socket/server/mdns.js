const mdns = require('mdns');
const EventEmitter = require('events');

class MDNSService extends EventEmitter {
  startAdvertisement(port, name, teacherID, networkInterface) {
    const ad = mdns.createAdvertisement(
      mdns.tcp('http'), 
      port,
      {
        name: name,
        txtRecord: {
          teacherID: teacherID,
          networkInterface: networkInterface,
        },
      }
    )
    ad.start();

    const browser = mdns.createBrowser(mdns.tcp('teacher-service'), { networkInterface: networkInterface });
    browser.on('serviceUp', (service) => {
      this.emit('teacherServiceDiscovered', {
        name: service.name,
        type: service.type,
        host: service.host,
        port: service.port,
      });
    });
    browser.start();
  }
}

const mdnsService = new MDNSService();
module.exports = mdnsService;
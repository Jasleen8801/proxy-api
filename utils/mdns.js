const mdns = require('mdns');

const createAdvertisement = (courseCode, port, teacherMACAddress) => {
  const ad = mdns.createAdvertisement(mdns.tcp('http'), port, {
    name: courseCode,
    txtRecord: {
      macAddress: teacherMACAddress,
    },
  });
  ad.start();
  return ad;
};

const stopAdvertisement = (ad) => {
  ad.stop();
}

module.exports = createAdvertisement, stopAdvertisement;
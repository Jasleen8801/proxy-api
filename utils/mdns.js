const mdns = require('mdns');

const createAdvertisement = (courseCode, port, teacherID) => {
  const ad = mdns.createAdvertisement(mdns.tcp('http'), port, {
    name: courseCode,
    txtRecord: {
      teacherID: teacherID,
    },
  });
  ad.start();
  return ad;
};

const stopAdvertisement = (ad) => {
  ad.stop();
}

module.exports = createAdvertisement, stopAdvertisement;
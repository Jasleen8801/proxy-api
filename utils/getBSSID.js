const arpscan = require('arpscan/promise');

async function getBSSID(ipAddress) {
  return new Promise((resolve, reject) => {
    arpscan(onScan);

    function onScan(err, data) {
      if(err) {
        reject(err);
      } else {
        const device = data.find((device) => device.ip === ipAddress);
        resolve(device ? device.bssid : null);
      }
    }
  })
}
  
module.exports = getBSSID;
const mdnsService = require('./mdns');
const tcpServer = require('./tcp');

const activeSessions = new Map();

const startSocketServer = (session) => {
  mdnsService.startAdvertisement(session.port, session.name, session.teacherID, session.networkInterface);
  const server = tcpServer(session.port);
  activeSessions.set(session._id, server);
}

const stopSocketServer = (session) => {
  const server = activeSessions.get(session._id);
  if(server) {
    server.close();
    activeSessions.delete(session._id);
    console.log('Session closed')
  }
}

module.exports = { startSocketServer, stopSocketServer };
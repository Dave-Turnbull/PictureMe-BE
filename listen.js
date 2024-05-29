const {httpServer} = require('./app.js');
const PORT = 8080;

httpServer.listen(PORT, () => console.log(`Listening on ${PORT}...`));

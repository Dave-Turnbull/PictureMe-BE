const {httpServer} = require('./app.js');
const PORT = 3000;

httpServer.listen(PORT, () => console.log(`Listening on ${PORT}...`));

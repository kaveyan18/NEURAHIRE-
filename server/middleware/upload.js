const multer = require('multer');

// Setup multer memory storage (do not save files to disk)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

module.exports = upload;

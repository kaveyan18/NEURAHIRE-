require('dotenv').config();
const app = require('./app');

const port = process.env.PORT || 3001;

// Start the server
app.listen(port, () => {
  console.log(`Server is running gracefully on http://localhost:${port}`);
});

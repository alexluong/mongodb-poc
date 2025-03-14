import { createDBClient } from "./db.js";
import { createServer } from "./server.js";

const PORT = process.env.PORT || 8080;
const dbClient = createDBClient();
const server = createServer(dbClient);
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

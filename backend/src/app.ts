import express from "express";
import "dotenv/config";
import cors from "cors";

import router from "./routes";
import { logger } from "./middlewares";

const app = express();
const hostname = process.env.HOST_URL || "";
const port = 3000;

app.use(logger);
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use("/records", express.static("./../records"));

app.use(router);

app.listen(port, hostname, () => {
  console.log(`App listening on http://${hostname}:${port}`);
});

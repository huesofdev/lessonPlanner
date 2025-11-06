import express from "express";
import cors from 'cors'
import { v1Router, v2Router } from "../routes/index.js";
import { dbConnection, dbDisconnection } from "../configs/database-config.js";
import bodyParser from "body-parser";
import serverConfigs from "../configs/server.configs.js";

const { PORT } = serverConfigs;

dbConnection();

const app = express();
app.use(cors())

//body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(bodyParser.text());

//routers
app.use("/api/v1", v1Router);
app.use("/api/v2", v2Router);

app.listen(PORT, () => {
  console.log(`Server is Started on ${PORT}`);
});

import express from "express";
import bodyParser from "body-parser";
import morgan from "morgan";

import "../app/amqp";
import { apiRouter } from "../app/router";
import { connectDB } from "../utils/mongo-db";

const app = express();
const port = 3000;

connectDB();

app.use(
  morgan("[:date[iso]] Started :method :url for :remote-addr", {
    immediate: true,
  }),
);
app.use(bodyParser.json());
app.use("/api", apiRouter);

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});

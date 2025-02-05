import express from "express";
import bodyParser from "body-parser";
import morgan from "morgan";

import "src/app/amqp";
import { apiRouter } from "src/app/router";

const app = express();
const port = 3000;

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

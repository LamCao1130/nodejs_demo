import express from "express";
import bodyParser from "body-parser";
import router from "./router.js";
import "dotenv/config";
import cors from "cors";

const app = express();

const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.use(router);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

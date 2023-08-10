import express from "express";

const app = express();
const hostname = "192.168.0.11";
const port = 3000;

app.use(express.json());

app.post("/save-reading", (req, res) => {
  res.send(req.body);
});

app.post("/start-test", (req, res) => {
  res.send(req.body);
});

app.post("/end-test", (req, res) => {
  res.send(req.body);
});

app.listen(port, hostname, () => {
  console.log(`App listening on http://${hostname}:${port}`);
});

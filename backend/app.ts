import express from "express";
import fs from "fs";
import { formatFileName, getCurrentTestName } from "./utils";

const app = express();
const hostname = "192.168.0.11";
const port = 3000;

app.use(express.json());

app.post("/save-reading", (req, res) => {
  try {
    const currentTestName = getCurrentTestName();

    if (!currentTestName) {
      throw new Error(
        "No test is currently in progress. To start one, use /start-test."
      );
    }

    const time = req.body.time;
    const voltage = req.body.voltage;
    if (typeof time !== "number" || typeof voltage !== "number") {
      throw new Error(
        "Invalid reading value/s. Time and voltage must be numbers."
      );
    }

    const content = `${time},${voltage}\n`;
    fs.writeFileSync(`../records/${formatFileName(currentTestName)}`, content, {
      flag: "a",
    });
    res.json({ message: `Reading saved to the test "${currentTestName}".` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/start-test", (req, res) => {
  try {
    const currentTestName = getCurrentTestName();

    if (currentTestName) {
      throw new Error(
        `Test "${currentTestName}" is currently in progress. To stop it, use /end-test.`
      );
    }

    fs.writeFileSync(
      `../records/${formatFileName(req.body.name)}`,
      "Time,Voltage\n"
    );
    res.json({ message: `New test started with name "${req.body.name}".` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/end-test", (req, res) => {
  try {
    const currentTestName = getCurrentTestName();

    if (!currentTestName) {
      throw new Error("No test is currently in progress.");
    }

    fs.renameSync(
      `../records/${formatFileName(currentTestName)}`,
      `../records/${currentTestName}.csv`
    );
    res.json({
      message: `Test with name "${currentTestName}" has been stopped.`,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.listen(port, hostname, () => {
  console.log(`App listening on http://${hostname}:${port}`);
});

import express from "express";
import fs from "fs/promises";
import {
  formatFileName,
  getCurrentTestName,
  isTestNameAvailable,
} from "./utils";

const app = express();
const hostname = "192.168.0.11";
const port = 3000;

app.use(express.json());

app.post("/save-reading", async (req, res) => {
  try {
    const currentTestName = await getCurrentTestName();

    if (!currentTestName) {
      res.status(400).json({
        message:
          "No test is currently in progress. To start one, use /start-test.",
      });
      return;
    }

    const time = req.body.time;
    const voltage = req.body.voltage;
    if (typeof time !== "number" || typeof voltage !== "number") {
      res.status(400).json({
        message: "Invalid reading value/s. Time and voltage must be numbers.",
      });
      return;
    }

    const content = `${time},${voltage}\n`;
    await fs.writeFile(
      `../records/${formatFileName(currentTestName)}`,
      content,
      {
        flag: "a",
      }
    );
    res.json({ message: `Reading saved to the test "${currentTestName}".` });
  } catch (err) {
    res.status(500).json({
      message: "An unexpected error has occurred. The reading was not saved.",
    });
  }
});

app.post("/start-test", async (req, res) => {
  try {
    const name = req.body.name;
    if (!name || typeof name !== "string" || name.length === 0) {
      res.status(400).json({
        message: "Invalid test name. It must be a string",
      });
      return;
    }

    const currentTestName = await getCurrentTestName();

    if (currentTestName) {
      res.status(400).json({
        message: `Test "${currentTestName}" is currently in progress. To stop it, use /end-test.`,
      });
      return;
    }

    const isNameAvailable = await isTestNameAvailable(name);

    if (!isNameAvailable) {
      res.status(400).json({
        message: `A test with name "${name}" already exists.`,
      });
      return;
    }

    await fs.writeFile(`../records/${formatFileName(name)}`, "Time,Voltage\n");
    res.json({ message: `New test started with name "${name}".` });
  } catch (err) {
    res.status(500).json({
      message: "An unexpected error has occurred. The test has not started.",
    });
  }
});

app.post("/end-test", async (req, res) => {
  try {
    const currentTestName = await getCurrentTestName();

    if (!currentTestName) {
      res.status(400).json({
        message: "No test is currently in progress.",
      });
      return;
    }

    await fs.rename(
      `../records/${formatFileName(currentTestName)}`,
      `../records/${currentTestName}.csv`
    );
    res.json({
      message: `Test with name "${currentTestName}" has been stopped.`,
    });
  } catch (err) {
    res.status(500).json({
      message: "An unexpected error has occurred. The test has not stopped.",
    });
  }
});

app.listen(port, hostname, () => {
  console.log(`App listening on http://${hostname}:${port}`);
});

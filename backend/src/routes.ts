import express from "express";
import fs from "fs/promises";
import { promisify } from "util";
import { exec } from "child_process";

import {
  formatFileName,
  getCurrentTestName,
  isTestNameAvailable,
} from "./utils";

const router = express.Router();

/**
 * Gets the name of the test that is currently in progress. If none, returns an empty object.
 */
router.get("/get-current-test-name", async (req, res) => {
  try {
    const currentTestName = await getCurrentTestName();
    res.json({ currentTestName: currentTestName });
  } catch (err) {
    res.status(500).json({
      message: "An unexpected error has occurred.",
    });
  }
});

/**
 * Gets the list of names of the existing test graphs.
 */
router.get("/get-test-list", async (req, res) => {
  try {
    const recordsDir = await fs.readdir("./../records");
    const testNames = recordsDir.filter(
      (name) => name.slice(name.length - 4, name.length) === ".png"
    );
    res.json({ testNames: testNames });
  } catch (err) {
    res.status(500).json({
      message: "An unexpected error has occurred.",
    });
  }
});

/**
 * Saves a voltage and time reading. Both values should be numbers, and a test must be in progress.
 * Returns the corresponding error if any of those conditions are not met.
 */
router.post("/save-reading", async (req, res) => {
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
      `./../records/${formatFileName(currentTestName)}`,
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

/**
 * Starts a new test, given a name. The name can only contain numbers, letters and underscores.
 * If a test is already in progress or the given name is invalid or already taken, returns an error.
 */
router.post("/start-test", async (req, res) => {
  try {
    const currentTestName = await getCurrentTestName();
    if (currentTestName) {
      res.status(400).json({
        message: `Test "${currentTestName}" is currently in progress. To stop it, use /end-test.`,
      });
      return;
    }

    const name = req.body.name;
    const sanitizationRegex = /[^\w\d]/;
    if (
      typeof name !== "string" ||
      name === "" ||
      sanitizationRegex.test(name)
    ) {
      res.status(400).json({
        message:
          "Invalid test name. It must be a string, and can only contain letters, numbers and underscores.",
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

    await fs.writeFile(
      `./../records/${formatFileName(name)}`,
      "Time,Voltage\n"
    );
    res.json({ message: `New test started with name "${name}".` });
  } catch (err) {
    res.status(500).json({
      message: "An unexpected error has occurred. The test has not started.",
    });
  }
});

/**
 * Ends the current test. If no test is in progress, returns an error.
 * After ending the test, starts the python script to plot the test values.
 */
router.post("/end-test", async (req, res) => {
  try {
    const currentTestName = await getCurrentTestName();
    if (!currentTestName) {
      res.status(400).json({
        message: "No test is currently in progress.",
      });
      return;
    }

    await fs.rename(
      `./../records/${formatFileName(currentTestName)}`,
      `./../records/${currentTestName}.csv`
    );

    try {
      await promisify(exec)(`python3 ./curve_plotter.py "${currentTestName}"`);
    } catch (error) {
      console.error(`Error executing curve_plotter.py: ${error}`);
    }

    res.json({
      message: `Test with name "${currentTestName}" has been stopped.`,
    });
  } catch (err) {
    res.status(500).json({
      message: "An unexpected error has occurred. The test has not stopped.",
    });
  }
});

export default router;

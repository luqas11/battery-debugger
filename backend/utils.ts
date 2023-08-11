import fs from "fs/promises";

/**
 * @returns the name of the current test in progress. If none is, returns undefined.
 */
export const getCurrentTestName = async () => {
  const recordsDir = await fs.readdir("../records");
  const fileName = recordsDir.find((file) => file.startsWith("current_"));

  if (!fileName) return;

  return fileName.slice(8, -4);
};

/**
 * @param name
 * @returns the file name string for a test, given it's name.
 */
export const formatFileName = (name: string) => {
  return "current_" + name + ".csv";
};

/**
 *
 * @param name
 * @returns wether a test with a given name exists or not.
 */
export const isTestNameAvailable = async (name: string) => {
  const recordsDir = await fs.readdir("../records");
  const fileName = recordsDir.find((file) => file === `${name}.csv`);

  return !fileName;
};

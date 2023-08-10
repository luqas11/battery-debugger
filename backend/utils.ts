import fs from "fs/promises";

export const getCurrentTestName = async () => {
  const recordsDir = await fs.readdir("../records");
  const fileName = recordsDir.find((file) => file.startsWith("current_"));

  if (!fileName) return;

  return fileName.slice(8, -4);
};

export const formatFileName = (name: string) => {
  return "current_" + name + ".csv";
};

export const isTestNameAvailable = async (name: string) => {
  const recordsDir = await fs.readdir("../records");
  const fileName = recordsDir.find((file) => file === `${name}.csv`);

  return !fileName;
};

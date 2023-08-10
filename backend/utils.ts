import fs from "fs";

export const getCurrentTestName = () => {
  const recordsDir = fs.readdirSync("../records");
  const fileName = recordsDir.find((file) => file.startsWith("current_"));

  if (!fileName) return;

  return fileName.slice(8, -4);
};

export const formatFileName = (name: string) => {
  return "current_" + name + ".csv";
};

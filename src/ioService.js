import fs from "fs";

/**
 * Saves tasks to a JSON file
 */
export const exportTasks = (tasks, filename = "tasks.json") => {
  fs.writeFileSync(filename, JSON.stringify(tasks, null, 2), "utf-8");
  console.log(`Aufgaben wurden in ${filename} exportiert.`);
};

/**
 * Loads tasks from a JSON file
 */
export const importTasks = (filename = "tasks.json") => {
  if (!fs.existsSync(filename)) {
    console.log(`${filename} existiert nicht.`);
    return [];
  }
  const data = fs.readFileSync(filename, "utf-8");
  const parsed = JSON.parse(data);
  console.log(`Aufgaben aus ${filename} importiert.`);
  return parsed;
};

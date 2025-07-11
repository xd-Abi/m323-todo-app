/**
 * Pipeline composition
 */
export const processTasksPipeline = (tasks, ...fns) =>
  fns.reduce((acc, fn) => fn(acc), tasks);

/**
 * Prints tasks nicely
 */
export const printTasksPipeline = (tasks) => {
  const processed = processTasksPipeline(
    tasks,
    (ts) =>
      ts.map((t) => `#${t.id}: ${t.title} | ${t.category} | bis ${t.deadline}`),
    (ts) => ts.reduce((acc, line) => acc + line + "\n", "")
  );
  console.log(processed || "Keine Aufgaben gefunden.");
};

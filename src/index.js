// Importiere prompts für Konsolen-Interaktion
import prompts from "prompts";

/**
 * Pure Function: Erzeugt eine neue Aufgabe.
 */
const createTask = (title, category, deadline) => ({
  id: Date.now(),
  title,
  category,
  deadline: deadline.toISOString().split("T")[0],
});

/**
 * Pure Function: Fügt Aufgabe immutabel hinzu.
 */
const addTask = (tasks, task) => [...tasks, task];

/**
 * Pure Function: Löscht Aufgabe nach ID.
 */
const deleteTask = (tasks, id) => tasks.filter((t) => t.id !== id);

/**
 * Pure Function: Filtert Aufgaben nach Predicate.
 */
const filterTasks = (tasks, predicate) => tasks.filter(predicate);

/**
 * Pipeline: Transformation + Ausgabe.
 * Nutzt map → filter → reduce → zentrale Ausgabe.
 */
const processTasksPipeline = (tasks, ...fns) =>
  fns.reduce((acc, fn) => fn(acc), tasks);

/**
 * Pipeline-Verwendung in Ausgabe: Erzeugt formatierte Strings, filtert optional, reduziert zu String.
 */
const printTasksPipeline = (tasks, categoryFilter = null) => {
  const processed = processTasksPipeline(
    tasks,
    (ts) =>
      categoryFilter
        ? ts.filter(
            (t) => t.category.toLowerCase() === categoryFilter.toLowerCase()
          )
        : ts,
    (ts) =>
      ts.map((t) => `#${t.id}: ${t.title} | ${t.category} | bis ${t.deadline}`),
    (ts) => ts.reduce((acc, line) => acc + line + "\n", "")
  );
  console.log(processed || "Keine Aufgaben gefunden.");
};

/**
 * Hauptloop: Pure Logik mit rekursivem Loop, kein globaler Zustand.
 */
const run = async (tasks = []) => {
  const { action } = await prompts({
    type: "select",
    name: "action",
    message: "Was möchtest du tun?",
    choices: [
      { title: "Aufgabe hinzufügen", value: "add" },
      { title: "Alle Aufgaben anzeigen", value: "list" },
      { title: "Nach Kategorie filtern", value: "filterCat" },
      { title: "Nach Deadline filtern", value: "filterDate" },
      { title: "Aufgabe löschen", value: "delete" },
      { title: "Beenden", value: "exit" },
    ],
  });

  const actions = {
    add: async () => {
      const input = await prompts([
        { type: "text", name: "title", message: "Titel:" },
        { type: "text", name: "category", message: "Kategorie:" },
        {
          type: "date",
          name: "deadline",
          message: "Deadline:",
          mask: "YYYY-MM-DD",
        },
      ]);
      const newTasks = addTask(
        tasks,
        createTask(input.title, input.category, input.deadline)
      );
      return run(newTasks);
    },

    list: async () => {
      printTasksPipeline(tasks); // Pipeline-Ausgabe
      return run(tasks);
    },

    filterCat: async () => {
      const { cat } = await prompts({
        type: "text",
        name: "cat",
        message: "Kategorie:",
      });
      printTasksPipeline(tasks, cat); // Pipeline-Ausgabe mit Filter
      return run(tasks);
    },

    filterDate: async () => {
      const { date } = await prompts({
        type: "date",
        name: "date",
        message: "Datum:",
      });
      const formatted = date.toISOString().split("T")[0];
      const filtered = filterTasks(tasks, (t) => t.deadline === formatted);
      printTasksPipeline(filtered); // Pipeline-Ausgabe
      return run(tasks);
    },

    delete: async () => {
      const { id } = await prompts({
        type: "number",
        name: "id",
        message: "ID der Aufgabe:",
      });
      const newTasks = deleteTask(tasks, id);
      return run(newTasks);
    },

    exit: async () => {
      console.log("Programm beendet.");
      return;
    },
  };

  return actions[action] ? await actions[action]() : run(tasks);
};

run();

import prompts from "prompts";
import {
  createTask,
  addTask,
  deleteTask,
  updateTask,
  filterTasks,
  sortTasks,
} from "./taskService.js";
import { printTasksPipeline } from "./taskPipeline.js";
import { exportTasks, importTasks } from "./ioService.js";
import { VALID_CATEGORIES } from "./constants.js";

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
      { title: "Aufgabe aktualisieren", value: "update" },
      { title: "Aufgaben sortieren", value: "sort" },
      { title: "Aufgaben exportieren", value: "export" },
      { title: "Aufgaben importieren", value: "import" },
      { title: "Beenden", value: "exit" },
    ],
  });

  const actions = {
    add: async () => {
      const input = await prompts([
        { type: "text", name: "title", message: "Titel:" },
        {
          type: "text",
          name: "category",
          message: `Kategorie (${VALID_CATEGORIES.join(", ")}):`,
        },
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
      printTasksPipeline(tasks);
      return run(tasks);
    },

    filterCat: async () => {
      const { cat } = await prompts({
        type: "text",
        name: "cat",
        message: "Kategorie:",
      });
      printTasksPipeline(
        filterTasks(
          tasks,
          (t) => t.category.toLowerCase() === cat.toLowerCase()
        )
      );
      return run(tasks);
    },

    filterDate: async () => {
      const { date } = await prompts({
        type: "date",
        name: "date",
        message: "Datum:",
      });
      const formatted = date.toISOString().split("T")[0];
      printTasksPipeline(filterTasks(tasks, (t) => t.deadline === formatted));
      return run(tasks);
    },

    delete: async () => {
      const { id } = await prompts({
        type: "number",
        name: "id",
        message: "ID der Aufgabe:",
      });
      return run(deleteTask(tasks, id));
    },

    update: async () => {
      const { id } = await prompts({
        type: "number",
        name: "id",
        message: "ID der Aufgabe:",
      });
      const taskToUpdate = tasks.find((t) => t.id === id);
      if (!taskToUpdate) {
        console.log("Aufgabe nicht gefunden.");
        return run(tasks);
      }
      const updates = await prompts([
        {
          type: "text",
          name: "title",
          message: `Neuer Titel (${taskToUpdate.title}):`,
          initial: taskToUpdate.title,
        },
        {
          type: "text",
          name: "category",
          message: `Neue Kategorie (${taskToUpdate.category}):`,
          initial: taskToUpdate.category,
        },
        {
          type: "date",
          name: "deadline",
          message: `Neue Deadline (${taskToUpdate.deadline}):`,
          initial: new Date(taskToUpdate.deadline),
        },
      ]);
      const updatedTasks = updateTask(tasks, id, {
        title: updates.title,
        category: updates.category,
        deadline: updates.deadline.toISOString().split("T")[0],
      });
      return run(updatedTasks);
    },

    sort: async () => {
      const { sortKey } = await prompts({
        type: "select",
        name: "sortKey",
        message: "Sortieren nach:",
        choices: [
          { title: "Deadline", value: "deadline" },
          { title: "Titel", value: "title" },
        ],
      });
      const { direction } = await prompts({
        type: "select",
        name: "direction",
        message: "Sortierrichtung:",
        choices: [
          { title: "Aufsteigend", value: "asc" },
          { title: "Absteigend", value: "desc" },
        ],
      });
      printTasksPipeline(sortTasks(tasks, sortKey, direction));
      return run(tasks);
    },

    export: async () => {
      exportTasks(tasks);
      return run(tasks);
    },

    import: async () => {
      const imported = importTasks();
      return run(imported);
    },

    exit: async () => {
      console.log("Programm beendet.");
      return;
    },
  };

  return actions[action] ? await actions[action]() : run(tasks);
};

run();

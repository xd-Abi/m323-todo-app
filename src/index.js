const prompts = require("prompts");

let tasks = [];

async function main() {
  let exit = false;

  while (!exit) {
    const response = await prompts({
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

    switch (response.action) {
      case "add":
        const newTask = await prompts([
          { type: "text", name: "title", message: "Titel:" },
          { type: "text", name: "category", message: "Kategorie:" },
          {
            type: "date",
            name: "deadline",
            message: "Deadline:",
            mask: "YYYY-MM-DD",
          },
        ]);
        tasks = addTask(tasks, {
          id: Date.now(),
          title: newTask.title,
          category: newTask.category,
          deadline: newTask.deadline.toISOString().split("T")[0],
        });
        break;

      case "list":
        printTasks(tasks);
        break;

      case "filterCat":
        const catInput = await prompts({
          type: "text",
          name: "cat",
          message: "Kategorie:",
        });
        printTasks(filterByCategory(tasks, catInput.cat));
        break;

      case "filterDate":
        const dateInput = await prompts({
          type: "date",
          name: "date",
          message: "Datum:",
        });
        const formatted = dateInput.date.toISOString().split("T")[0];
        printTasks(filterByDeadline(tasks, formatted));
        break;

      case "delete":
        const delInput = await prompts({
          type: "number",
          name: "id",
          message: "ID der Aufgabe:",
        });
        tasks = deleteTask(tasks, delInput.id);
        break;

      case "exit":
        exit = true;
        console.log("Tschüss!");
        break;
    }
  }
}

function addTask(tasks, task) {
  return [...tasks, task];
}

function deleteTask(tasks, id) {
  return tasks.filter((t) => t.id !== id);
}

function filterByCategory(tasks, category) {
  return tasks.filter(
    (t) => t.category.toLowerCase() === category.toLowerCase()
  );
}

function filterByDeadline(tasks, deadline) {
  return tasks.filter((t) => t.deadline === deadline);
}

function printTasks(tasks) {
  if (tasks.length === 0) {
    console.log("Keine Aufgaben gefunden.");
    return;
  }

  tasks.forEach((t) => {
    console.log(`#${t.id}: ${t.title} | ${t.category} | bis ${t.deadline}`);
  });
}

main();

// Importiere das prompts-Paket für Konsoleninteraktion
const prompts = require("prompts");

// Pure, immutable task list (wird durch Spread / Filter nie direkt mutiert)
let tasks = [];

/**
 * Higher-order function zum Filtern von Tasks nach einem Predicate.
 * Nutzt .filter (funktionale Programmierung).
 */
const filterTasks = (tasks, predicate) => tasks.filter(predicate);

/**
 * Rekursive Funktion zur Ausgabe der Aufgabenliste.
 * Vermeidet for-Schleifen, um Rekursion zu üben.
 */
function printTasksRec(tasks, index = 0) {
  if (index >= tasks.length) return;
  const t = tasks[index];
  console.log(`#${t.id}: ${t.title} | ${t.category} | bis ${t.deadline}`);
  printTasksRec(tasks, index + 1);
}

/**
 * Pipeline-orientierte Funktion:
 * Wendet alle übergebenen Funktionen (HOFs) auf die Task-Liste an
 * und gibt die gefilterten/verarbeiteten Tasks rekursiv aus.
 */
function processAndPrint(tasks, ...fns) {
  const processed = fns.reduce((acc, fn) => fn(acc), tasks);
  printTasksRec(processed);
}

/**
 * Pure Function zum Hinzufügen einer neuen Aufgabe.
 * Gibt eine neue Task-Liste zurück.
 */
function addTask(tasks, task) {
  return [...tasks, task];
}

/**
 * Pure Function zum Löschen einer Aufgabe anhand der ID.
 * Gibt eine neue Task-Liste zurück ohne die gelöschte Aufgabe.
 */
function deleteTask(tasks, id) {
  return tasks.filter((t) => t.id !== id);
}

/**
 * Pattern Matching Simulation:
 * Ruft den passenden Handler basierend auf der Aktion auf.
 * Nutzt "_" als Fallback für ungültige Eingaben.
 */
function matchAction(action, handlers) {
  if (handlers[action]) {
    return handlers[action]();
  } else if (handlers["_"]) {
    return handlers["_"]();
  }
}

/**
 * Hauptfunktion für die Konsolen-Applikation.
 * Stellt ein Menü zur Verfügung und bearbeitet Benutzeraktionen.
 */
async function main() {
  let exit = false;

  while (!exit) {
    // Auswahlmenü für Aktionen
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

    // Pattern Matching für die gewählte Aktion
    await matchAction(action, {
      // Aufgabe hinzufügen
      add: async () => {
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
      },

      // Alle Aufgaben anzeigen
      list: () => {
        processAndPrint(tasks);
      },

      // Aufgaben nach Kategorie filtern und anzeigen
      filterCat: async () => {
        const { cat } = await prompts({
          type: "text",
          name: "cat",
          message: "Kategorie:",
        });
        processAndPrint(tasks, (ts) =>
          filterTasks(ts, (t) => t.category.toLowerCase() === cat.toLowerCase())
        );
      },

      // Aufgaben nach Deadline filtern und anzeigen
      filterDate: async () => {
        const { date } = await prompts({
          type: "date",
          name: "date",
          message: "Datum:",
        });
        const formatted = date.toISOString().split("T")[0];
        processAndPrint(tasks, (ts) =>
          filterTasks(ts, (t) => t.deadline === formatted)
        );
      },

      // Aufgabe löschen anhand der ID
      delete: async () => {
        const { id } = await prompts({
          type: "number",
          name: "id",
          message: "ID der Aufgabe:",
        });
        tasks = deleteTask(tasks, id);
      },

      // Programm beenden
      exit: () => {
        exit = true;
        console.log("Tschüss!");
      },

      // Fallback für ungültige Auswahl
      _: () => {
        console.log("Ungültige Auswahl.");
      },
    });
  }
}

// Starte die Applikation
main();

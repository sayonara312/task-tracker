import fs, { stat } from "fs";
const filePath = "tasks.json";

function fileExists(filename) {
  try {
    fs.accessSync(filename);
    return true;
  } catch (error) {
    return false;
  }
}

function readJsonFile(filename) {
  try {
    const data = fs.readFileSync(filename, "utf8");
    return JSON.parse(data);
  } catch (error) {
    writeJsonFile(filename, []);
    console.log("Error reading file:", error.message);
    return null;
  }
}

function writeJsonFile(filename, data) {
  try {
    const jsonString = JSON.stringify(data, null, 2);
    fs.writeFileSync(filename, jsonString, "utf8");
    return true;
  } catch (error) {
    console.log("Error writing file:", error.message);
    return false;
  }
}

// Lấy arguments từ command line
const args = process.argv.slice(2);
console.log("Arguments:", args);

if (args.length === 0) {
  console.log("No command provided. Use 'add', 'list', or 'complete'.");
  process.exit(1);
}
const command = args[0];
const addTask = (task) => {
  console.log(`Adding task: ${task}`);

  const nextId =
    readJsonFile(filePath).reduce((maxId, task) => {
      return task.id > maxId ? task.id : maxId;
    }, 0) + 1;
  const newTask = {
    id: nextId,
    description: task,
    status: "todo",
    createdAt: new Date().toISOString(),
    updatedAt: null,
  };

  if (fileExists(filePath)) {
    const fileJson = readJsonFile(filePath);
    console.log("File JSON:", fileJson);
    if (fileJson) {
      const initialData = [...fileJson, newTask];
      writeJsonFile(filePath, initialData);
      return;
    }
  }
};

const updateTask = (taskID, newDescription) => {
  console.log(
    `Updating task with ID: ${taskID} to new description: ${newDescription}`
  );
  if (fileExists(filePath)) {
    const fileJson = readJsonFile(filePath);
    console.log("File JSON:", fileJson);
    if (fileJson) {
      const listTaskFilter = fileJson.map((task) => {
        if (task.id === parseInt(taskID)) {
          return {
            ...task,
            description: newDescription,
            updatedAt: new Date().toISOString(),
          };
        }
        return task;
      });
      writeJsonFile(filePath, listTaskFilter);
      return;
    }
  }
};

const deleteTask = (taskID) => {
  console.log(`Deleting task with ID: ${taskID}`);
  if (fileExists(filePath)) {
    const fileJson = readJsonFile(filePath);
    console.log("File JSON:", fileJson);
    if (fileJson) {
      const listTaskFilter = fileJson.filter(
        (task) => task.id !== parseInt(taskID)
      );
      writeJsonFile(filePath, listTaskFilter);
      return;
    }
  }
};

const updateStatus = (taskID, status) => {
  console.log(`Updating status of task with ID: ${taskID} to ${status}`);
  if (fileExists(filePath)) {
    const fileJson = readJsonFile(filePath);
    console.log("File JSON:", fileJson);
    if (fileJson) {
      const listTaskFilter = fileJson.map((task) => {
        if (task.id === parseInt(taskID)) {
          return {
            ...task,
            status: status,
            updatedAt: new Date().toISOString(),
          };
        }
        return task;
      });
      writeJsonFile(filePath, listTaskFilter);
      return;
    }
  }
};

const showListTask = (type) => {
  console.log(`Showing list of tasks${type ? ` with status: ${type}` : ""}`);

  if (fileExists(filePath)) {
    const fileJson = readJsonFile(filePath);

    if (fileJson) {
      console.table(
        fileJson.filter((task) => (type ? task.status === type : true))
      );
      return;
    }
  }
};
const taskID = args.slice(1).join(" ").at(0);

switch (command) {
  case "add":
    const task = args.slice(1).join(" ");
    if (!task) {
      console.log("Please provide a task to add.");
      process.exit(1);
    }
    addTask(task);
    break;

  case "update":
    const newDescription = args.slice(2).join(" ");
    console.log(
      `Updating task with ID: ${taskID} to new description: ${newDescription}`
    );

    updateTask(taskID, newDescription);
    break;
  case "delete":
    deleteTask(taskID);
    break;
  case "mark-in-progress":
    updateStatus(taskID, "in-progress");

    break;
  case "mark-done":
    updateStatus(taskID, "done");
    break;
  case "list":
    console.log("args", args.length);

    if (args.length < 2) {
      showListTask();
      break;
    } else if (args.length >= 2) {
      const cmd2 = args.slice(1, 2).join(" ");

      switch (cmd2) {
        case "done":
          showListTask("done");
          break;
        case "todo":
          showListTask("todo");
          break;
        case "in-progress":
          showListTask("in-progress");
          break;

        default:
          break;
      }
    }
    break;

  default:
    console.log(`Unknown command: ${command}`);
    process.exit(1);
}

// IMPORTS

import { FormEvent, useEffect, useRef, useState } from "react";
import "./App.css";
import { Store } from "tauri-plugin-store-api";

import { ask, confirm, message } from "@tauri-apps/api/dialog";

// import {
//   isPermissionGranted,
//   requestPermission,
//   sendNotification,
// } from "@tauri-apps/api/notification";

import { AnimatePresence, motion } from "framer-motion";

import {
  ArrowDownToLineIcon,
  ArrowUpFromLineIcon,
  ListEndIcon,
  ListStartIcon,
  SaveIcon,
  HourglassIcon,
  CalendarClockIcon,
  DownloadIcon,
  EditIcon,
  TrashIcon,
  CopyIcon,
} from "lucide-react";

// ===============================

function App() {
  // CONSTANTS

  const buttonLabels = [
    <ListStartIcon />,
    <ListEndIcon />,
    <HourglassIcon />,
    <CalendarClockIcon />,
    <DownloadIcon />,
    <SaveIcon />,
  ];

  const buttonActions = [
    demoAddTop,
    demoAddBottom,
    () => {},
    () => {},
    () => {},
    saveAll,
  ];

  const [taskArray, setTaskArray] = useState<Task[]>([]);

  const [inputLength, setInputLength] = useState<number>(0);

  const [showToolbar, setShowToolbar] = useState<boolean>(true);

  const [infoDialog, setInfoDialog] = useState<string>("");

  const taskEnterBar = useRef<HTMLInputElement>(null);

  const draggedTask = useRef<number>(0);
  const dragTarget = useRef<number>(0);

  const MAX_TASK_NAME_LENGTH = 60;
  const MAX_INPUT_BOX = 999;

  type Task = { name: string; createdAt: number };

  const store = new Store(".tasks.dat");

  // =========================

  // CORE APP FUNCTIONS

  async function saveTaskList(): Promise<void> {
    await store.set("task_list", { value: taskArray });
    await store.save();
  }

  async function saveAll(): Promise<void> {
    await saveTaskList();
    showDialog("message", "info", "Your tasks have been successfully saved.");
  }

  async function getTaskList(): Promise<void> {
    const data = await store.get<{ value: Task[] }>("task_list");

    if (data != null) {
      setTaskArray(data.value);
    }
  }

  async function getToolbarShown(): Promise<void> {
    const data = await store.get<{ value: boolean }>("toolbar_shown");

    if (data != null) {
      setShowToolbar(data.value);
    }
  }

  function checkTaskRequirements() {
    let result = false;

    if (taskEnterBar.current) {
      if (taskEnterBar.current!.value.split(" ").join("") == "") {
        setInfoDialog(
          "Add a task using one of the buttons in the toolbar above."
        );
      } else {
        result = true;
      }
      if (taskEnterBar.current!.value.length > MAX_TASK_NAME_LENGTH) {
        setInfoDialog(
          `Please choose a task name less than ${MAX_TASK_NAME_LENGTH} characters in length.`
        );
        result = false;
      }
    }
    return result;
  }

  async function toggleToolbarVisibility(): Promise<void> {
    if (showToolbar) {
      setShowToolbar(false);
    } else {
      setShowToolbar(true);
    }
  }

  function getInputBox(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  function updateInputLength(): void {
    setInputLength(taskEnterBar.current!.value.length);
  }

  function canGetInput() {
    return taskEnterBar.current != null ? true : false;
  }

  // ====================================

  // TOOLBAR FUNCTIONS

  function demoAddTop(): void {
    if (checkTaskRequirements()) {
      setTaskArray((prev) => [
        { name: taskEnterBar.current!.value, createdAt: Date.now() },
        ...prev,
      ]);
      setInfoDialog("");
      return;
    }
  }

  function demoAddBottom(): void {
    if (checkTaskRequirements()) {
      setTaskArray((prev) => [
        ...prev,
        { name: taskEnterBar.current!.value, createdAt: Date.now() },
      ]);
      setInfoDialog("");
      return;
    }
  }

  function removeTask(timeCreated: number): void {
    setTaskArray((prev) =>
      prev.filter((task, _) => task.createdAt != timeCreated)
    );
  }

  // ====================================

  // HOVER OPTION HANDLERS

  function showTaskActions(createdAt: string) {
    let taskActionElement = document.getElementById(createdAt);

    if (!taskActionElement) {
      return;
    }

    taskActionElement.className = "mt-4";
  }
  function hideTaskActions(createdAt: string) {
    let taskActionElement = document.getElementById(createdAt);

    if (!taskActionElement) {
      return;
    }

    taskActionElement.className = "hidden";
  }

  function showClearButton(): void {
    let clearButtonElement = document.getElementById(
      "clear-button-hover-element"
    );

    if (!clearButtonElement) {
      return;
    }

    clearButtonElement.className = "my-auto";
  }

  function hideClearButton(): void {
    let clearButtonElement = document.getElementById(
      "clear-button-hover-element"
    );

    if (!clearButtonElement) {
      return;
    }

    clearButtonElement.className = "hidden";
  }

  // ====================================

  // TASK FUNCTIONS

  async function editEntry(timeCreated: number): Promise<void> {
    let newName = taskEnterBar.current!.value;

    if (newName.length == 0) {
      setInfoDialog(
        "To edit a task name, type the new name in the input box and press the edit button for the corresponding task."
      );
      return;
    }
    let confirm = await showDialog(
      "confirm",
      "info",
      "Are you sure you want to edit this task name?",
      "Edit Task"
    );

    if (!confirm) {
      return;
    }

    let reformedArray: Task[] = [];
    taskArray.forEach((element) => {
      if (element.createdAt == timeCreated) {
        element.name = newName;
      }
      reformedArray.push(element);
    });
    setInfoDialog("");
    setTaskArray(reformedArray);
  }

  function copyEntryName(timeCreated: number): void {
    taskArray.forEach((element) => {
      if (element.createdAt == timeCreated) {
        taskEnterBar.current!.value = element.name;
      }
    });
  }

  function clearInputBar(): void {
    taskEnterBar.current!.value = "";
  }

  // function timedTask() {
  //   showDialog(
  //     "ask",
  //     "info",
  //     "Timed Task",
  //     "Enter the duration for this task."
  //   );
  // }

  // function scheduleTask() {
  //   showNotification("Scheduled Task", "This is a notification.");
  // }

  // ==============

  // UTILITY FUNCTIONS

  async function showDialog(
    dialog_format: string,
    dialog_type: any, // info, warning, error
    message_string: string,
    title: string = ""
  ): Promise<any> {
    if (title.length == 0) {
      switch (dialog_format) {
        case "confirm":
          return await confirm(message_string);
        case "ask":
          return await ask(message_string);
        case "message":
          return await message(message_string);
        default:
          break;
      }
    } else {
      switch (dialog_format) {
        case "confirm":
          return await confirm(message_string, {
            title: title,
            type: dialog_type,
          });
        case "ask":
          return await ask(message_string, {
            title: title,
            type: dialog_type,
          });
        case "message":
          return await message(message_string, {
            title: title,
            type: dialog_type,
          });
        default:
          break;
      }
    }
  }

  // async function showNotification(message: string, title: string = "") {
  //   let notifsPermsGranted = await isPermissionGranted();

  //   if (!notifsPermsGranted) {
  //     const permission = await requestPermission();
  //     notifsPermsGranted = permission === "granted";
  //   }

  //   if (notifsPermsGranted) {
  //     if (title.length == 0) {
  //       sendNotification(message);
  //     } else {
  //       sendNotification({ title: title, body: message });
  //     }
  //   } else {
  //     showDialog(
  //       "message",
  //       "warning",
  //       "Notification Permissions",
  //       "A notification was unable to be sent due to insufficient permissions or internal errors."
  //     );
  //   }
  // }

  function showWorkInProgress(): void {
    showDialog(
      "message",
      "info",
      "This feature has not been implemented yet.",
      "Feature in Development"
    );
  }

  async function swapListItems(): Promise<void> {
    const copiedList = [...taskArray];
    const selectedDrag = taskArray[draggedTask.current];
    const targetDrag = taskArray[dragTarget.current];

    // Prevent dialog for move to same position.
    if (draggedTask.current == dragTarget.current) {
      return;
    }

    const dialogResponse = await showDialog(
      "confirm",
      "warning",
      "Modify List",
      `Are you sure you want to move the item at position #${
        draggedTask.current + 1
      } to position #${dragTarget.current + 1}?`
    );

    if (dialogResponse) {
      copiedList[draggedTask.current] = targetDrag;
      copiedList[dragTarget.current] = selectedDrag;

      setTaskArray(copiedList);
    }
  }

  useEffect(() => {
    getTaskList();
    getToolbarShown();
    console.log("Fetched user tasks.");
  }, []);

  // =======================

  // COMPUTATION

  // =======================

  const DECAY_RATE: number = 0.2;
  const DECAY_MIN = 0;

  function gradientFunction(index: number): number {
    if (index <= 0) {
      return 1;
    }
    return 1 / (DECAY_RATE * (index - 1) + 1) + DECAY_MIN * (1 - 1 / index);
  }

  // STYLE CONSTANTS

  const toolbarStyle =
    "p-2 text-white hover:bg-slate-700 transition ease-in-out duration-300";

  const taskStyle =
    "ml-0 mr-4 font-overpass text-xl text-center text-white p-6 bg-slate-500 hover:bg-slate-700 hover:shadow-2xl transition duration-300 ease-in-out cursor-pointer mx-36 rounded-lg border-2 border-slate-300";

  const taskActionStyle = "mx-4 justify-center";
  // =======================

  return (
    <div className="relative font-overpass">
      <div className="gap-4">
        {/* Toolbar */}
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`flex justify-center sticky top-0 flex-wrap p-4 bg-slate-400 gap-3 z-50 ${
              showToolbar ? "" : "hidden"
            }`}
          >
            {buttonLabels.map((label, index) => {
              return (
                <motion.button
                  whileHover={{
                    scale: 1.1,
                    fontWeight: 800,
                    backgroundColor: "rgb(0, 51, 153)",
                  }}
                  whileTap={{ scale: 1.2, fontWeight: 500 }}
                  className={toolbarStyle}
                  onClick={() => {
                    if (buttonActions[index].name.length != 0) {
                      buttonActions[index]();
                    } else {
                      showWorkInProgress();
                    }
                  }}
                  key={index}
                >
                  {label}
                </motion.button>
              );
            })}
          </motion.div>
        </AnimatePresence>
        {/* Toggle Toolbar Button */}
        <motion.div
          whileHover={{ backgroundColor: "rgb(170, 180, 190)" }}
          className="flex flex-col justify-center bg-slate-300 p-2 mb-5 z-50 cursor-pointer"
          onClick={() => toggleToolbarVisibility()}
        >
          <motion.button
            className="m-auto"
            whileHover={{
              fontWeight: 800,
            }}
          >
            {showToolbar ? <ArrowUpFromLineIcon /> : <ArrowDownToLineIcon />}
          </motion.button>
        </motion.div>
        {/* Task Entry Bar and Character Limit Dialog */}
        {showToolbar ? (
          <div>
            <motion.div
              className="flex justify-center"
              onHoverStart={showClearButton}
              onHoverEnd={hideClearButton}
            >
              <form id="task-input-form" onSubmit={(e) => getInputBox(e)}>
                <motion.input
                  ref={taskEnterBar}
                  initial={{ x: -150 }}
                  animate={{ x: 0 }}
                  name="task-name-input"
                  className="font-overpass text-lg p-4 w-96 active border-solid border-b-2 border-black focus:outline-none"
                  type="text"
                  placeholder="Enter a task name..."
                  onInput={updateInputLength}
                  maxLength={MAX_INPUT_BOX}
                />
              </form>
              <span id={"clear-button-hover-element"} className={"hidden"}>
                <button
                  onClick={() => clearInputBar()}
                  title="Press to clear the input bar."
                >
                  <TrashIcon />
                </button>
              </span>
            </motion.div>
            <h2 className="font-overpass font-light text-lg text-center p-2">
              {showToolbar ? infoDialog : undefined}
            </h2>
            {canGetInput() && taskEnterBar.current!.value.length > 0 ? (
              <h3
                className={
                  "font-overpass font-bold text-md text-center " +
                  (showToolbar &&
                  canGetInput() &&
                  taskEnterBar.current!.value.length > MAX_TASK_NAME_LENGTH
                    ? "text-red-700"
                    : "")
                }
              >
                {inputLength} out of {MAX_TASK_NAME_LENGTH} characters used
              </h3>
            ) : undefined}
          </div>
        ) : undefined}
        {/* Main Tasklist Section */}
        <div>
          <ul className="list-none flex flex-col justify-center gap-2">
            <AnimatePresence>
              {/* Pending Task Count Display */}
              {taskArray.length > 0 ? (
                <div className="flex flex-col justify-center">
                  <h2 className="font-overpass font-semibold text-3xl text-red-900 text-center p-4">
                    You have {taskArray.length} pending task
                    {taskArray.length > 1 ? "s" : ""}.
                  </h2>
                </div>
              ) : (
                ""
              )}
              {/* Task Rendering */}
              {taskArray.length > 0 ? (
                taskArray.map((task, index) => {
                  return (
                    <div className="flex flex-row justify-center">
                      <motion.li
                        draggable
                        title={`Task Name: ${task.name} | Task Index: ${index} | Task Created At: ${task.createdAt}\nClick on the task name to remove this task.`}
                        onDragStart={() => (draggedTask.current = index)}
                        onDragEnter={() => (dragTarget.current = index)}
                        onHoverStart={() =>
                          showTaskActions(task.createdAt.toString())
                        }
                        onHoverEnd={() =>
                          hideTaskActions(task.createdAt.toString())
                        }
                        onDragEnd={swapListItems}
                        onDragOver={(e) => e.preventDefault()}
                        whileHover={{
                          scale: index == 0 ? 1.035 : 1.025,
                          fontWeight: 800,
                          backgroundColor:
                            index == 0 ? "rgb(0, 133, 0)" : "rgb(51, 65, 85)", // HOVER COLORS
                        }}
                        whileTap={{ scale: 1.03, fontWeight: 900 }}
                        initial={{
                          scale: index == 0 ? 1.025 : 1,
                          opacity: 1,
                          backgroundColor:
                            index == 0
                              ? "rgb(205, 30, 0)"
                              : `rgb(${gradientFunction(index) * 100}, ${
                                  gradientFunction(index) * 116
                                }, ${gradientFunction(index) * 139})`, // ENTRY COLORS (0, 153, 0) - green
                          y: -30,
                        }}
                        animate={{ y: 0 }}
                        exit={{
                          opacity: 0,
                        }}
                        key={index}
                        className={taskStyle}
                      >
                        <p onClick={() => removeTask(task.createdAt)}>
                          {task.name}
                        </p>
                        <div
                          id={task.createdAt.toString()}
                          className={"hidden"}
                        >
                          <button
                            className={taskActionStyle}
                            onClick={() => copyEntryName(task.createdAt)}
                            title="Press this button to automatically copy this task's name to the input bar for quick editing."
                          >
                            <CopyIcon />
                          </button>
                          <button
                            className={taskActionStyle}
                            onClick={() => editEntry(task.createdAt)}
                            title="Enter a new name in the input box and press this edit button to apply changes."
                          >
                            <EditIcon />
                          </button>
                        </div>
                      </motion.li>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col justify-center">
                  <h2 className="font-overpass font-semibold text-green-900 text-2xl text-center p-4">
                    You have no pending tasks.
                  </h2>
                  <img
                    draggable={false}
                    className="h-48 w-48 m-auto"
                    src="/img/icon.png"
                  />
                </div>
              )}
            </AnimatePresence>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;

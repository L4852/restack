// IMPORTS

import { FormEvent, useEffect, useRef, useState } from "react";
import "./App.css";
import { Store } from "tauri-plugin-store-api";

import { ask, confirm, message } from "@tauri-apps/api/dialog";

import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from "@tauri-apps/api/notification";

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
    timedTask,
    scheduleTask,
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

  const MAX_TASK_NAME_LENGTH = 140;
  const MAX_INPUT_BOX = 999;

  type Task = { name: string; createdAt: number };

  const store = new Store(".tasks.dat");

  // =========================

  // CORE FUNCTIONS

  async function saveTaskList() {
    await store.set("task_list", { value: taskArray });
    await store.save();
  }

  async function saveAll() {
    await saveTaskList();
    showDialog("message", "info", "Your tasks have been successfully saved.");
  }

  async function getTaskList() {
    const data = await store.get<{ value: Task[] }>("task_list");

    if (data != null) {
      setTaskArray(data.value);
    }
  }

  async function getToolbarShown() {
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

  async function toggleToolbarVisibility() {
    if (showToolbar) {
      setShowToolbar(false);
    } else {
      setShowToolbar(true);
    }
  }

  function getInputBox(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  function updateInputLength() {
    setInputLength(taskEnterBar.current!.value.length);
  }

  function canGetInput() {
    return taskEnterBar.current != null ? true : false;
  }

  // ====================================

  // TOOLBAR FUNCTIONS

  function demoAddTop() {
    if (checkTaskRequirements()) {
      setTaskArray((prev) => [
        { name: taskEnterBar.current!.value, createdAt: Date.now() },
        ...prev,
      ]);
      setInfoDialog("");
      return;
    }
  }

  function demoAddBottom() {
    if (checkTaskRequirements()) {
      setTaskArray((prev) => [
        ...prev,
        { name: taskEnterBar.current!.value, createdAt: Date.now() },
      ]);
      setInfoDialog("");
      return;
    }
  }

  function removeTask(timeCreated: number) {
    setTaskArray((prev) =>
      prev.filter((task, _) => task.createdAt != timeCreated)
    );
  }

  function timedTask() {
    showDialog(
      "ask",
      "info",
      "Timed Task",
      "Enter the duration for this task."
    );
  }

  function scheduleTask() {
    showNotification("Scheduled Task", "This is a notification.");
  }

  // ==============

  // UTILITY FUNCTIONS

  async function showDialog(
    dialog_format: string,
    dialog_type: any, // info, warning, error
    message_string: string,
    title: string = ""
  ) {
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

  async function showNotification(message: string, title: string = "") {
    let notifsPermsGranted = await isPermissionGranted();

    if (!notifsPermsGranted) {
      const permission = await requestPermission();
      notifsPermsGranted = permission === "granted";
    }

    if (notifsPermsGranted) {
      if (title.length == 0) {
        sendNotification(message);
      } else {
        sendNotification({ title: title, body: message });
      }
    } else {
      showDialog(
        "message",
        "warning",
        "Notification Permissions",
        "A notification was unable to be sent due to insufficient permissions or internal errors."
      );
    }
  }

  function showWorkInProgress() {
    showDialog(
      "message",
      "info",
      "Feature in Progress",
      "This feature has not been implemented yet."
    );
  }

  async function refreshTasklist() {
    const copiedList = [...taskArray];
    const selectedDrag = taskArray[draggedTask.current];
    const targetDrag = taskArray[dragTarget.current];

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

  // STYLE CONSTANTS

  const toolbarStyle =
    "bg-slate-500 p-2 text-white hover:bg-slate-700 transition ease-in-out duration-300";

  const taskStyle =
    "text-center text-white p-6 bg-slate-500 hover:bg-slate-700 hover:shadow-2xl transition duration-300 ease-in-out cursor-pointer mx-36 rounded-lg border-2 border-slate-300";

  // =======================

  return (
    <div className="relative font-inter-tight">
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
            <div className="flex justify-center">
              <form id="task-input-form" onSubmit={(e) => getInputBox(e)}>
                <motion.input
                  ref={taskEnterBar}
                  initial={{ x: -150 }}
                  animate={{ x: 0 }}
                  name="task-name-input"
                  className="p-4 w-96 active border-solid border-b-2 border-black focus:outline-none"
                  type="text"
                  placeholder="Enter a task name..."
                  onInput={updateInputLength}
                  maxLength={MAX_INPUT_BOX}
                />
              </form>
            </div>
            <h2 className="font-inter-tight font-light text-md text-center p-2">
              {showToolbar ? infoDialog : undefined}
            </h2>
            {canGetInput() && taskEnterBar.current!.value.length > 0 ? (
              <h3
                className={
                  "font-inter-tight font-bold text-sm text-center " +
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
                  <h2 className="font-inter-tight font-semibold text-2xl text-red-900 text-center p-4">
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
                    <motion.li
                      draggable
                      onDragStart={() => (draggedTask.current = index)}
                      onDragEnter={() => (dragTarget.current = index)}
                      onDragEnd={refreshTasklist}
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
                          index == 0 ? "rgb(205, 30, 0)" : "rgb(100, 116, 139)", // ENTRY COLORS (0, 153, 0) - green
                        y: -30,
                      }}
                      animate={{ y: 0 }}
                      exit={{
                        opacity: 0,
                      }}
                      key={index}
                      className={taskStyle}
                      onClick={() => removeTask(task.createdAt)}
                    >
                      {task.name}
                    </motion.li>
                  );
                })
              ) : (
                <div className="flex flex-col justify-center">
                  <h2 className="font-inter-tight font-semibold text-green-900 text-2xl text-center p-4">
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

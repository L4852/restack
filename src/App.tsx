import { FormEvent, useEffect, useRef, useState } from "react";
import "./App.css";
import { Store } from "tauri-plugin-store-api";

import { AnimatePresence, motion } from "framer-motion";

import {
  ArrowDownToLineIcon,
  ArrowUpFromLineIcon,
  ListEndIcon,
  ListStartIcon,
  SaveIcon,
} from "lucide-react";

function App() {
  const buttonLabels = [<ListStartIcon />, <ListEndIcon />, "Γγ", "Δδ", "Eε"];

  const [taskArray, setTaskArray] = useState<Task[]>([]);

  const [inputLength, setInputLength] = useState<number>(0);

  const [showToolbar, setShowToolbar] = useState<boolean>(true);

  const [infoDialog, setInfoDialog] = useState<string>("");

  const taskEnterBar = useRef<HTMLInputElement>(null);

  const MAX_TASK_NAME_LENGTH = 140;
  const MAX_INPUT_BOX = 999;

  type Task = { name: string; createdAt: number };

  async function saveTaskList() {
    await store.set("task_list", { value: taskArray });
    await store.save();
  }

  async function getTaskList() {
    const data = await store.get<{ value: Task[] }>("task_list");

    if (data != null) {
      setTaskArray(data.value);
    }
  }

  const store = new Store(".tasks.dat");

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

  function toggleToolbarVisibility() {
    if (showToolbar) {
      setShowToolbar(false);
      return 0;
    }
    setShowToolbar(true);
    return 1;
  }

  function getInputBox(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  function updateInputLength() {
    setInputLength(taskEnterBar.current!.value.length);
  }

  useEffect(() => {
    getTaskList();
    console.log("Fetched user tasks.");
  }, []);

  const toolbarStyle =
    "bg-slate-500 p-2 text-white hover:bg-slate-700 transition ease-in-out duration-300";

  const taskStyle =
    "text-center text-white p-6 bg-slate-500 hover:bg-slate-700 hover:shadow-2xl transition duration-300 ease-in-out cursor-pointer mx-36 rounded-lg border-2 border-slate-300";

  return (
    <div className="relative font-inter-tight">
      <div className="gap-4">
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
                    switch (index) {
                      case 0:
                        demoAddTop();
                        break;
                      case 1:
                        demoAddBottom();
                        break;
                      default:
                        break;
                    }
                  }}
                  key={index}
                >
                  {label}
                </motion.button>
              );
            })}
            <motion.button
              whileHover={{
                scale: 1.1,
                fontWeight: 800,
                backgroundColor: "rgb(51, 204, 204)",
              }}
              className={toolbarStyle}
              onClick={() => saveTaskList()}
            >
              <SaveIcon />
            </motion.button>
          </motion.div>
        </AnimatePresence>
        <motion.div
          whileHover={{ backgroundColor: "rgb(41, 194, 245)" }}
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
        <div>
          <ul className="list-none flex flex-col justify-center gap-2">
            <AnimatePresence>
              {taskArray.length > 0 ? (
                <div className="flex flex-col justify-center">
                  <h2 className="font-inter-tight font-light text-md text-center p-2">
                    {infoDialog}
                  </h2>
                  {taskEnterBar.current!.value.length > 0 ? (
                    <h3
                      className={
                        "font-inter-tight font-bold text-sm text-center " +
                        (taskEnterBar.current!.value.length >
                        MAX_TASK_NAME_LENGTH
                          ? "text-red-700"
                          : "")
                      }
                    >
                      {inputLength} out of {MAX_TASK_NAME_LENGTH} characters
                      used
                    </h3>
                  ) : undefined}

                  <h2 className="font-inter-tight font-semibold text-2xl text-red-900 text-center p-4">
                    You have {taskArray.length} pending task
                    {taskArray.length > 1 ? "s" : ""}.
                  </h2>
                </div>
              ) : (
                ""
              )}
              {taskArray.length > 0 ? (
                taskArray.map((task, index) => {
                  return (
                    <motion.li
                      whileHover={{
                        scale: index == 0 ? 1.035 : 1.025,
                        fontWeight: 800,
                        backgroundColor:
                          index == 0 ? "rgb(0, 133, 0)" : "rgb(51, 65, 85)",
                      }}
                      whileTap={{ scale: 1.03, fontWeight: 900 }}
                      initial={{
                        scale: index == 0 ? 1.025 : 1,
                        opacity: 1,
                        backgroundColor:
                          index == 0 ? "rgb(0, 153, 0)" : "rgb(100, 116, 139)",
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

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

  const [showToolbar, setShowToolbar] = useState<boolean>(true);

  const taskEnterBar = useRef<HTMLInputElement>(null);

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

  function demoAddTop() {
    setTaskArray((prev) => [
      { name: taskEnterBar.current!.value, createdAt: Date.now() },
      ...prev,
    ]);
    taskEnterBar.current!.value = "";
  }

  function demoAddBottom() {
    setTaskArray((prev) => [
      ...prev,
      { name: taskEnterBar.current!.value, createdAt: Date.now() },
    ]);
    taskEnterBar.current!.value = "";
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
            />
          </form>
        </div>
        <div>
          <ul className="list-none flex flex-col justify-center gap-2">
            <AnimatePresence>
              {taskArray.length > 0 ? (
                <div className="flex flex-col justify-center">
                  <h2 className="font-inter-tight font-semibold text-2xl text-center p-4">
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
                        scale: 1.025,
                        fontWeight: 800,
                        backgroundColor:
                          index == 0 ? "rgb(0, 133, 0)" : "rgb(51, 65, 85)",
                      }}
                      whileTap={{ scale: 1.03, fontWeight: 900 }}
                      initial={{
                        opacity: 1,
                        backgroundColor:
                          index == 0 ? "rgb(0, 153, 0)" : "rgb(100, 116, 139)",
                        y: -30,
                      }}
                      animate={{ y: 0 }}
                      exit={{
                        opacity: 0,
                      }}
                      key={task.createdAt}
                      className={taskStyle}
                      onClick={() => removeTask(task.createdAt)}
                    >
                      {task.name}
                    </motion.li>
                  );
                })
              ) : (
                <div className="flex flex-col justify-center">
                  <h2 className="font-inter-tight font-semibold text-2xl text-center p-4">
                    You have no pending tasks.
                  </h2>
                  <img className="h-48 w-48 m-auto" src="/img/icon.png" />
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

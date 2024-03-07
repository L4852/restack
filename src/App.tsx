import { useEffect, useState } from "react";
import "./App.css";
import { Store } from "tauri-plugin-store-api";

import { AnimatePresence, motion } from "framer-motion";

import {
  ArrowDownToLineIcon,
  ArrowUpFromLineIcon,
  SaveIcon,
} from "lucide-react";

function App() {
  const buttonLabels = [
    "Alpha",
    "Beta",
    "Gamma",
    "Delta",
    "Epsilon",
    "Zeta",
    "Eta",
    "Theta",
    "Iota",
    "Kappa",
    "Lambda",
    "Mu",
    "Nu",
    "Xi",
    "Omicron",
    "Pi",
    "Rho",
    "Sigma",
    "Tau",
    "Upsilon",
    "Phi",
    "Chi",
    "Psi",
    "Omega",
  ];
  const buttonLetters = [
    "Aα",
    "Bβ",
    "Γγ",
    "Δδ",
    "Eε",
    "Zζ",
    "Ηη",
    "Θθ",
    "Ιι",
    "Κκ",
    "Λλ",
    "Mμ",
    "Νν",
    "Ξξ",
    "Οο",
    "Ππ",
    "Ρρ",
    "Σσς",
    "Ττ",
    "Υυ",
    "Φφ",
    "Χχ",
    "Ψψ",
    "Ωω",
  ];

  const [taskArray, setTaskArray] = useState<Task[]>([]);

  const [showToolbar, setShowToolbar] = useState<boolean>(true);

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

  function demoAdd(value: string) {
    setTaskArray((prev) => [...prev, { name: value, createdAt: Date.now() }]);
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

  useEffect(() => {
    getTaskList();
    console.log("Fetched user tasks.");
  }, []);

  const toolbarStyle =
    "bg-slate-500 p-2 text-white hover:bg-slate-700transition ease-in-out duration-300";

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
                  onClick={() => demoAdd(label + ` (${buttonLetters[index]})`)}
                  key={index}
                >
                  {buttonLetters[index]}
                </motion.button>
              );
            })}
            <input
              className="p-2"
              type="text"
              placeholder="Enter a task name..."
            />
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
                taskArray.map((task, _) => {
                  return (
                    <motion.li
                      whileHover={{
                        scale: 1.025,
                        fontWeight: 800,
                        backgroundColor: "rgb(0, 153, 0)",
                      }}
                      whileTap={{ scale: 1.03, fontWeight: 900 }}
                      initial={{
                        opacity: 1,
                      }}
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

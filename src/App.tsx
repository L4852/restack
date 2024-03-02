import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/tauri";
import "./App.css";

function App() {
  const [taskArray, setTaskArray] = useState([
    "Alpha (Aα)",
    "Beta (Bβ)",
    "Gamma (Γγ)",
    "Delta (Δδ)",
  ]);

  function demo_add(value: string) {
    setTaskArray((prev) => [...prev, value]);
  }

  function removeTask(index: number) {
    setTaskArray((prev) => prev.filter((_, i) => index != i));
  }

  return (
    <div>
      <div>
        <div className="flex justify-start p-4 bg-slate-300 fixed gap-3">
          <button
            className="bg-slate-500 p-2 text-white hover:bg-slate-700 transition ease-in-out duration-300"
            onClick={() => demo_add("Alpha (Aα)")}
          >
            Aα
          </button>
          <button
            className="bg-slate-500 p-2 text-white hover:bg-slate-700 transition ease-in-out duration-300"
            onClick={() => demo_add("Beta (Bβ)")}
          >
            Bβ
          </button>
          <button
            className="bg-slate-500 p-2 text-white hover:bg-slate-700 transition ease-in-out duration-300"
            onClick={() => demo_add("Gamma (Γγ)")}
          >
            Γγ
          </button>
          <button
            className="bg-slate-500 p-2 text-white hover:bg-slate-700 transition ease-in-out duration-300"
            onClick={() => demo_add("Delta (Δδ)")}
          >
            Δδ
          </button>
          <button
            className="bg-slate-500 p-2 text-white hover:bg-slate-700 transition ease-in-out duration-300"
            onClick={() => demo_add("Epsilon (Eε)")}
          >
            Eε
          </button>
          <button
            className="bg-slate-500 p-2 text-white hover:bg-slate-700 transition ease-in-out duration-300"
            onClick={() => demo_add("Zeta (Zζ)")}
          >
            Zζ
          </button>
        </div>
        <ul className="list-none grid justify-center gap-2">
          {taskArray.map((task, index) => {
            return (
              <li
                key={index}
                className="text-center text-white p-6 bg-slate-500 hover:bg-slate-700 transition duration-300 ease-in-out cursor-pointer"
                onClick={() => removeTask(index)}
              >
                {task}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

export default App;

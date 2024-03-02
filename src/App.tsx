import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/tauri";
import "./App.css";

function App() {
  const [taskArray, setTaskArray] = useState([
    "Alpha",
    "Beta",
    "Gamma",
    "Delta",
  ]);

  function add() {
    setTaskArray((prev) => {
      prev.push("1");
      return prev;
    });
  }

  return (
    <div>
      <div>
        <div className="flex justify-start p-4 bg-slate-300 fixed">
          <button>A</button>
          <button>B</button>
          <button>C</button>
        </div>
        <ul className="list-none grid justify-center gap-2">
          {taskArray.map((task, index) => {
            return <li key={index} className="text-center text-white p-6 bg-slate-500 hover:bg-slate-700 transition duration-300 ease-in-out cursor-pointer">{task}</li>;
          })}
        </ul> 
      </div>
    </div>
  );
}

export default App;

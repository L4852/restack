import { useState } from "react";
import "./App.css";

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

  const toolbarStyle =
    "bg-slate-500 p-2 text-white hover:bg-slate-700 hover:font-bold transition ease-in-out duration-300";

  return (
    <div className="relative">
      <div className="gap-4">
        <div className="flex justify-center sticky top-0 flex-wrap p-4 bg-slate-400 gap-3 mb-5">
          {buttonLabels.map((label, index) => {
            return (
              <button
                className={toolbarStyle}
                onClick={() => demo_add(label + ` (${buttonLetters[index]})`)}
                key={index}
              >
                {buttonLetters[index]}
              </button>
            );
          })}
        </div>
        <div>
          <ul className="list-none flex flex-col justify-center gap-2">
            {taskArray.map((task, index) => {
              return (
                <li
                  key={index}
                  className="text-center text-white p-6 bg-slate-500 hover:bg-slate-700 hover:font-bold transition duration-300 ease-in-out cursor-pointer mx-36"
                  onClick={() => removeTask(index)}
                >
                  {task}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;

import { SyntheticEvent } from "./eventSystem";
import {
  render,
  createElement,
  useState,
  useCallback,
  useEffect,
} from "./index";

function App() {
  const [count, setCount] = useState(0);
  const [text, setText] = useState("");
  const [tasks, setTasks] = useState<string[]>([]);
  const [color, setColor] = useState("blue");

  const increment = useCallback(() => {
    setCount((prev) => prev + 1);
  }, []);

  const handleInputChange = useCallback((event: SyntheticEvent) => {
    setText((event.target as HTMLInputElement).value);
  }, []);

  const addTask = useCallback(() => {
    console.log("Current text:", text);
    console.log("Current tasks:", tasks);
    if (text) {
      setTasks((prev) => [...prev, text]);
      setText("");
    }
  }, [text]);

  useEffect(() => {
    console.log("Count updated:", count);
  }, [count]);

  useEffect(() => {
    console.log("Task list updated:", tasks);
  }, [tasks]);

  const handleClick = useCallback(() => {
    setColor((color) => (color === "blue" ? "green" : "blue"));
  }, [color]);

  return createElement(
    "div",
    { className: "app" },
    createElement("h1", { style: { color: color } }, "Complex UI"),
    createElement("h2", {}, `Counter: ${count}`),
    createElement("button", { onClick: increment }, "Increment"),
    createElement("hr"),
    createElement("input", {
      type: "text",
      value: text,
      onInput: handleInputChange,
    }),
    createElement("button", { onClick: addTask }, "Add Task"),
    createElement(
      "ul",
      {},
      ...tasks.map((task, index) => createElement("li", { key: index }, task)),
    ),
    createElement("hr"),
    createElement(
      "button",
      {
        onClick: handleClick,
      },
      "Change Title Color",
    ),
  );
}

window.addEventListener("DOMContentLoaded", () => {
  const app = document.getElementById("app");
  if (app) {
    render(createElement(App, {}), app);
  }
});

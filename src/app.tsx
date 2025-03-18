import { SyntheticEvent } from "./eventSystem";
import {
  render,
  useState,
  useCallback,
  useEffect,
  createElement,
} from "./index";

function ButtonOne() {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount((prev) => prev + 1)}>Count: {count}</button>
  );
}

function ButtonTwo() {
  const [text, setText] = useState("");
  return (
    <input
      type="text"
      value={text}
      onChange={(e: SyntheticEvent) =>
        setText((e.target as HTMLInputElement).value)
      }
    />
  );
}

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

  return (
    <div className="app">
      <h1 style={{ color: color }}>Complex UI</h1>
      <h2>Counter: {count}</h2>
      <button onClick={increment}>Increment</button>
      <hr />
      <input type="text" value={text} onInput={handleInputChange} />
      <button onClick={addTask}>Add Task</button>
      <ul>
        {tasks.map((task, index) => (
          <li key={index}>{task}</li>
        ))}
      </ul>
      <hr />
      <button onClick={handleClick}>Change Title Color</button>
      <ButtonOne />
      <ButtonTwo />
    </div>
  );
}

window.addEventListener("DOMContentLoaded", () => {
  const app = document.getElementById("app");
  if (app) {
    render(<App />, app);
  }
});

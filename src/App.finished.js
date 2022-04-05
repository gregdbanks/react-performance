import React, { useState, useEffect, useCallback, useMemo } from "react";

function Todo({ todo, index, removeTodo }) {
  const [done, setDone] = useState(false);
  return (
    <div>
      <span style={{ textDecoration: done ? "line-through" : "" }}>
        {todo.text}
      </span>
      <div>
        <button onClick={() => setDone(!done)}>✓</button>{" "}
        <button onClick={() => removeTodo(index)}>✕</button>
      </div>
    </div>
  );
}

function FormTodo({ addTodo }) {
  const [value, setValue] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!value) return;
    addTodo(value);
    setValue("");
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>
          <b>Add Todo</b>
        </label>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Add new todo"
        />
      </div>
      <button type="submit">Submit</button>
    </form>
  );
}

function App() {
  const [todos, setTodos] = useState([]);

  useEffect(() => {
    fetch("/todos.json")
      .then((res) => res.json())
      .then((data) => {
        setTodos(data);
      });
  }, []);

  const addTodo = useCallback(
    (text) => {
      const newTodos = [...todos, { text }];
      setTodos(newTodos);
    },
    [todos]
  );

  const removeTodo = useCallback(
    (index) => {
      const newTodos = [...todos];
      newTodos.splice(index, 1);
      setTodos(newTodos);
    },
    [todos]
  );

  const expensiveCalculation = (num) => {
    for (let i = 0; i < 1000000000; i++) {
      num += 1;
    }
    return num;
  };

  useMemo(() => expensiveCalculation(100000000000000000000), []);
  // expensiveCalculation(100000000000000000000);

  return (
    <div>
      <div style={{ margin: "auto" }}>
        <h1>Todo List</h1>
        <FormTodo addTodo={addTodo} />
        <div>
          {todos.map((todo, index) => (
            <>
              <Todo
                key={index}
                index={index}
                todo={todo}
                removeTodo={removeTodo}
              />
            </>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;

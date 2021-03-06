import React, { useState } from "react";

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
  console.log(`1 Start`);

  const [todos] = useState([]);

  console.log(`2 Component =${JSON.stringify(todos)}`);

  fetch("/todos.json")
    .then((res) => res.json())
    .then((data) => {
      console.log(`5 -     Response too late ${JSON.stringify(data)}`);
      todos[0] = data;
      console.log("6 -     Request Finished");
    });

  console.log(`3 Render`);

  const addTodo = (text) => {
    const newTodos = [...todos, { text }];
    todos[0] = newTodos;
  };

  const removeTodo = (index) => {
    const newTodos = [...todos];
    newTodos.splice(index, 1);
    todos[0] = newTodos;
  };

  console.log(`4 Finished`);

  return (
    <div>
      <div>
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

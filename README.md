## Optimize React performance with useEffect, useCallback, useMemo.

[A short rundown on all 3](https://stackoverflow.com/questions/56910036/when-to-use-usecallback-usememo-and-useeffect)

To understand how asynchronous code works in react lets look at some common mistakes made when dealing with these hooks.

Run `npx create-react-app my-app`

Add this to the index.css to center

```css
html {
  display: table;
  margin: auto;
}

body {
  display: table-cell;
  vertical-align: middle;
}

button {
  margin: 0.5em;
}
```

Create json file in your public directory called `todos.json` and add the code for it

```json
[
  {
    "text": "Study Javascript",
    "isDone": false
  },
  {
    "text": "Study Node",
    "isDone": false
  },
  {
    "text": "Get Rich",
    "isDone": false
  }
]
```

We want to fetch some todos from our DB(json file) to display to a user so we replace our `App.js` code with this code

```js
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
  const [todos] = useState([]);

  fetch("/todos.json")
    .then((res) => res.json())
    .then((data) => {
      todos[0] = data;
    });

  const addTodo = (text) => {
    const newTodos = [...todos, { text }];
    todos[0] = newTodos;
  };

  const removeTodo = (index) => {
    const newTodos = [...todos];
    newTodos.splice(index, 1);
    todos[0] = newTodos;
  };

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
```

### We get no todos. Why no data?

2 issues here:

1. Using state in odd way, setting value without a setter
2. Calling fetch in middle of component

Assumption that this is sequential but thats not how asynchronous code works.
Lets run our example with logging to our console so you can see what i mean

```js
function App() {
  console.log(`1 Start`);

  const [todos] = useState([]);

  console.log(`2 Component =${JSON.stringify(todos)}`);

  fetch("/todos.json")
    .then((res) => res.json())
    .then((data) => {
      todos[0] = data;
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
    ...
  );
}

// 1 Start
// 2 Component =[[],null]
// 3 Render
// 4 Finished
```

Notice we get no data. Thats because we assume this is executing sequentially, however, fetch is an asynchronous call so while its waiting on data to return the component does NOT wait on it. Lets add console logs to the response so you can see this in action.

```js
function App() {
  console.log(`1 Start`);

  const [todos] = useState([]);

  console.log(`2 Component =${JSON.stringify(todos)}`);

  fetch("/todos.json")
    .then((res) => res.json())
    .then((data) => {
      todos[0] = data;
      console.log(`5 - Component = ${JSON.stringify(data)}   (Too Late)`);
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
    ...
  );
}

// 1 Start
// 2 Component =[]
// 3 Render
// 4 Finished
// 5 - Component = ["take out trash","give dog bath","go to store"]   (Too Late)
```

:rocket: [--> Live Example](https://codesandbox.io/s/gb-react-performance-hc6dss)

See how our data response comes back too late, after the component renders. To fix this lets start by fixing the useState hook to use its setter (setTodos).

```js
function App() {
  const [todos, setTodos] = useState([]);


    fetch("/todos.json")
      .then((res) => res.json())
      .then((data) => {
        setTodos(data);
      });


  const addTodo = (text) => {
    const newTodos = [...todos, { text }];
    setTodos(newTodos);
  };

  const removeTodo = (index) => {
    const newTodos = [...todos];
    newTodos.splice(index, 1);
    setTodos(newTodos);
  };

  return (
    ...
  );
}
```

Open up network tab in browser. Oh no! we have crashed the browser with an infinite loop, that did NOT help

Since there is really only 2 hooks you want to use when setting state (useEffect, useCallback), lets go ahead and wrap our fetch with a useEffect and import it,

The useEffect hook lets you perform side effects in function components, and it's the alternative for the class component lifecycle methods `componentDidMount`, `componentWillUnmount`, `componentDidUpdate`.

```js
import ..., { ..., useEffect } from "react";

function App() {
  const [todos, setTodos] = useState([]);

  useEffect(() => {
    fetch("/todos.json")
      .then((res) => res.json())
      .then((data) => {
        setTodos(data);
      });
  });

  ...
}
```

Same results... hmmm
Ok lets try adding a dependency array.

```js
function App() {
  const [todos, setTodos] = useState([]);

  useEffect(() => {
    fetch("/todos.json")
      .then((res) => res.json())
      .then((data) => {
        setTodos(data);
      });
  }, []); // <---- Add right here

  ...
}
```

:rocket: [--> Live Example](https://codesandbox.io/s/gb-useeffect-yxsyrb)

Now it works. But why? Because when you pass an empty dependency array to a useEffect, it only runs ONCE, after load, preventing an infinite loop.

There are 2 other hooks that use a dependency array. Lets go ahead and see how you handle events from a user interaction, such as a button click.

Now this is fine as is, but what if you want to share this function with multiple components or want to make some kind of custom component?

For this you will need useCallback. useCallback returns a memoized callback that will only change when one of the dependencies has changed. Run this code

```js
import { useState, useEffect, useCallback } from "react";

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
    []
  );

  const removeTodo = useCallback(
    (index) => {
      const newTodos = [...todos];
      newTodos.splice(index, 1);
      setTodos(newTodos);
    },
    []
  );

  ...
}
```

Well that did NOT work. Whats going on here?

The first time MyComponent is rendered the array is empty. It adds a todo with the setter which subsequently fires a re render all before the data is received.

To retain that value and execute the useCallback when that value changes, we can add it to our dependency array. Lets add it and run

```js
import React, { ..., useCallback} from "react";

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

  ...
}
```

:rocket: [--> Live Example](https://codesandbox.io/s/gb-usecallback-2x6og3)

Now it works because the callback is regenerated every time todos changes, and only when todos change.

The last hook we want to look at is useMemo.

useMemo returns a memoized value and can be useful with expensive computations and preventing unnecessary re fetches. This is memoized by using cached data preventing that expensive computation from happening.

Lets define a function `expensiveCalculation` under our removeTodo function and then invoking. This function as defined should execute every time our component renders

```js
const expensiveCalculation = (num) => {
  for (let i = 0; i < 1000000000; i++) {
    num += 1;
  }
  return num;
};

expensiveCalculation();
```

Like useCallback, this works as is, but if you add a todo or remove a todo you will notice a slow reaction in the UI. This is because this expensive calculation is running every render, the same function. React thinks its different because of something called referential equality, more on that [here](https://www.digitalocean.com/community/tutorials/react-usememo). Since we don't need to keep executing this function on every render react gives us useMemo so we cache the expensive computation, preventing an needless rendering.

```js
import React, { ..., useMemo } from "react";

useMemo(() => expensiveCalculation(), []);
```

Now, it works! No more slow response when adding or removing todos. A real world example could be you are filtering a large data set, or performing actions on a large data set.

## Recap

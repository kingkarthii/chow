const express = require("express");
const app = express();

const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

const path = require("path");
const dbPath = path.join(__dirname, "todoApplication.db");

app.use(express.json());

let db = null;
const initializationDdServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3007, () => {
      console.log("server is running at 3007");
    });
  } catch (e) {
    console.log(`error:${e.message}`);
    process.exit(1);
  }
};
initializationDdServer();
const hasPriorityAndStatusProperty = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};
const hasPriority = (requestQuery) => {
  return requestQuery.priority !== undefined;
};
const hasStatus = (requestQuery) => {
  return requestQuery.status !== undefined;
};

app.get("/todos/", async (request, response) => {
  let data = null;
  let todoQuery = "";
  const { search_q = "", priority, status } = request.query;
  switch (true) {
    case hasPriorityAndStatusProperty(request.query):
      todoQuery = `select * from todo where todo like '%${search_q}%'
          AND status='${status}'AND priority='${priority}';`;

      break;
    case hasPriority(request.query):
      todoQuery = `select * from todo where todo like '%${search_q}%'
          AND priority='${priority}';`;
      break;
    case hasStatus(request.query):
      todoQuery = `select * from todo where todo like '%${search_q}%'
          AND status='${status}';`;
      break;
    default:
      todoQuery = `select * from todo where todo like '%${search_q}%';`;
      break;
  }
  data = await db.all(todoQuery);
  response.send(data);
});
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodoQuery = `select * from todo where id=${todoId};`;
  result = await db.get(getTodoQuery);
  response.send(result);
});

app.post("/todos/", async (request, response) => {
  const { todoId } = request.params;
  const { todo, priority, status } = request.body;
  const postTodoQuery = `insert into todo (id,todo,priority,status)Values
    ('${todoId}','${todo}','${priority}','${status}');`;
  result = await db.run(postTodoQuery);
  response.send("Todo Successfully Added");
});

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  let updateColumn = "";
  const requestBody = request.body;
  switch (true) {
    case requestBody.status !== undefined:
      updateColumn = "Status";
      break;
    case requestBody.priority !== undefined:
      updateColumn = "Priority";
      break;
    case requestBody.todo !== undefined:
      updateColumn = "Todo";
      break;
  }
  const previousTodoQuery = `select * from todo where id=${todoId};`;
  const previousTodo = await db.get(previousTodoQuery);
  const {
    todo = previousTodo.todo,
    priority = previousTodo.priority,
    status = previousTodo.status,
  } = request.body;
  const updateTodoQuery = `update todo set todo='${todo}',
  priority='${priority}',status='${status}' where id=${todoId}; `;
  await db.run(updateTodoQuery);
  response.send(`${updateColumn} Updated`);
});

app.delete("/todos/:todoId", async (request, response) => {
  const { todoId } = request.params;
  const deleteQuery = `Delete from todo where id='${todoId}';`;
  result = await db.run(deleteQuery);
  response.send("Todo Deleted");
});

module.exports = app;

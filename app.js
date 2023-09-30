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
    case hasStatus(request.query):
      todoQuery = `select * from todo where todo like '%${search_q}%'
          AND status='${status}';`;

    default:
      todoQuery = `select * from todo where todo like '%${search_q}';`;
      break;
  }
});

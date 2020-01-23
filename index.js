const phoenix = require("./phoenix");
const plug = require("./plug");

// Not pretending to be Ecto. Just going to deal with fake data here.

const USERS = {
  1: { id: 1, firstName: "John", lastName: "Doe" },
  2: { id: 2, firstName: "Jane", lastName: "Doe" }
};

// Goals
// 1. Give a little insight into Phoenix (docs can be dense)
// 2. Move ideas between languages/communities
// 3. Just chat

const UserController = {
  index: function index(conn) {
    const users = Object.values(USERS);
    return phoenix.render(conn, "index.html", { users });
  },
  show: function show(conn, { id }) {
    const user = USERS[id];
    return phoenix.render(conn, "show.html", { user });
  }
};

const router = phoenix.router({
  routes: [
    ["get", "/users", UserController, "index"],
    ["get", "/users/:id", UserController, "show"]
  ]
});

const endpoint = phoenix.endpoint({
  plugs: [plug.randomly_halt, plug.logger],
  router: router
});

phoenix.start(endpoint);

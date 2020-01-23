const http = require("http");
const plug = require("./plug");
const url = require("url");

exports.start = function start(endpoint) {
  console.log("Starting Endpoint");

  const server = http.createServer({}, (request, response) => {
    let conn = connFromReq(request);

    conn = endpoint(conn);

    response.end(conn.resp_body);
  });

  server.listen(8080);
};

exports.render = function render(conn, template, args = {}) {
  return Object.assign({}, conn, {
    resp_body: `Rendering ${template} with ${JSON.stringify(args)}`
  });
};

function routeMatches(conn, method, path) {
  return (
    method.toLowerCase() === conn.method.toLowerCase() &&
    pathMatches(path, conn.request_path)
  );
}

function pathMatches(path, conn_path) {
  const path_pieces = pieces(path);
  const conn_path_pieces = pieces(conn_path);
  if (path_pieces.length !== conn_path_pieces.length) return null;

  const path_params = {};

  for (let i = 0; i < path_pieces.length; i++) {
    const [path_piece, conn_piece] = [path_pieces[i], conn_path_pieces[i]];

    if (path_piece.startsWith(":")) {
      path_params[path_piece.slice(1)] = conn_piece;
    } else if (path_piece !== conn_piece) {
      return null;
    }
  }

  return path_params;
}

function pieces(path) {
  return path.replace(/^\/?(.*)\/?$/, "$1").split("/");
}

exports.router = function router(routerConfig) {
  console.log("Building Router");
  return function _router(conn) {
    for (const [method, path, controller, action] of routerConfig.routes) {
      const match = routeMatches(conn, method, path);
      if (match !== null) {
        return controller[action](conn, match);
      }
    }
  };
};

exports.endpoint = function endpoint(endpointConfig) {
  return conn => {
    for (const plug of [...endpointConfig.plugs, endpointConfig.router]) {
      if (conn.halted) {
        break;
      }
      conn = plug(conn);
    }
    return conn;
  };
};

function connFromReq(req) {
  const { search, pathname, query } = url.parse(req.url, true);
  const query_params = query;
  const body_params = {};

  return Object.assign({}, plug.CONN, {
    host: req.headers.host,
    method: req.method,
    path_info: pathname.replace(/^\//, "").split("/"),
    request_path: pathname,
    req_headers: Object.entries(req.headers),
    query_string: search,
    query_params: query_params,
    body_params: body_params,
    params: Object.assign({}, body_params, query_params)
  });
}

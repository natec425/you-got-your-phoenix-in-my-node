exports.logger = function logger(conn) {
  console.log(conn.method, conn.request_path, conn.params);
  return conn;
};

exports.accepts = function accepts(contentType) {
  return () => console.log("Accepting", contentType);
};

exports.randomly_halt = function randomly_halt(conn) {
  if (Math.random() < 0.3) {
    return Object.assign({}, conn, {
      halted: true,
      resp_body: "HALTED!"
    });
  } else {
    return conn;
  }
};

exports.CONN = Object.freeze({
  assigns: {},
  method: "GET",
  params: {},
  query_string: "",
  req_cookies: {},
  req_headers: [],
  request_path: "",
  resp_body: "",
  resp_cookies: {},
  resp_headers: [["cache-control", "max-age=0, private, must-revalidate"]],
  scheme: "http",
  status: 200,
  halted: false
});

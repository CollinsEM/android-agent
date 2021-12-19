const http = require('http');
const url = require('url');
const fs = require('fs');

http.createServer(onRequest).listen(8888);

function onRequest(request, response) {
  var pathName = url.parse(request.url).pathname;
  if (pathName == '/') pathName += "index.html";
  console.log(pathName);
  fs.readFile(pathName.substr(1), function (err, data) {
    if (err) {
      console.log("err:", err);
      console.log("data:", data);
      response.writeHead(404, {'Content-type': 'text/html'});
    }
    else if (pathName.includes("html")) {
      response.writeHead(200, {'Content-Type': 'text/html'});
      response.write(data.toString());
    }
    else if (pathName.includes("css")) {
      response.writeHead(200, {'Content-Type': 'text/css'});
      response.write(data.toString());
    }
    else if (pathName.includes("js")) {
      response.writeHead(200, {'Content-Type': 'text/javascript'});
      response.write(data.toString());
    }
    else if (pathName.includes("glb")) {
      response.writeHead(200, {'Content-Type': 'model/gltf-binary'});
      response.write(data);
    }
    else {
      console.log(url.parse(request.url));
      response.writeHead(200);
      response.write(data);
    }
    response.end();
  });
}

console.log('Server up and running on 127.0.0.1:8888');


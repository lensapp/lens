import http from "http";

export function respondJson(res: http.ServerResponse, content: any, status = 200) {
  respond(res, JSON.stringify(content), "application/json", status);
}

export function respondText(res: http.ServerResponse, content: string, status = 200) {
  respond(res, content, "text/plain", status);
}

export function respond(res: http.ServerResponse, content: string, contentType: string, status = 200) {
  res.setHeader("Content-Type", contentType);
  res.statusCode = status;
  res.end(content);
}

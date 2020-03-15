import * as http from "http";

export abstract class LensApi {
  protected respondJson(res: http.ServerResponse, content: {}, status = 200) {
    this.respond(res, JSON.stringify(content), "application/json", status)
  }

  protected respondText(res: http.ServerResponse, content: string, status = 200) {
    this.respond(res, content, "text/plain", status)
  }

  protected respond(res: http.ServerResponse, content: string, contentType: string, status = 200) {
    res.setHeader("Content-Type", contentType)
    res.statusCode = status
    res.end(content)
  }
}

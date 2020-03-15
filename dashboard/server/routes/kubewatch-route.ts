//-- Streaming k8s watch-api events

import axios from "axios"
import { Router } from "express";
import { IncomingMessage } from "http";
import { kubeRequest } from "../api/kube-request";
import { IKubeWatchEvent, IKubeWatchRouteEvent, IKubeWatchRouteQuery} from "../common/kubewatch"
import { userSession } from "../user-session";
import { logger } from "../utils/logger";

export function kubewatchRoute() {
  const router = Router();

  router.route('/watch')
    .get(async (req, res) => {
      const { authHeader } = userSession.get(req);
      const queryParams: IKubeWatchRouteQuery = req.query;
      const apis: string[] = [].concat(queryParams.api || []);
      const streams = new Map<string, IncomingMessage>();
      const eventsBuffer = new Map<string, IKubeWatchEvent>();
      let isClosing = false;

      if (!apis.length) {
        res.status(400).json({
          message: "Empty request. Query params 'api' are not provided.",
          example: "?api=/api/v1/pods&api=/api/v1/nodes",
        });
        return;
      }

      res.header({
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      });

      // init streams
      const cancelToken = axios.CancelToken.source();
      apis.forEach(apiUrl => {
        console.log("[KUBE-WATCH] init stream", apiUrl);
        const connecting = kubeRequest<IncomingMessage>({
          path: apiUrl,
          responseType: "stream",
          authHeader: authHeader,
          cancelToken: cancelToken.token,
        });
        connecting.then(stream => {
          streams.set(apiUrl, stream); // save connection for clean up
          stream.socket.setKeepAlive(true); // keep connection alive
          let lastUnusedBuffer = ""
          return stream
            .on("data", (buffer: Buffer) => {
              const data = lastUnusedBuffer + buffer.toString().trim();
              data.split("\n").map(str => {
                try {
                  const eventObj = JSON.parse(str);
                  bufferEvent(eventObj); // handle
                  lastUnusedBuffer = ""; // clean up since parsing was successful
                } catch (err) {
                  lastUnusedBuffer = str; // invalid json, tail must wait next incoming data
                }
              });
            })
            .on("end", () => {
              // client must update resource-version and try to reconnect
              console.log(`[KUBE-WATCH] stream ended ${apiUrl}`)
              sendEvent({
                type: "STREAM_END",
                url: apiUrl,
                status: stream.statusCode,
              })
            });
        }, err => {
          logger.error(`[KUBE-WATCH] error ${apiUrl}`, err);
          sendEvent({
            type: "STREAM_END",
            url: apiUrl,
            status: 410,
          })
        });
      });

      function getEventBufferId(evt: IKubeWatchEvent) {
        const { object, type } = evt;
        const { kind } = object;
        let { metadata: { uid } } = object;
        if (kind === "Event") {
          uid = (object as any).involvedObject.uid; // reason: uid for events always unique
        }
        return `${type}:${kind}-${uid}`
      }

      function bufferEvent(evt: IKubeWatchEvent) {
        const id = getEventBufferId(evt);
        if (eventsBuffer.has(id)) {
          eventsBuffer.delete(id); // clear to move event to the end in map's "timeline"
        }
        eventsBuffer.set(id, evt); // save latest event by object's identity
      }

      function sendEvent(evt: IKubeWatchEvent | IKubeWatchRouteEvent, autoFlush = true) {
        if (isClosing) return;
        // convert to "text/event-stream" format
        res.write(`data: ${JSON.stringify(evt)}\n\n`);
        if (autoFlush) {
          // @ts-ignore
          res.flush();
        }
      }

      // process sending events
      const flushInterval = setInterval(() => {
        const eventsPack = Array.from(eventsBuffer.entries())
          .slice(0, 100) // max limit per sending
          .map(([id, evt]) => {
            eventsBuffer.delete(id); // clean up used event
            return evt;
          });
        if (eventsPack.length > 0) {
          eventsPack.forEach(evt => sendEvent(evt, false));
          // @ts-ignore
          res.flush();
        }
      }, 1000);

      function onClose() {
        if (isClosing) return;
        isClosing = true;
        clearInterval(flushInterval);
        streams.forEach(stream => stream.removeAllListeners("end"));
        cancelToken.cancel();
      }

      req.on("close", onClose);
      res.on("finish", onClose);
    });

  return router;
}

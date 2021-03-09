
import { IPodLogsQuery, Pod, podsApi } from "../../api/endpoints";

interface LogStreamStatus {
  done: boolean
  lastTimestamp: number
}


export class LogsStreamManager {
  logStreams: Map<string, LogStreamStatus> = new Map()

  startLogStream = async (namespace: string, name: string, params: Partial<IPodLogsQuery>, onData: Function, onDone: Function, isDone: Function = this.isDone ) => {
    if (!this.logStreams.get(namespace + "/" + name)){
      this.logStreams.set(namespace + "/" + name, {done: false, lastTimestamp: 0})
      podsApi.getLogs({ namespace:namespace, name: name }, {
        ...params,
        follow: true,
        timestamps: true,  // Always setting timestampt to separate old logs from new ones
      })
        .then(response => response.body)
        .then(rb => {
          const reader = rb.getReader();
          return new ReadableStream({
            start(controller) {
              // The following function handles each data chunk
              function push() {
                // "done" is a Boolean and value a "Uint8Array"
                reader.read().then( ({done,value}:{done:Boolean, value:Uint8Array}) => {
                  // If there is no more data to read
                  if (done || isDone(namespace, name)) {
                    onDone()
                    controller.close();

                    return;
                  }

                  // Get the data and send it to the browser via the controller
                  controller.enqueue(value);
                  let data = new TextDecoder("utf-8").decode(value).split("\n")
                  data.pop()
                  for (let row of data) {
                    onData(name,row)
                  }
                  push();
                });
              }
              push();
            }
          });
        });

    }
  }

  stopLogStream = (namespace: string, name: string) => {
    if (this.logStreams.get(namespace + "/" + name)){
      let status = this.logStreams.get(namespace + "/" + name)
      status.done = true
      this.logStreams.set(namespace + "/" + name, status)
    }
  }

  isDone = (namespace: string, name: string) => {
    console.log("is done",namespace + "/" + name,  this.logStreams.get(namespace + "/" + name)?.done)
    return this.logStreams.get(namespace + "/" + name)?.done ?? false}
}

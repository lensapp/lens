# Testing Extensions

## Console.log

Extension developers might find `console.log()` useful for printing out information and errors from extensions. To use `console.log()`, note that Lens is based on Electron, and that Electron has two types of processes: [Main and Renderer](https://www.electronjs.org/docs/tutorial/quick-start#main-and-renderer-processes).

### Renderer Process Logs

In the Renderer process, `console.log()` is printed in the Console in Developer Tools (**View** > **Toggle Developer Tools**).

### Main Process Logs

Viewing the logs from the Main process is a little trickier, since they cannot be printed using Developer Tools. 

#### macOS

On macOS, view the Main process logs by running Lens from the terminal:

```bash
/Applications/Lens.app/Contents/MacOS/Lens
```

You can also use [Console.app](https://support.apple.com/en-gb/guide/console/welcome/mac) to view the Main process logs.

#### Linux

On Linux, you can access the Main process logs using the Lens PID. First get the PID:

```bash
ps aux | grep Lens | grep -v grep
```

Then get the Main process logs using the PID:

```bash
tail -f /proc/[pid]/fd/1 # stdout (console.log)
tail -f /proc/[pid]/fd/2 # stdout (console.error)
```

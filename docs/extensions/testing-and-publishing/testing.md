# Testing Extensions

## Console.log

`console.log()` might be handy for extension developers to prints out info/errors from extensions. To use `console.log`, note that Lens is based on Electron. Electron has two types of processes: [Main and Renderer](https://www.electronjs.org/docs/tutorial/quick-start#main-and-renderer-processes).

### Renderer process logs

`console.log()` in Renderer process is printed in the Console in Developer Tools (View > Toggle Developer Tools).

### Main process logs

To view the logs from the main process is a bit trickier, since you cannot open developer tools for them. On MacOSX, one way is to run Lens from the terminal.

```bash
/Applications/Lens.app/Contents/MacOS/Lens
```

You can alos use [Console.app](https://support.apple.com/en-gb/guide/console/welcome/mac) to view logs from Lens.

On linux, you can get PID of Lens first

```bash
ps aux | grep Lens | grep -v grep
```

And get logs by the PID

```bash
tail -f /proc/[pid]/fd/1 # stdout (console.log)
tail -f /proc/[pid]/fd/2 # stdout (console.error)
```

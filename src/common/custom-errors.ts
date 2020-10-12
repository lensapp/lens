export class ExecValidationNotFoundError extends Error {
  constructor(execPath: string, isAbsolute: boolean) {
    super(`User Exec command "${execPath}" not found on host.`);
    let message = `User Exec command "${execPath}" not found on host.`;
    if (!isAbsolute) {
      message += ` Please ensure binary is found in PATH or use absolute path to binary in Kubeconfig`;
    }
    this.message = message; 
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}
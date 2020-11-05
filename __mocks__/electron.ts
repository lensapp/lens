module.exports = {
  require: jest.fn(),
  match: jest.fn(),
  app: {
    getVersion: jest.fn().mockReturnValue("3.0.0"),
    getLocale: jest.fn().mockRejectedValue("en"),
    getPath: jest.fn((name: string) => {
      return "tmp"
    }),
  },
  remote: {
    app: {
      getPath: jest.fn()
    }
  },
  dialog: jest.fn(),
  ipcRenderer: {
    on: jest.fn()
  }
};

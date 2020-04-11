module.exports = {
  require: jest.fn(),
  match: jest.fn(),
  app: {
    getVersion: jest.fn().mockReturnValue("3.0.0"),
    getPath: jest.fn().mockReturnValue("/foo/bar")
  },
  remote: {
    app: {
      getPath: jest.fn()
    }
  },
  dialog: jest.fn()
};

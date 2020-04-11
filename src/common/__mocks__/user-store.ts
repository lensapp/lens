const userStore = {
  getPreferences: jest.fn(() => {
    return {
      downloadMirror: "default"
    }
  })
}

export { userStore };

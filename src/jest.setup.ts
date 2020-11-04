
import fetchMock from "jest-fetch-mock"
// rewire global.fetch to call 'fetchMock'
fetchMock.enableMocks();

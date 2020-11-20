import React from "react"
import { displayBooleans } from "../display-booleans"

describe("displayBooleans tests", () => {
  it("should not do anything to div's if shouldShow is false", () => {
    expect(displayBooleans(false, <div></div>)).toStrictEqual(<div></div>)
  })

  it("should not do anything to booleans's if shouldShow is false", () => {
    expect(displayBooleans(false, true)).toStrictEqual(true)
    expect(displayBooleans(false, false)).toStrictEqual(false)
  })

  it("should stringify booleans when shouldShow is true", () => {
    expect(displayBooleans(true, true)).toStrictEqual("true")
    expect(displayBooleans(true, false)).toStrictEqual("false")
  })
})

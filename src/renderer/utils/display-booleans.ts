import React from "react"

export function displayBooleans(shouldShow: boolean, from: React.ReactNode): React.ReactNode {
  if (shouldShow) {
    if (typeof from === "boolean") {
      return from.toString()
    }

    if (Array.isArray(from)) {
      return from.map(node => displayBooleans(shouldShow, node))
    }
  }

  return from
}

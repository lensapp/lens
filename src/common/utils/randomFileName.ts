// Creates system valid random filename

export function randomFileName(name: string) {
  return `${Math.random().toString(36).substring(2, 15)}-${Math.random().toString(36).substring(2, 15)}-${name}`
}

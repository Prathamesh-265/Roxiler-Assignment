export const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,16}$/

export function validateEmail(email) {
  const re = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/
  return re.test(email)
}

export function assert(condition, message = "Validation failed") {
  if (!condition) {
    const err = new Error(message)
    err.status = 400
    throw err
  }
}

export function validateUserPayload({ name, email, address, password }) {
  //  Changed min 20 -> min 10
  assert(typeof name === "string" && name.length >= 10 && name.length <= 50, "Name must be 10-60 characters")

  assert(typeof address === "string" && address.length <= 400, "Address must be <= 400 characters")
  assert(typeof email === "string" && validateEmail(email), "Invalid email")
  assert(typeof password === "string" && passwordRegex.test(password), "Invalid password format")
}

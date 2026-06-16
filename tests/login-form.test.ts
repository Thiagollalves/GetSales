import assert from "node:assert/strict"
import { test } from "node:test"

import { getLoginCredentialsFromFormData } from "../components/auth/login-form.tsx"

test("login form reads credentials from form data", () => {
  const formData = new FormData()
  formData.set("username", " admin ")
  formData.set("password", " 123456 ")

  assert.deepEqual(getLoginCredentialsFromFormData(formData), {
    username: "admin",
    password: "123456",
  })
})

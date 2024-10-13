import { createCipheriv, createDecipheriv } from "crypto"

const iv = process.env.SECRET.slice(0,16).split("").reverse().join("")!
const secret = process.env.SECRET!

export const encryptData = (plaintext: string): string => {
  const cipher = createCipheriv("aes-256-cbc", secret, iv)
  let encrypted = cipher.update(plaintext, "utf8", "hex")
  encrypted += cipher.final("hex")
  return encrypted
}

export const decryptData = (ciphertext: string): string => {
  const decipher = createDecipheriv("aes-256-cbc", secret, iv)
  let decrypted = decipher.update(ciphertext, "hex", "utf8")
  decrypted += decipher.final("utf8")
  return decrypted
}

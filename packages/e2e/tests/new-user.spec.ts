import { test, expect } from '@playwright/test'

const SLOW_TIMEOUT = 10_000

const randomEmail = () =>
  `e2e-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`

test('should be able to register a new user and login with it', async ({
  page,
}) => {
  const email = randomEmail()
  const password = 'password123'
  const nickname = 'e2e-new-user'

  await page.goto('http://localhost:3000')
  await expect(page.locator('body')).toContainText(/mystash/i)

  await page.getByRole('link', { name: 'Register' }).click()

  await page.getByLabel('Nickname(*)').fill(nickname)
  await page.getByLabel('Password(*)').fill(password)
  await page.getByLabel('Email(*)').fill(email)

  // Registration is blocked until the terms are accepted
  await expect(page.getByRole('button', { name: 'Register' })).toBeDisabled()
  await page
    .getByLabel('I have read and accept the Terms and Conditions')
    .check()
  await expect(page.getByRole('button', { name: 'Register' })).toBeEnabled()

  await page.getByRole('button', { name: 'Register' }).click()
  await expect(page.locator('body')).toContainText(
    `Registered successfully with email: ${email}`
  )

  // Now log in with the newly created account
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password').fill(password)
  await page.getByRole('button', { name: 'Login' }).click()
  await expect(page.getByRole('link', { name: 'Logout' })).toBeVisible({
    timeout: SLOW_TIMEOUT,
  })

  const token = await page.evaluate(() => localStorage.getItem('MS_token'))
  expect(token).toBeTruthy()
  await page.getByRole('link', { name: 'Logout' }).click()
  await expect(page.getByRole('link', { name: 'Register' })).toBeVisible({
    timeout: SLOW_TIMEOUT,
  })
  const response = await page.request.get('http://localhost:8000/api/user', {
    headers: { Authorization: `Bearer ${token}` },
  })
  expect(response.status()).toBe(401)
})

test('clears the browser session when logout rejects an invalid token', async ({ page }) => {
  const email = randomEmail()
  const password = 'password123'
  const registration = await page.request.post('http://localhost:8000/api/register', {
    data: { email, password, nickname: 'e2e-expired-session' },
  })
  expect(registration.status()).toBe(201)
  const login = await page.request.post('http://localhost:8000/api/login', { data: { email, password } })
  expect(login.status()).toBe(200)
  const { token } = await login.json()
  await page.goto('/')
  await page.evaluate(token => localStorage.setItem('MS_token', token), token)
  await page.reload()
  await expect(page.getByRole('link', { name: 'Logout' })).toBeVisible()
  await page.route('**/api/logout', route => route.fulfill({ status: 401, json: { message: 'Unauthorized' } }))
  await page.getByRole('link', { name: 'Logout' }).click()
  await expect(page.getByLabel('Email')).toBeVisible()
  expect(await page.evaluate(() => localStorage.getItem('MS_token'))).toBeNull()
  await expect(page.getByText('Logout failed. Please try again.')).toHaveCount(0)
  const cleanup = await page.request.post('http://localhost:8000/api/logout', {
    headers: { Authorization: `Bearer ${token}` },
  })
  expect(cleanup.status()).toBe(204)
})

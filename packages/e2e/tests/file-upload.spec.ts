import { test, expect } from '@playwright/test'

for (const count of [1, 2]) {
  test(`uploads ${count} file(s) and reads their stored contents`, async ({ page }) => {
    const unique = `${Date.now()}-${Math.random().toString(36).slice(2)}`
    const title = `Upload test ${unique}`
    const files = Array.from({ length: count }, (_, index) => ({
      name: `upload-${unique}-${index}.txt`,
      mimeType: 'text/plain',
      buffer: Buffer.from(`File ${index}: upload test content — ${unique}\n`),
    }))

    await page.goto('/')
    await page.getByLabel('Email').fill('test@example.com')
    await page.getByLabel('Password').fill('salasana')
    await page.getByRole('button', { name: 'Login' }).click()
    await expect(page.getByRole('link', { name: 'Logout' })).toBeVisible()
    await page.getByRole('link', { name: 'Add note' }).click()
    await page.getByLabel('Title').fill(title)
    await page.getByLabel('Content').fill('A note with uploaded attachments')
    await page.getByLabel('Tags').fill('e2e-upload')
    await page.getByRole('button', { name: 'Create', exact: true }).click()
    await page.getByPlaceholder('Filter notes...').fill(title)
    await page.getByRole('link', { name: title, exact: true }).click()
    await page.getByRole('link', { name: 'ADD FILE' }).click()
    await page.getByTestId('upload-file-input').setInputFiles(files)
    await expect(page.getByText(`${count} file(s) selected`)).toBeVisible()
    await page.getByRole('button', { name: 'UPLOAD', exact: true }).click()
    await expect(page.getByText(`${count} file(s) successfully uploaded!`)).toBeVisible()

    // Reopen the note to verify persisted metadata, not just local upload state.
    await page.getByRole('link', { name: 'Logout' }).click()
    await page.goto('/')
    await page.getByLabel('Email').fill('test@example.com')
    await page.getByLabel('Password').fill('salasana')
    await page.getByRole('button', { name: 'Login' }).click()
    await page.getByPlaceholder('Filter notes...').fill(title)
    await page.getByRole('link', { name: title, exact: true }).click()
    for (const file of files) {
      const link = page.getByRole('link', { name: file.name, exact: true })
      await expect(link).toBeVisible()
      const url = await link.getAttribute('href')
      expect(url).toBeTruthy()
      const response = await page.request.get(url!)
      expect(response.ok()).toBeTruthy()
      expect(await response.body()).toEqual(file.buffer)
    }

    // Remove the attachments and note through the UI after verifying storage.
    page.on('dialog', dialog => dialog.accept())
    for (const file of files) {
      const link = page.getByRole('link', { name: file.name, exact: true })
      await link.locator('..').getByRole('button', { name: 'X', exact: true }).click()
      await expect(link).toHaveCount(0)
    }
    await page.getByRole('button', { name: 'DELETE', exact: true }).click()
    await expect(page.getByText(`you deleted '${title}'`)).toBeVisible()
  })
}

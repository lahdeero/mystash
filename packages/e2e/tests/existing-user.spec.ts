import { test, expect } from '@playwright/test'

const SLOW_TIMEOUT = 5_000

test('should be able to login and do CRUD actions to note', async ({
  page,
}) => {
  await page.goto('http://localhost:3000')
  await expect(page.locator('body')).toContainText(/mystash/i)
  await page.getByLabel('Email').fill('test@example.com')
  await page.getByLabel('Password').fill('salasana')
  await page.getByRole('button', { name: 'Login' }).click()
  await expect(page.getByRole('link', { name: 'Logout' })).toBeVisible({ timeout: SLOW_TIMEOUT })

  await page.getByRole('link', { name: 'Add note' }).click()
  const noteTitle = 'Test title for e2e test'
  await page.getByLabel('Title').fill(noteTitle)
  await page.getByLabel('Content').fill('Test content for e2e test')
  await page.getByLabel('Tags').fill('tag1;tag2;tag3')
  await page.getByRole('button', { name: 'Add tags' }).click()
  await page.getByRole('button', { name: 'Create' }).click()
  await expect(page.locator('body')).toContainText(`you created '${noteTitle}'`)

  await page.getByRole('link', { name: noteTitle }).click()
  await expect(page.locator('body')).toContainText(/Updated at/i)
  await page.getByRole('button', { name: 'Edit' }).click()

  const updatedNoteTitle = 'Updated title for e2e test'
  await page.getByLabel('Title').fill(updatedNoteTitle)
  await page.getByRole('button', { name: 'Save' }).click()
  await expect(page.locator('body')).toContainText(
    `you modified '${updatedNoteTitle}'`
  )

  await page.getByRole('link', { name: updatedNoteTitle }).click()
  page.on('dialog', async (dialog: any) => {
    expect(dialog.type()).toBe('confirm')
    expect(dialog.message()).toContain(
      `Are you sure you want to delete '${updatedNoteTitle}' ?`
    )
    await dialog.accept()
  })
  await page.getByRole('button', { name: 'Delete' }).click()
  await expect(page.locator('body')).toContainText(
    `you deleted '${updatedNoteTitle}'`
  )
})

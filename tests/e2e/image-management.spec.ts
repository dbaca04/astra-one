import { test, expect } from '@playwright/test';

// Test data
const TEST_IMAGES = {
  jpg: 'test-image.jpg',
  png: 'test-image.png',
  gif: 'test-image.gif',
  large: 'large-image.jpg',  // Should be > 5MB
  invalid: 'test-file.txt'
};

// Helper function to login to admin
async function login(page) {
  await page.goto('/admin/login');
  // Replace with actual login logic
  await page.fill('input[name="username"]', 'admin');
  await page.fill('input[name="password"]', 'password');
  await page.click('button[type="submit"]');
  await page.waitForURL('/admin');
}

test.describe('Image Management in Content Editor', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    // Navigate to a new post
    await page.goto('/admin/content/new');
  });

  test('should display existing image markdown in the editor', async ({ page }) => {
    // Add an image markdown to the editor
    await page.fill('textarea[name="content"]', '![Test Image](/images/test.jpg)');
    
    // Verify the image is displayed in the preview
    const preview = page.locator('#preview');
    await expect(preview.locator('img')).toHaveAttribute('src', '/images/test.jpg');
    
    // Verify the image is listed in the image list
    await page.click('button:has-text("Show Images")');
    const imageList = page.locator('#imageList');
    await expect(imageList.locator('li')).toContainText('/images/test.jpg');
  });

  test('should upload a new JPG image', async ({ page }) => {
    // Trigger file upload
    const [fileChooser] = await Promise.all([
      page.waitForEvent('filechooser'),
      page.click('button:has-text("Insert Image")')
    ]);
    
    // Upload the file
    await fileChooser.setFiles(`./test-data/${TEST_IMAGES.jpg}`);
    
    // Verify the image was uploaded and markdown was inserted
    const editor = page.locator('textarea[name="content"]');
    await expect(editor).toHaveValue(/!\[.*?\]\(\/images\/\d+-[a-z0-9]+\.jpg\)/);
    
    // Verify preview shows the image
    const preview = page.locator('#preview');
    await expect(preview.locator('img')).toHaveAttribute('src', /\/images\/\d+-[a-z0-9]+\.jpg/);
  });

  test('should upload a new PNG image', async ({ page }) => {
    // Similar to JPG test but with PNG
    const [fileChooser] = await Promise.all([
      page.waitForEvent('filechooser'),
      page.click('button:has-text("Insert Image")')
    ]);
    
    await fileChooser.setFiles(`./test-data/${TEST_IMAGES.png}`);
    
    const editor = page.locator('textarea[name="content"]');
    await expect(editor).toHaveValue(/!\[.*?\]\(\/images\/\d+-[a-z0-9]+\.png\)/);
  });

  test('should upload a new GIF image', async ({ page }) => {
    // Similar to JPG test but with GIF
    const [fileChooser] = await Promise.all([
      page.waitForEvent('filechooser'),
      page.click('button:has-text("Insert Image")')
    ]);
    
    await fileChooser.setFiles(`./test-data/${TEST_IMAGES.gif}`);
    
    const editor = page.locator('textarea[name="content"]');
    await expect(editor).toHaveValue(/!\[.*?\]\(\/images\/\d+-[a-z0-9]+\.gif\)/);
  });

  test('should show error for invalid file type', async ({ page }) => {
    // Mock the file input to test invalid type
    await page.setInputFiles('input[type="file"]', `./test-data/${TEST_IMAGES.invalid}`);
    
    // Check for error message
    await expect(page.locator('.error-message')).toContainText('Invalid file type');
    
    // Verify no markdown was inserted
    const editor = page.locator('textarea[name="content"]');
    expect(await editor.inputValue()).not.toContain('![');
  });

  test('should show error for file exceeding size limit', async ({ page }) => {
    // Mock the file input to test large file
    await page.setInputFiles('input[type="file"]', `./test-data/${TEST_IMAGES.large}`);
    
    // Check for error message
    await expect(page.locator('.error-message')).toContainText('File size exceeds limit');
  });

  test('should replace an existing image', async ({ page }) => {
    // First add an image
    await page.fill('textarea[name="content"]', '![Old Image](/images/old.jpg)');
    
    // Click the replace button (assuming it's added to the UI)
    await page.click('button:has-text("Replace Image")');
    
    // Select new image
    const [fileChooser] = await Promise.all([
      page.waitForEvent('filechooser'),
      page.click('button:has-text("Choose New Image")')
    ]);
    
    await fileChooser.setFiles(`./test-data/${TEST_IMAGES.jpg}`);
    
    // Verify the image was replaced
    const editor = page.locator('textarea[name="content"]');
    await expect(editor).toHaveValue(/!\[.*?\]\(\/images\/\d+-[a-z0-9]+\.jpg\)/);
    
    // Verify the old image is no longer in the content
    expect(await editor.inputValue()).not.toContain('/images/old.jpg');
  });

  test('should not allow image upload when not authenticated', async ({ page }) => {
    // Logout
    await page.click('button:has-text("Logout")');
    
    // Try to access upload endpoint directly
    const response = await page.request.post('/api/admin/upload-image');
    expect(response.status()).toBe(401);
  });
});

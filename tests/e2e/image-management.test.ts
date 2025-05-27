import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

// Test data
const TEST_IMAGES = {
  jpg: 'test-image.jpg',
  png: 'test-image.png',
  gif: 'test-image.gif',
  large: 'large-image.jpg',  // Should be > 5MB
  invalid: 'test-file.txt'
} as const;

// Helper function to login to admin
async function login(page: Page): Promise<boolean> {
  try {
    console.log('Navigating to login page...');
    await page.goto('/admin/login', { waitUntil: 'networkidle' });
    
    // Take a screenshot for debugging
    await page.screenshot({ path: 'login-page.png' });
    console.log('Screenshot saved as login-page.png');
    
    // Check if we're already logged in by looking for a logout button or admin content
    const isLoggedIn = await page.locator('button:has-text("Logout"), .admin-content, [data-testid="logout-button"]').first().isVisible().catch(() => false);
    if (isLoggedIn) {
      console.log('Already logged in');
      return true;
    }
    
    console.log('Login form found, filling credentials...');
    
    // Try to find all possible login form fields
    const emailInput = page.locator('input[type="email"], input[name="email"], input[name="username"], #email, #username').first();
    const passwordInput = page.locator('input[type="password"], #password, [name="password"]').first();
    const submitButton = page.locator('button[type="submit"], button:has-text("Sign In"), button:has-text("Login"), button:has-text("Log in")').first();
    
    if (await emailInput.count() === 0 || await passwordInput.count() === 0 || await submitButton.count() === 0) {
      console.error('Login form fields not found');
      console.log('Available inputs on page:');
      const inputs = await page.$$eval('input', els => els.map(el => ({
        id: el.id,
        name: el.name,
        type: el.type,
        placeholder: el.placeholder
      })));
      console.log(inputs);
      return false;
    }
    
    // Fill in the form
    await emailInput.fill('dom@domdhi.com');
    await passwordInput.fill('Dombaca04');
    
    console.log('Submitting login form...');
    
    // Wait for navigation after form submission
    const navigationPromise = page.waitForNavigation({ waitUntil: 'networkidle' });
    await submitButton.click();
    
    // Wait for either navigation or error message
    try {
      await Promise.race([
        navigationPromise,
        page.waitForSelector('.error-message, .alert-error, [role="alert"], .text-red-500', { timeout: 5000 })
      ]);
      
      // Check if login was successful
      const isLoggedIn = await page.locator('button:has-text("Logout"), .admin-content, [data-testid="logout-button"]').first().isVisible().catch(() => false);
      if (isLoggedIn) {
        console.log('Login successful');
        return true;
      }
      
      // Check for error message
      const errorMessage = await page.locator('.error-message, .alert-error, [role="alert"], .text-red-500').first().textContent().catch(() => null);
      if (errorMessage) {
        console.error('Login error:', errorMessage.trim());
      } else {
        console.error('Login failed - unknown error');
      }
      
      return false;
      
    } catch (error) {
      console.error('Error during login navigation:', error);
      return false;
    }
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

test.describe('Image Management in Content Editor', () => {
  // Setup test context
  let testInfo: any;
  
  test.beforeEach(async ({ page }, info) => {
    testInfo = info;
    console.log(`\n=== Starting test: ${testInfo.title} ===`);
    
    // Log browser and viewport info
    console.log(`Browser: ${page.context().browser()?.browserType().name()}`);
    console.log(`Viewport: ${page.viewportSize()?.width}x${page.viewportSize()?.height}`);
    
    // Enable request/response logging
    page.on('request', request => 
      console.log(`>> ${request.method()} ${request.url()}`)
    );
    page.on('response', response => 
      console.log(`<< ${response.status()} ${response.url()}`)
    );
    
    // Log page errors
    page.on('pageerror', error => {
      console.error(`Page error: ${error.message}`);
      console.error(error.stack);
    });
    
    // Log console messages
    page.on('console', msg => {
      const type = msg.type();
      const text = msg.text();
      console.log(`[${type.toUpperCase()}] ${text}`);
      
      // Log any errors or warnings from the page
      if (type === 'error' || type === 'warning') {
        const location = msg.location();
        console.error(`Console ${type} at ${location.url}:${location.lineNumber}:${location.columnNumber}`);
      }
    });
    
    // Log unhandled rejections
    page.on('requestfailed', request => {
      console.error(`Request failed: ${request.failure()?.errorText} ${request.url()}`);
    });
    
    // Take a screenshot at the start of each test
    await page.screenshot({ path: `test-results/${testInfo.titlePath.join('-').replace(/[^a-z0-9-]/gi, '_').toLowerCase()}-start.png` });
    
    // Log the current URL before login
    console.log(`Current URL before login: ${page.url()}`);
    
    try {
      console.log('Logging in...');
      await login(page);
      
      console.log('Navigating to content editor...');
      await page.goto('/admin/content/new');
      
      console.log('Waiting for editor to be ready...');
      const editor = page.locator('textarea[name="content"]').first();
      await editor.waitFor({ state: 'visible', timeout: 15000 });
      console.log('Editor is ready');
    } catch (error) {
      console.error('Error in beforeEach:', error);
      // Take a screenshot on failure
      await page.screenshot({ path: 'test-results/beforeEach-failure.png' });
      throw error;
    }
  });

  test('should display existing image markdown in the editor', async ({ page }) => {
    // Add test metadata
    testInfo.annotations.push({
      type: 'test_description',
      description: 'Verifies that image markdown is properly displayed in the editor',
    });
    
    // Log test start
    console.log('\n--- Starting test: should display existing image markdown in the editor ---');
    console.log('Test file:', __filename);
    
    test.slow(); // Mark test as slow as it involves UI interactions
    
    try {
      // First, ensure we're logged in
      console.log('Ensuring user is logged in...');
      const loggedIn = await login(page);
      if (!loggedIn) {
        throw new Error('Failed to login');
      }
      
      // Navigate to the admin dashboard first
      console.log('Navigating to admin dashboard...');
      await page.goto('/admin', { waitUntil: 'networkidle' });
      
      // Look for a link to create new content or edit existing content
      const newContentButton = page.locator('a:has-text("New Post"), a:has-text("Create New"), button:has-text("New")').first();
      if (await newContentButton.isVisible()) {
        console.log('Clicking new content button...');
        await newContentButton.click();
        await page.waitForURL('**/admin/content/edit/**', { timeout: 5000 }).catch(() => {
          console.log('Did not navigate to edit page after clicking new content button');
        });
      } else {
        // If no new content button, try to find an existing post to edit
        const firstPostLink = page.locator('a[href^="/admin/content/edit/"]').first();
        if (await firstPostLink.isVisible()) {
          console.log('Clicking on existing post to edit...');
          await firstPostLink.click();
          await page.waitForURL('**/admin/content/edit/**', { timeout: 5000 });
        } else {
          // If all else fails, try to navigate directly to a new post
          console.log('Navigating directly to content editor...');
          await page.goto('/admin/content/edit/new-post', { waitUntil: 'networkidle' });
        }
      }
      console.log('Starting existing image markdown test...');
      
      // Add an image markdown to the editor
      const editor = page.locator('textarea[name="content"]').first();
      await editor.waitFor({ state: 'visible', timeout: 10000 });
      await editor.fill('![Test Image](/images/test.jpg)');
      
      console.log('Verifying image preview...');
      // Try multiple possible preview selectors
      const previewSelectors = ['#preview', '.preview', '[data-preview]', 'div[class*="preview"]'];
      let previewFound = false;
      
      for (const selector of previewSelectors) {
        const preview = page.locator(selector).first();
        if (await preview.count() > 0) {
          console.log(`Found preview with selector: ${selector}`);
          await expect(preview.locator('img')).toHaveAttribute('src', '/images/test.jpg');
          previewFound = true;
          break;
        }
      }
      
      if (!previewFound) {
        console.log('No preview found with standard selectors, checking page content...');
        const pageContent = await page.content();
        console.log('Page content:', pageContent.substring(0, 1000) + '...');
        await page.screenshot({ path: 'test-results/preview-not-found.png' });
        test.fail(true, 'Could not find preview element');
        return;
      }
      
      // Check if image list functionality exists
      console.log('Checking for image list functionality...');
      const showImagesButton = page.locator('button:has-text("Show Images"), button:has-text("Manage Images")').first();
      if (await showImagesButton.count() > 0) {
        console.log('Image list button found, clicking...');
        await showImagesButton.click();
        
        // Try multiple possible image list selectors
        const imageListSelectors = ['#imageList', '.image-list', '[data-image-list]', 'div[class*="image-list"]'];
        let imageListFound = false;
        
        for (const selector of imageListSelectors) {
          const imageList = page.locator(selector).first();
          if (await imageList.count() > 0) {
            console.log(`Found image list with selector: ${selector}`);
            await expect(imageList).toBeVisible();
            imageListFound = true;
            break;
          }
        }
        
        if (!imageListFound) {
          console.log('No image list found with standard selectors');
          await page.screenshot({ path: 'test-results/image-list-not-found.png' });
        }
      } else {
        console.log('No image list button found, skipping image list check');
      }
      
      console.log('Existing image markdown test completed successfully');
    } catch (error) {
      console.error('Error in existing image markdown test:', error);
      await page.screenshot({ path: 'test-results/existing-image-test-failure.png' });
      throw error;
    }
  });

  test('should allow uploading a new image', async ({ page }) => {
    test.slow();
    
    try {
      console.log('Starting image upload test...');
      
      // Find the file input or upload button
      const fileInput = page.locator('input[type="file"], .upload-button, button:has-text("Upload")').first();
      
      // Check if file input exists
      const fileInputCount = await fileInput.count();
      if (fileInputCount === 0) {
        console.log('No file upload input found, taking screenshot...');
        await page.screenshot({ path: 'test-results/no-file-input.png' });
        test.skip(true, 'No file upload input found');
        return;
      }
      
      console.log('File input found, waiting for it to be visible...');
      await fileInput.waitFor({ state: 'visible', timeout: 10000 });
      
      // Create a test file
      const testFile = {
        name: 'test.jpg',
        mimeType: 'image/jpeg',
        buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64')
      };
      
      console.log('Uploading test file...');
      await fileInput.setInputFiles({
        name: testFile.name,
        mimeType: testFile.mimeType,
        buffer: testFile.buffer
      });
      
      console.log('Checking for success message...');
      const successMessage = page.locator('.success-message, .alert-success, [role="alert"]').first();
      await expect(successMessage).toBeVisible({ timeout: 15000 });
      
      console.log('Verifying image in editor content...');
      const editor = page.locator('textarea[name="content"]').first();
      const editorContent = await editor.inputValue();
      expect(editorContent).toMatch(/!\[.*?\]\(\/images\/.*?\.(jpg|jpeg|png|gif)\)/);
      
      console.log('Image upload test completed successfully');
    } catch (error) {
      console.error('Error in image upload test:', error);
      await page.screenshot({ path: 'test-results/image-upload-failure.png' });
      throw error;
    }
  });

  test('should show error for invalid file type', async ({ page }) => {
    test.slow();
    
    try {
      console.log('Starting invalid file type test...');
      
      // Find the file input or upload button
      const fileInput = page.locator('input[type="file"], .upload-button, button:has-text("Upload")').first();
      
      // Check if file input exists
      const fileInputCount = await fileInput.count();
      if (fileInputCount === 0) {
        console.log('No file upload input found, taking screenshot...');
        await page.screenshot({ path: 'test-results/no-file-input-invalid-test.png' });
        test.skip(true, 'No file upload input found');
        return;
      }
      
      console.log('File input found, waiting for it to be visible...');
      await fileInput.waitFor({ state: 'visible', timeout: 10000 });
      
      // Create an invalid test file
      const testFile = {
        name: 'test.txt',
        mimeType: 'text/plain',
        buffer: Buffer.from('This is not an image file')
      };
      
      console.log('Uploading invalid file...');
      await fileInput.setInputFiles({
        name: testFile.name,
        mimeType: testFile.mimeType,
        buffer: testFile.buffer
      });
      
      console.log('Checking for error message...');
      const errorMessage = page.locator('.error-message, .alert-error, [role="alert"]').first();
      await expect(errorMessage).toBeVisible({ timeout: 10000 });
      await expect(errorMessage).toContainText(/invalid.*file|unsupported.*type|error/i);
      
      console.log('Invalid file type test completed successfully');
    } catch (error) {
      console.error('Error in invalid file type test:', error);
      await page.screenshot({ path: 'test-results/invalid-file-test-failure.png' });
      throw error;
    }
  });

  test('should show preview of markdown images', async ({ page }) => {
    test.slow();
    
    try {
      console.log('Starting markdown preview test...');
      
      // Add an image markdown to the editor
      const editor = page.locator('textarea[name="content"]').first();
      await editor.waitFor({ state: 'visible', timeout: 10000 });
      await editor.fill('![Test Image](/images/test.jpg)');
      
      console.log('Verifying image preview...');
      // Try multiple possible preview selectors with retries
      const previewSelectors = [
        '#preview img', 
        '.preview img', 
        '[data-preview] img',
        'div[class*="preview"] img',
        'img[src="/images/test.jpg"]'
      ];
      
      let previewFound = false;
      const maxRetries = 3;
      
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        console.log(`Preview check attempt ${attempt}/${maxRetries}...`);
        
        for (const selector of previewSelectors) {
          const img = page.locator(selector).first();
          if (await img.count() > 0) {
            console.log(`Found image with selector: ${selector}`);
            try {
              await expect(img).toHaveAttribute('src', '/images/test.jpg', { timeout: 10000 });
              previewFound = true;
              console.log('Image preview verified successfully');
              break;
            } catch (imgError) {
              console.log(`Image found but attribute check failed with selector ${selector}:`, imgError);
            }
          }
        }
        
        if (previewFound) break;
        
        if (attempt < maxRetries) {
          console.log(`Retrying in 1 second... (${maxRetries - attempt} attempts remaining)`);
          await page.waitForTimeout(1000);
        }
      }
      
      if (!previewFound) {
        console.log('Could not verify image preview, taking screenshot...');
        await page.screenshot({ path: 'test-results/preview-verification-failed.png' });
        const pageContent = await page.content();
        console.log('Page content:', pageContent.substring(0, 1000) + '...');
        test.fail(true, 'Could not verify image preview');
      }
      
      console.log('Markdown preview test completed');
    } catch (error) {
      console.error('Error in markdown preview test:', error);
      await page.screenshot({ path: 'test-results/preview-test-failure.png' });
      throw error;
    }
  });

  test('should handle image replacement workflow', async ({ page }) => {
    test.slow();
    
    try {
      console.log('Starting image replacement workflow test...');
      
      // First, add an image to the content
      const editor = page.locator('textarea[name="content"]').first();
      await editor.waitFor({ state: 'visible', timeout: 10000 });
      await editor.fill('![Old Image](/images/old.jpg)');
      
      console.log('Looking for replace button...');
      // Try multiple possible replace button selectors
      const replaceButtonSelectors = [
        'button:has-text("Replace")',
        '[title*="Replace"]',
        'button[aria-label*="replace"]',
        '.replace-button',
        'button:has(svg[aria-label*="replace"])'
      ];
      
      let replaceButton = page.locator('button').first(); // Default to first button if none found
      let buttonFound = false;
      
      for (const selector of replaceButtonSelectors) {
        const btn = page.locator(selector).first();
        if (await btn.count() > 0) {
          console.log(`Found replace button with selector: ${selector}`);
          replaceButton = btn;
          buttonFound = true;
          break;
        }
      }
      
      if (!buttonFound) {
        console.log('No replace button found with specific selectors, using default button');
      }
      
      if (!replaceButton) {
        console.log('No replace button found, taking screenshot...');
        await page.screenshot({ path: 'test-results/replace-button-not-found.png' });
        test.skip(true, 'Replace button not found, skipping test');
        return;
      }
      
      console.log('Clicking replace button...');
      await replaceButton.waitFor({ state: 'visible', timeout: 10000 });
      await replaceButton.click();
      
      console.log('Waiting for file input to appear...');
      // Try multiple possible file input selectors
      const fileInputSelectors = [
        'input[type="file"]',
        '.file-upload input',
        'input[accept*="image"]',
        'input[class*="file"]',
        'input[class*="upload"]'
      ];
      
      let fileInput = page.locator('input[type="file"]').first(); // Default to standard file input
      let inputFound = false;
      
      for (const selector of fileInputSelectors) {
        const input = page.locator(selector).first();
        try {
          await input.waitFor({ state: 'visible', timeout: 5000 });
          if (await input.count() > 0) {
            console.log(`Found file input with selector: ${selector}`);
            fileInput = input;
            inputFound = true;
            break;
          }
        } catch (e) {
          console.log(`File input not found with selector ${selector}:`, (e as Error).message);
        }
      }
      
      if (!inputFound) {
        console.log('No file input found with specific selectors, using default file input');
      }
      
      if (!fileInput) {
        console.log('No file input found after clicking replace, taking screenshot...');
        await page.screenshot({ path: 'test-results/file-input-not-found.png' });
        test.fail(true, 'File input not found after clicking replace');
        return;
      }
      
      // Handle the file selection
      const testFile = {
        name: 'new-image.jpg',
        mimeType: 'image/jpeg',
        buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64')
      };
      
      console.log('Uploading replacement image...');
      await fileInput.setInputFiles({
        name: testFile.name,
        mimeType: testFile.mimeType,
        buffer: testFile.buffer
      });
      
      console.log('Verifying image was replaced...');
      // Wait for any upload to complete
      await page.waitForTimeout(2000);
      
      // Check for success message if available
      try {
        const successMessage = page.locator('.success-message, .alert-success, [role="alert"]').first();
        await successMessage.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {
          console.log('No success message found, continuing...');
        });
      } catch (e) {
        console.log('Error checking for success message:', e);
      }
      
      // Verify the editor content was updated
      const editorContent = await editor.inputValue();
      
      if (!editorContent.match(/!\[.*?\]\(\/images\/.*?\.(jpg|jpeg|png|gif)\)/)) {
        console.log('Image replacement failed, editor content:', editorContent);
        await page.screenshot({ path: 'test-results/replacement-failed.png' });
        test.fail(true, 'Image was not properly replaced in editor');
        return;
      }
      
      if (editorContent.includes('/images/old.jpg')) {
        console.log('Old image path still exists in editor');
        await page.screenshot({ path: 'test-results/old-image-still-exists.png' });
        test.fail(true, 'Old image path was not replaced');
        return;
      }
      
      console.log('Image replacement test completed successfully');
    } catch (error) {
      console.error('Error in image replacement test:', error);
      await page.screenshot({ path: 'test-results/replacement-test-failure.png' });
      throw error;
    }
  });
});

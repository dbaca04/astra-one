import { test, expect, type Page, type ConsoleMessage } from '@playwright/test';
import path from 'path';
import fs from 'fs';

// Test data
const TEST_IMAGES = {
  jpg: 'test-image.jpg',
  png: 'test-image.png',
  gif: 'test-image.gif',
  webp: 'test-image.webp',
  svg: 'test-image.svg',
  large: 'large-image.jpg',  // Should be > 5MB
  invalid: 'test-file.txt',
  corrupt: 'corrupt-image.jpg'
} as const;

// Test configurations
const CONFIG = {
  maxFileSize: 5 * 1024 * 1024, // 5MB
  supportedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
  testImageSizes: [
    { name: 'small', width: 100, height: 100 },
    { name: 'medium', width: 800, height: 600 },
    { name: 'large', width: 1920, height: 1080 }
  ],
  invalidFileTypes: [
    { name: 'text', extension: '.txt', mime: 'text/plain' },
    { name: 'pdf', extension: '.pdf', mime: 'application/pdf' },
    { name: 'executable', extension: '.exe', mime: 'application/x-msdownload' }
  ]
} as const;

// Helper function to get test file path
function getTestFilePath(filename: string): string {
  const testDataDir = path.join(process.cwd(), 'test-data');
  return path.join(testDataDir, filename);
}

// Helper to create a test image file
async function createTestImage(
  filename: string, 
  width = 100, 
  height = 100, 
  format: 'png' | 'jpeg' | 'webp' = 'png'
): Promise<string> {
  const filePath = getTestFilePath(filename);
  const dir = path.dirname(filePath);
  
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  // Skip if file already exists
  if (fs.existsSync(filePath)) {
    return filePath;
  }
  
  // Use Playwright to generate a test image
  const { chromium } = require('@playwright/test');
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Create a data URL for the image
    const dataUrl = await page.evaluate(({ w, h, f }) => {
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Could not get 2D context from canvas');
      }
      
      // Draw a gradient background
      const gradient = ctx.createLinearGradient(0, 0, w, h);
      gradient.addColorStop(0, `hsl(${Math.random() * 360}, 70%, 50%)`);
      gradient.addColorStop(1, `hsl(${Math.random() * 360}, 70%, 50%)`);
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);
      
      // Add some text
      ctx.fillStyle = 'white';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${w}x${h} ${f}`, w/2, h/2);
      
      // Return as data URL
      return canvas.toDataURL(`image/${f}`);
    }, { w: width, h: height, f: format });
    
    // Save the image to disk
    const base64Data = dataUrl.split(',')[1];
    if (!base64Data) {
      throw new Error('Invalid data URL generated');
    }
    
    const buffer = Buffer.from(base64Data, 'base64');
    fs.writeFileSync(filePath, buffer);
    
    console.log(`Created test image: ${filePath} (${width}x${height} ${format})`);
    return filePath;
  } catch (error) {
    console.error('Error creating test image:', error);
    throw error;
  } finally {
    await browser.close().catch(console.error);
  }
}

// Helper to create a large test file
async function createLargeTestFile(filename: string, sizeInMB: number): Promise<string> {
  const filePath = getTestFilePath(filename);
  const dir = path.dirname(filePath);
  
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  // Skip if file already exists
  if (fs.existsSync(filePath)) {
    return filePath;
  }
  
  // Create a buffer of the specified size
  const buffer = Buffer.alloc(1024 * 1024); // 1MB chunk
  const writeStream = fs.createWriteStream(filePath);
  
  return new Promise((resolve, reject) => {
    let bytesWritten = 0;
    
    function writeChunk() {
      let canContinue = true;
      
      while (bytesWritten < sizeInMB * 1024 * 1024 && canContinue) {
        const remaining = (sizeInMB * 1024 * 1024) - bytesWritten;
        const toWrite = Math.min(remaining, buffer.length);
        
        canContinue = writeStream.write(buffer.slice(0, toWrite));
        bytesWritten += toWrite;
      }
      
      if (bytesWritten < sizeInMB * 1024 * 1024) {
        writeStream.once('drain', writeChunk);
      } else {
        writeStream.end();
      }
    }
    
    writeStream.on('finish', () => resolve(filePath));
    writeStream.on('error', reject);
    
    writeChunk();
  });
}

// Helper function to login to admin
async function login(page: Page): Promise<boolean> {
  try {
    await page.goto('/admin/login', { waitUntil: 'networkidle' });

    // Wait for the username and password fields to appear
    await page.waitForSelector('input[name="username"]', { timeout: 10000 });
    await page.waitForSelector('input[name="password"]', { timeout: 10000 });

    // Fill in the credentials
    await page.fill('input[name="username"]', 'dom@domdhi.com');
    await page.fill('input[name="password"]', 'Dombaca04');

    // Click the submit button
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle' }),
      page.click('button[type="submit"]')
    ]);

    // Check for successful login (look for admin content or logout button)
    const loggedIn = await page.locator('button:has-text("Logout"), .admin-content').first().isVisible().catch(() => false);

    if (!loggedIn) {
      // Optionally, grab error message
      const errorMessage = await page.locator('.text-red-500, .alert-error, [role="alert"]').first().textContent().catch(() => null);
      console.error('Login failed:', errorMessage || 'Unknown error');
      await page.screenshot({ path: 'test-results/login-failed.png' });
      return false;
    }

    return true;
  } catch (error) {
    console.error('Login error:', error);
    await page.screenshot({ path: 'test-results/login-error.png' });
    throw error;
  }
}

test.describe('Image Upload Tests', () => {
  // Ensure test directories exist
  const testDataDir = path.join(process.cwd(), 'test-data');
  const testResultsDir = path.join(process.cwd(), 'test-results');
  
  // Create test data directory if it doesn't exist
  if (!fs.existsSync(testDataDir)) {
    fs.mkdirSync(testDataDir, { recursive: true });
  }
  
  // Create test results directory if it doesn't exist
  if (!fs.existsSync(testResultsDir)) {
    fs.mkdirSync(testResultsDir, { recursive: true });
  }
  
  test.beforeEach(async ({ page }, testInfo) => {
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
    
    // Log failed requests
    page.on('requestfailed', request => {
      console.error(`Request failed: ${request.failure()?.errorText} ${request.url()}`);
    });
    
    // Take a screenshot at the start of each test
    const safeTestName = testInfo.titlePath.join('-').replace(/[^a-z0-9-]/gi, '_').toLowerCase();
    await page.screenshot({ 
      path: path.join(testResultsDir, `${safeTestName}-start.png`),
      fullPage: true
    });
    
    // Login before each test
    const isLoggedIn = await login(page);
    expect(isLoggedIn, 'Login failed').toBeTruthy();
    
    // Navigate to content editor
    console.log('Navigating to content editor...');
    await page.goto('/admin/content/new', { waitUntil: 'networkidle' });
    
    // Wait for editor to be ready
    const editor = page.locator('textarea[name="content"]').first();
    await editor.waitFor({ state: 'visible', timeout: 15000 });
    console.log('Editor is ready');
  });

  test('should display existing image markdown in the editor and preview', async ({ page }) => {
    const testImageUrl = '/images/test-image.jpg';
    const markdown = `![Test Image](${testImageUrl})`;
    const editor = page.locator('textarea[name="content"]').first();
    await editor.fill(markdown);
    // Check markdown content
    const content = await editor.inputValue();
    expect(content).toContain(testImageUrl);
    // Check preview (assuming preview uses <img src="...">)
    const previewImg = page.locator(`img[src="${testImageUrl}"]`).first();
    await expect(previewImg).toBeVisible();
    await page.screenshot({ path: 'test-results/view-existing-image.png' });
  });

  test('should replace an existing image and update markdown/preview', async ({ page }) => {
    // Insert initial image markdown
    const initialImageUrl = '/images/test-image.jpg';
    const newImagePath = getTestFilePath('test-image.png');
    const editor = page.locator('textarea[name="content"]').first();
    await editor.fill(`![Replace Me](${initialImageUrl})`);
    // Find and click replace image UI (simulate user action)
    const replaceBtn = page.locator('button:has-text("Replace"), .replace-image-btn').first();
    if (await replaceBtn.isVisible()) {
      await replaceBtn.click();
      // Upload new image
      const fileInput = page.locator('input[type="file"], .file-upload-input').first();
      await fileInput.setInputFiles(newImagePath);
      // Wait for upload to complete
      await page.waitForTimeout(1000);
      // Check that markdown has updated
      const updatedContent = await editor.inputValue();
      expect(updatedContent).toMatch(/!\[.*?\]\(\/images\/.*?\.png\)/);
      // Check preview
      const previewImg = page.locator('img[src^="/images/"]').first();
      await expect(previewImg).toBeVisible();
      await page.screenshot({ path: 'test-results/image-replace-success.png' });
    } else {
      test.skip();
    }
  });

  test('should show error for corrupt and unsupported image files', async ({ page }) => {
    // Corrupt image
    const corruptPath = getTestFilePath('corrupt-image.jpg');
    const fileInput = page.locator('input[type="file"], .file-upload-input').first();
    await fileInput.setInputFiles(corruptPath);
    const errorMsg = page.locator('.error-message, .alert-error, [role="alert"]').first();
    await expect(errorMsg).toBeVisible();
    await page.screenshot({ path: 'test-results/corrupt-image-error.png' });
    // Unsupported file
    const invalidPath = getTestFilePath('test-file.txt');
    await fileInput.setInputFiles(invalidPath);
    await expect(errorMsg).toBeVisible();
    await page.screenshot({ path: 'test-results/invalid-file-error.png' });
  });

  test('should upload a JPG image successfully', async ({ page }) => {
    const testImage = TEST_IMAGES.jpg;
    const testImagePath = getTestFilePath(testImage);
    
    // Skip if test image doesn't exist
    test.skip(!fs.existsSync(testImagePath), `Test image ${testImage} not found`);
    
    // Click the image upload button
    const fileInput = page.locator('input[type="file"], .file-upload-input').first();
    await fileInput.setInputFiles(testImagePath);
    
    // Wait for upload to complete
    await expect(page.locator('.upload-progress')).not.toBeVisible({ timeout: 30000 });
    
    // Verify success message
    const successMessage = page.locator('.success-message, .alert-success, [role="status"]').first();
    await expect(successMessage).toBeVisible({ timeout: 10000 });
    
    // Verify image is inserted into editor
    const editor = page.locator('textarea[name="content"]').first();
    const editorContent = await editor.inputValue();
    expect(editorContent).toMatch(/!\[.*?\]\(\/images\/.*?\.(jpg|jpeg|png|gif)\)/);
    
    // Take a screenshot
    await page.screenshot({ path: path.join(testResultsDir, 'image-upload-success.png') });
  });
  
  test('should handle large file uploads', async ({ page }) => {
    test.slow(); // Mark test as slow as it involves large file upload
    
    const largeImage = TEST_IMAGES.large;
    const largeImagePath = getTestFilePath(largeImage);
    
    // Skip if large test image doesn't exist
    test.skip(!fs.existsSync(largeImagePath), `Large test image ${largeImage} not found`);
    
    // Click the image upload button
    const fileInput = page.locator('input[type="file"], .file-upload-input').first();
    await fileInput.setInputFiles(largeImagePath);
    
    // Verify error message for large file
    const errorMessage = page.locator('.error-message, .alert-error, [role="alert"]').first();
    await expect(errorMessage).toContainText(['too large', 'exceeds', 'limit', '5MB'], { 
      ignoreCase: true, 
      timeout: 30000 
    });
    
    // Take a screenshot
    await page.screenshot({ path: path.join(testResultsDir, 'large-file-upload-error.png') });
  });
  
  test('should validate file types', async ({ page }) => {
    const invalidFile = TEST_IMAGES.invalid;
    const invalidFilePath = getTestFilePath(invalidFile);
    
    // Create invalid test file if it doesn't exist
    if (!fs.existsSync(invalidFilePath)) {
      fs.writeFileSync(invalidFilePath, 'This is not an image file');
    }
    
    // Click the image upload button
    const fileInput = page.locator('input[type="file"], .file-upload-input').first();
    await fileInput.setInputFiles(invalidFilePath);
    
    // Verify error message for invalid file type
    const errorMessage = page.locator('.error-message, .alert-error, [role="alert"]').first();
    await expect(errorMessage).toContainText(['invalid', 'not supported', 'file type'], { 
      ignoreCase: true, 
      timeout: 10000 
    });
    
    // Take a screenshot
    await page.screenshot({ path: path.join(testResultsDir, 'invalid-file-upload-error.png') });
  });
});

import { test, expect } from '@playwright/test';

test('inspect login page', async ({ page }) => {
  // Navigate to the login page
  await page.goto('/admin/login');
  
  // Take a screenshot of the page
  await page.screenshot({ path: 'login-page-inspect.png' });
  console.log('Screenshot saved as login-page-inspect.png');
  
  // Log the page title
  const title = await page.title();
  console.log('Page title:', title);
  
  // Log all input fields on the page
  const inputs = await page.$$eval('input', (elements) => 
    elements.map(el => ({
      id: el.id,
      name: el.name,
      type: el.type,
      placeholder: el.placeholder,
      value: el.value
    }))
  );
  console.log('Input fields:', JSON.stringify(inputs, null, 2));
  
  // Log all buttons on the page
  const buttons = await page.$$eval('button', (elements) => 
    elements.map(el => ({
      id: el.id,
      text: el.textContent?.trim(),
      type: el.getAttribute('type')
    }))
  );
  console.log('Buttons:', JSON.stringify(buttons, null, 2));
  
  // Log any forms on the page
  const forms = await page.$$eval('form', (elements) => 
    elements.map((el, index) => ({
      index,
      id: el.id,
      action: el.getAttribute('action'),
      method: el.getAttribute('method'),
      inputs: Array.from(el.getElementsByTagName('input')).map(input => ({
        id: input.id,
        name: input.name,
        type: input.type,
        required: input.required
      }))
    }))
  );
  console.log('Forms:', JSON.stringify(forms, null, 2));
  
  // Log any error messages
  const errorMessages = await page.$$eval(
    '.error, .error-message, .alert, .alert-error, [role="alert"], .text-red-500',
    elements => elements.map(el => ({
      text: el.textContent?.trim(),
      html: el.innerHTML,
      classes: el.className,
      id: el.id
    }))
  );
  console.log('Error messages:', JSON.stringify(errorMessages, null, 2));
  
  // Check if there's a CSRF token
  const csrfToken = await page.$('input[name="_csrf"]');
  if (csrfToken) {
    console.log('CSRF token field found');
  } else {
    console.log('No CSRF token field found');
  }
});

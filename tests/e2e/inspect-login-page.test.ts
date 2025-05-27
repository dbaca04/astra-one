import { test, expect } from '@playwright/test';
import fs from 'fs';

test('inspect login page', async ({ page }) => {
  // Navigate to the login page
  console.log('Navigating to login page...');
  await page.goto('http://localhost:4321/admin/login', { waitUntil: 'networkidle' });
  
  // Take a screenshot
  await page.screenshot({ path: 'test-results/login-page.png' });
  console.log('Screenshot saved as test-results/login-page.png');
  
  // Save the page HTML
  const pageContent = await page.content();
  if (!fs.existsSync('test-results')) {
    fs.mkdirSync('test-results', { recursive: true });
  }
  fs.writeFileSync('test-results/login-page.html', pageContent);
  console.log('Page HTML saved as test-results/login-page.html');
  
  // Get all inputs
  const inputs = await page.$$eval('input', inputs => 
    inputs.map(input => ({
      id: input.id,
      name: input.name,
      type: input.type,
      value: input.value,
      placeholder: input.placeholder,
      required: input.required
    }))
  );
  
  // Get all forms
  const forms = await page.$$eval('form', forms => 
    forms.map(form => ({
      id: form.id,
      action: form.action,
      method: form.method,
      inputs: Array.from(form.querySelectorAll('input')).map(input => ({
        id: input.id,
        name: input.name,
        type: input.type
      }))
    }))
  );
  
  // Get all buttons
  const buttons = await page.$$eval('button', buttons => 
    buttons.map(button => ({
      id: button.id,
      text: button.textContent?.trim(),
      type: button.type
    }))
  );
  
  // Log the results
  const result = {
    url: page.url(),
    title: await page.title(),
    inputs,
    forms,
    buttons,
    hasCsrfToken: await page.$('input[name="_csrf"]') !== null,
    errorMessages: await page.$$eval(
      '.error, .error-message, .alert, .alert-error, [role="alert"], .text-red-500',
      elements => elements.map(el => ({
        text: el.textContent?.trim(),
        html: el.innerHTML,
        classes: el.className,
        id: el.id
      }))
    )
  };
  
  // Save the results to a file
  fs.writeFileSync('test-results/login-inspection.json', JSON.stringify(result, null, 2));
  console.log('Inspection results saved to test-results/login-inspection.json');
  
  // Output the results to the console
  console.log('\n=== Login Page Inspection Results ===');
  console.log(`Title: ${result.title}`);
  console.log(`URL: ${result.url}`);
  console.log('\nInputs:');
  console.table(result.inputs);
  console.log('\nForms:');
  console.log(JSON.stringify(result.forms, null, 2));
  console.log('\nButtons:');
  console.table(result.buttons);
  console.log('\nCSRF Token Present:', result.hasCsrfToken);
  
  if (result.errorMessages.length > 0) {
    console.log('\nError Messages:');
    console.table(result.errorMessages);
  }
});

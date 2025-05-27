const { chromium } = require('@playwright/test');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  console.log('Navigating to login page...');
  await page.goto('http://localhost:4321/admin/login', { waitUntil: 'networkidle' });
  
  // Take a screenshot
  await page.screenshot({ path: 'login-page.png' });
  console.log('Screenshot saved as login-page.png');
  
  // Get page content
  const pageContent = await page.content();
  fs.writeFileSync('login-page.html', pageContent);
  console.log('Page HTML saved as login-page.html');
  
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
      text: button.textContent.trim(),
      type: button.type
    }))
  );
  
  // Save the inspection results
  const result = {
    url: page.url(),
    title: await page.title(),
    inputs,
    forms,
    buttons,
    hasCsrfToken: await page.$('input[name="_csrf"]') !== null
  };
  
  writeFileSync('login-inspection.json', JSON.stringify(result, null, 2));
  console.log('Inspection results saved to login-inspection.json');
  
  // Keep the browser open for 30 seconds for manual inspection
  console.log('Keeping browser open for 30 seconds...');
  await new Promise(resolve => setTimeout(resolve, 30000));
  
  await browser.close();
})();

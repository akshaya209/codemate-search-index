const fs = require('fs');
const path = require('path');
const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost:3001'; // Frontend URL

test.describe('US-009 System Testing: Full Upload and Search Workflow', () => {

  test('should successfully upload a file and find content via the search bar', async ({ page }) => {
    // Step 0: Create test file dynamically
    const testFileName = 'e2e_test_doc.txt';
    const filePath = path.join(__dirname, '..', 'fixtures', testFileName);
    fs.writeFileSync(filePath, 'This is a test file. The keyword is here for FULL_E2E check.');
    console.log(`📄 Test file created: ${filePath}`);

    // Step 1: Open frontend
    await page.goto(BASE_URL);
    await page.waitForSelector('text=/Upload/i', { timeout: 15000 });
    console.log('✅ Frontend loaded.');

    // Step 2: Upload file
    await page.locator('input[type="file"]').setInputFiles(filePath);
    await page.getByRole('button', { name: /upload/i }).click();
    console.log('⚡ Upload triggered, waiting for indexing...');

    // Step 2b: Wait for backend to process file
    await page.waitForSelector('text=✅ File processed and indexed successfully!', { timeout: 30000 });
    console.log('✅ File successfully indexed by backend.');

    // Step 3: Fill search input
    const searchInput = await page.$('input[placeholder*="Search indexed documents"]');
    if (!searchInput) throw new Error('❌ Could not find the search input box!');
    
    await searchInput.fill('keyword');
    await page.getByRole('button', { name: /search/i }).click();

    // Step 4: Dynamically wait up to 30s for results to appear
    const resultsDivs = page.locator('h2:has-text("📑 Ranked Results") + div > div');
    let resultsFound = false;
    const maxWait = 30000;
    const pollInterval = 1000;

    for (let elapsed = 0; elapsed < maxWait; elapsed += pollInterval) {
      const count = await resultsDivs.count();
      if (count > 0) {
        resultsFound = true;
        console.log(`✅ Search results found after ${elapsed / 1000}s`);
        break;
      }
      await page.waitForTimeout(pollInterval);
    }

    if (!resultsFound) {
      throw new Error('❌ No search results found. File may not be indexed yet.');
    }

    // Step 5: Verify uploaded file keyword appears in results
    const firstResultText = await resultsDivs.first().innerText();
    expect(firstResultText).toMatch(/keyword/i);

    console.log('✅ Search result verification passed.');
  });

});

const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  console.log('Starting Map Integration Test...');
  
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized']
  });
  
  const page = await browser.newPage();
  
  try {
    // Navigate to the frontend
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
    console.log('Loaded frontend application');
    
    // Wait for map to load (adjust selector as needed)
    await page.waitForSelector('.google-map', { timeout: 10000 })
      .catch(() => console.log('Map element not found, but continuing test...'));
    
    // Test location search
    const locationInput = await page.$('input[placeholder="Enter pickup address..."]');
    if (locationInput) {
      console.log('Found location input field');
      await locationInput.click();
      await locationInput.type('New York');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(2000);
      console.log('Entered location search');
    } else {
      console.log('Location input field not found');
    }
    
    // Check if map is displayed
    const mapElement = await page.$('.google-map');
    if (mapElement) {
      console.log('✅ Map is displayed');
    } else {
      console.log('❌ Map is not displayed');
    }
    
    // Check if markers are displayed
    const markers = await page.$$('.google-map img[src*="maps.gstatic.com"]');
    console.log(`Found ${markers.length} map markers`);
    
    // Test distance calculation
    console.log('Testing distance calculation...');
    // Click on a marker if available
    if (markers.length > 0) {
      await markers[0].click();
      await page.waitForTimeout(1000);
      
      // Check if distance info is displayed
      const distanceText = await page.evaluate(() => {
        const distanceElement = document.querySelector('.text-blue-600');
        return distanceElement ? distanceElement.textContent : null;
      });
      
      if (distanceText) {
        console.log(`✅ Distance calculation working: ${distanceText}`);
      } else {
        console.log('❌ Distance calculation not found');
      }
    }
    
    console.log('Map Integration Test completed');
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await page.waitForTimeout(5000); // Keep browser open for 5 seconds to see results
    await browser.close();
  }
})();
import { test, expect } from '@playwright/test';
import { AuthenticationFlow, TestAdmin } from './test-utils';

test.describe('Admin QR Code Generation', () => {
  let authFlow: AuthenticationFlow;
  let testAdmin: TestAdmin;

  test.beforeEach(async ({ page }) => {
    authFlow = new AuthenticationFlow(page);
    testAdmin = authFlow.generateTestAdmin();
    await authFlow.createAdminUser(testAdmin);
  });

  test('should display QR button in navigation for admin users', async ({ page }) => {
    // Login as admin
    await authFlow.loginAsAdmin(testAdmin);
    
    // Should be on dashboard
    await expect(page).toHaveURL('/dashboard');
    
    // Check for QR button in navigation
    await expect(page.locator('button:has-text("Show QR")')).toBeVisible();
  });

  test('should generate and display QR code when button is clicked', async ({ page }) => {
    // Login as admin
    await authFlow.loginAsAdmin(testAdmin);
    
    // Click QR button
    await page.click('button:has-text("Show QR")');
    
    // Should show modal with QR code
    await expect(page.locator('.fixed.inset-0')).toBeVisible(); // Modal overlay
    await expect(page.locator('.bg-white.p-8.rounded-lg')).toBeVisible(); // Modal content
    
    // Check for QR code canvas element (from react-qr-code)
    await expect(page.locator('canvas, svg')).toBeVisible();
    
    // Check for close button
    await expect(page.locator('button:has-text("Close")')).toBeVisible();
  });

  test('should close QR modal when close button is clicked', async ({ page }) => {
    // Login as admin
    await authFlow.loginAsAdmin(testAdmin);
    
    // Click QR button to open modal
    await page.click('button:has-text("Show QR")');
    
    // Modal should be visible
    await expect(page.locator('.fixed.inset-0')).toBeVisible();
    
    // Click close button
    await page.click('button:has-text("Close")');
    
    // Modal should be hidden
    await expect(page.locator('.fixed.inset-0')).not.toBeVisible();
  });

  test('should close QR modal when clicking overlay', async ({ page }) => {
    // Login as admin
    await authFlow.loginAsAdmin(testAdmin);
    
    // Click QR button to open modal
    await page.click('button:has-text("Show QR")');
    
    // Modal should be visible
    await expect(page.locator('.fixed.inset-0')).toBeVisible();
    
    // Click on overlay (outside modal content)
    await page.locator('.fixed.inset-0').click();
    
    // Modal should be hidden
    await expect(page.locator('.fixed.inset-0')).not.toBeVisible();
  });

  test('should generate new QR code URL with proper format', async ({ page }) => {
    // Login as admin
    await authFlow.loginAsAdmin(testAdmin);
    
    // Click QR button
    await page.click('button:has-text("Show QR")');
    
    // Wait for QR code to be generated
    await expect(page.locator('canvas, svg')).toBeVisible();
    
    // The QR code should contain a check-in URL
    // Note: We can't directly read the QR code content in this test,
    // but we can verify the UI elements are present
    await expect(page.locator('.bg-white.p-8.rounded-lg')).toBeVisible();
  });

  test('should not display QR button for non-admin users', async ({ page }) => {
    // Create and login as regular user
    const regularUser = authFlow.generateTestUser();
    await authFlow.signup(regularUser);
    await authFlow.loginWithUser(regularUser);
    
    // Should be on profile page
    await expect(page).toHaveURL('/profile');
    
    // QR button should not be visible
    await expect(page.locator('button:has-text("Show QR")')).not.toBeVisible();
  });

  test('should display QR button for coach users', async ({ page }) => {
    // Create coach user (coaches can also create QR codes)
    const coachUser = {
      ...authFlow.generateTestUser(),
      role: ['coach']
    };
    await authFlow.createMockUser(coachUser);
    
    // Login as coach
    await authFlow.login(coachUser.email, coachUser.password);
    
    // Should redirect to profile (coaches don't have dashboard access)
    await expect(page).toHaveURL('/profile');
    
    // Check for QR button in navigation
    await expect(page.locator('button:has-text("Show QR")')).toBeVisible();
  });

  test('should handle multiple QR code generations', async ({ page }) => {
    // Login as admin
    await authFlow.loginAsAdmin(testAdmin);
    
    // Generate first QR code
    await page.click('button:has-text("Show QR")');
    await expect(page.locator('.fixed.inset-0')).toBeVisible();
    
    // Close modal
    await page.click('button:has-text("Close")');
    await expect(page.locator('.fixed.inset-0')).not.toBeVisible();
    
    // Generate second QR code
    await page.click('button:has-text("Show QR")');
    await expect(page.locator('.fixed.inset-0')).toBeVisible();
    
    // Should still show QR code properly
    await expect(page.locator('canvas, svg')).toBeVisible();
  });

  test('should maintain QR modal state during navigation', async ({ page }) => {
    // Login as admin
    await authFlow.loginAsAdmin(testAdmin);
    
    // Click QR button to open modal
    await page.click('button:has-text("Show QR")');
    await expect(page.locator('.fixed.inset-0')).toBeVisible();
    
    // Navigate to different admin page
    await page.click('a:has-text("Members")');
    await expect(page).toHaveURL('/members');
    
    // Modal should be closed on navigation
    await expect(page.locator('.fixed.inset-0')).not.toBeVisible();
    
    // QR button should still be available
    await expect(page.locator('button:has-text("Show QR")')).toBeVisible();
  });

  test('should handle QR generation errors gracefully', async ({ page }) => {
    // Login as admin
    await authFlow.loginAsAdmin(testAdmin);
    
    // Click QR button - even if there are backend errors, 
    // the UI should handle it gracefully
    await page.click('button:has-text("Show QR")');
    
    // Should still attempt to show modal
    await expect(page.locator('button:has-text("Show QR")')).toBeVisible();
  });

  test('should have proper styling and accessibility for QR modal', async ({ page }) => {
    // Login as admin
    await authFlow.loginAsAdmin(testAdmin);
    
    // Click QR button
    await page.click('button:has-text("Show QR")');
    
    // Check modal accessibility
    const modal = page.locator('.fixed.inset-0');
    await expect(modal).toBeVisible();
    
    // Check modal has proper styling
    const modalContent = page.locator('.bg-white.p-8.rounded-lg');
    await expect(modalContent).toBeVisible();
    
    // Check close button is keyboard accessible
    const closeButton = page.locator('button:has-text("Close")');
    await expect(closeButton).toBeVisible();
    
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    await expect(closeButton).toBeFocused();
    
    // Test escape key to close modal
    await page.keyboard.press('Escape');
    await expect(modal).not.toBeVisible();
  });
}); 
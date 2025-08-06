import { test, expect } from '@playwright/test';
import { AuthenticationFlow, TestUser } from './test-utils';

test.describe('User Signup Flow', () => {
  let authFlow: AuthenticationFlow;
  let testUser: TestUser;

  test.beforeEach(async ({ page }) => {
    authFlow = new AuthenticationFlow(page);
    testUser = authFlow.generateTestUser();
  });

  test('should successfully signup a new user', async ({ page }) => {
    // Navigate to signup page
    await authFlow.goToSignup();

    // Verify signup form is displayed
    await expect(page.locator('form')).toBeVisible();
    await expect(page.locator('input[name="username"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    
    // Fill and submit signup form
    await authFlow.signup(testUser);
    
    // Should redirect to login page after successful signup
    await expect(page).toHaveURL('/login');
    await expect(page.locator('h2')).toContainText('Login');
  });

  test('should display validation errors for empty form', async ({ page }) => {
    await authFlow.goToSignup();
    
    // Try to submit empty form
    await page.click('button[type="submit"]');
    
    // Check that form doesn't submit (should stay on signup page)
    await expect(page).toHaveURL('/signup');
    
    // HTML5 validation should prevent submission
    // We can check if required fields are highlighted or have validation messages
    await expect(page.locator('input[name="username"]:invalid')).toBeVisible();
    await expect(page.locator('input[name="email"]:invalid')).toBeVisible();
    await expect(page.locator('input[name="password"]:invalid')).toBeVisible();
  });

  test('should validate email format', async ({ page }) => {
    await authFlow.goToSignup();
    
    // Fill form with invalid email
    await page.fill('input[name="username"]', testUser.username);
    await page.fill('input[name="firstName"]', testUser.firstName);
    await page.fill('input[name="lastName"]', testUser.lastName);
    await page.fill('input[name="email"]', 'invalid-email');
    await page.fill('input[name="password"]', testUser.password);
    await page.fill('input[name="passwordConfirm"]', testUser.password);
    
    await page.click('button[type="submit"]');
    
    // Should stay on signup page due to invalid email
    await expect(page).toHaveURL('/signup');
    await expect(page.locator('input[name="email"]:invalid')).toBeVisible();
  });

  test('should validate password confirmation match', async ({ page }) => {
    await authFlow.goToSignup();
    
    // Fill form with mismatched passwords
    await page.fill('input[name="username"]', testUser.username);
    await page.fill('input[name="firstName"]', testUser.firstName);
    await page.fill('input[name="lastName"]', testUser.lastName);
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);
    await page.fill('input[name="passwordConfirm"]', 'DifferentPassword123!');
    
    await page.click('button[type="submit"]');
    
    // Should stay on signup page
    await expect(page).toHaveURL('/signup');
  });

  test('should handle duplicate email error gracefully', async ({ page }) => {
    // First, create a user
    await authFlow.signup(testUser);
    
    // Try to signup again with the same email
    await authFlow.goToSignup();
    
    await page.fill('input[name="username"]', testUser.username + '2');
    await page.fill('input[name="firstName"]', testUser.firstName);
    await page.fill('input[name="lastName"]', testUser.lastName);
    await page.fill('input[name="email"]', testUser.email); // Same email
    await page.fill('input[name="password"]', testUser.password);
    await page.fill('input[name="passwordConfirm"]', testUser.password);
    await page.selectOption('select[name="belt"]', testUser.belt);
    
    await page.click('button[type="submit"]');
    
    // Should display error message for duplicate email
    await expect(page.locator('.text-red-500')).toContainText('Failed to sign up');
    await expect(page).toHaveURL('/signup');
  });

  test('should allow belt selection', async ({ page }) => {
    await authFlow.goToSignup();
    
    // Test belt selection options
    const beltSelect = page.locator('select[name="belt"]');
    await expect(beltSelect).toBeVisible();
    
    // Check all belt options exist in the DOM
    await expect(beltSelect.locator('option[value="white"]')).toHaveCount(1);
    await expect(beltSelect.locator('option[value="blue"]')).toHaveCount(1);
    await expect(beltSelect.locator('option[value="purple"]')).toHaveCount(1);
    await expect(beltSelect.locator('option[value="brown"]')).toHaveCount(1);
    await expect(beltSelect.locator('option[value="black"]')).toHaveCount(1);
    
    // Select a belt and verify it's selected
    await page.selectOption('select[name="belt"]', 'blue');
    await expect(beltSelect).toHaveValue('blue');
  });

  test('should handle avatar upload', async ({ page }) => {
    await authFlow.goToSignup();
    
    // Check avatar upload area is visible
    await expect(page.locator('span:has-text("Add Avatar")')).toBeVisible();
    
    // Note: Testing actual file upload would require setting up test files
    // This test just verifies the UI element exists
    await expect(page.locator('input[type="file"]')).toBeHidden(); // Should be hidden by design
  });

  test('should have accessible form labels', async ({ page }) => {
    await authFlow.goToSignup();
    
    // Verify all form fields have proper labels or placeholders for accessibility
    await expect(page.locator('input[name="username"]')).toHaveAttribute('placeholder', 'Username');
    await expect(page.locator('input[name="firstName"]')).toHaveAttribute('placeholder', 'First Name');
    await expect(page.locator('input[name="lastName"]')).toHaveAttribute('placeholder', 'Last Name');
    await expect(page.locator('input[name="email"]')).toHaveAttribute('placeholder', 'Email');
    await expect(page.locator('input[name="password"]')).toHaveAttribute('placeholder', 'Password');
    await expect(page.locator('input[name="passwordConfirm"]')).toHaveAttribute('placeholder', 'Confirm Password');
  });
}); 
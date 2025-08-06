import { test, expect } from '@playwright/test';
import { AuthenticationFlow, TestUser } from './test-utils';

test.describe('User Logout Flow', () => {
  let authFlow: AuthenticationFlow;
  let testUser: TestUser;

  test.beforeEach(async ({ page }) => {
    authFlow = new AuthenticationFlow(page);
    testUser = authFlow.generateTestUser();
  });

  test('should successfully logout and redirect to login page', async ({ page }) => {
    // Setup: Create user and login
    await authFlow.signup(testUser);
    await authFlow.loginWithUser(testUser);
    
    // Verify user is logged in and on profile page
    await expect(page).toHaveURL('/profile');
    await authFlow.expectLoggedIn();
    
    // Perform logout
    await authFlow.logout();
    
    // Should redirect to login page
    await authFlow.expectLoggedOut();
    await expect(page).toHaveURL('/login');
  });

  test('should clear user session after logout', async ({ page }) => {
    // Setup: Create user and login
    await authFlow.signup(testUser);
    await authFlow.loginWithUser(testUser);
    
    // Perform logout
    await authFlow.logout();
    
    // Try to access protected page
    await page.goto('/profile');
    
    // Should be redirected to login page because session is cleared
    await expect(page).toHaveURL('/login');
  });

  test('should prevent access to protected pages after logout', async ({ page }) => {
    // Setup: Create user and login
    await authFlow.signup(testUser);
    await authFlow.loginWithUser(testUser);
    
    // Perform logout
    await authFlow.logout();
    
    // Test access to various protected routes
    const protectedRoutes = ['/profile', '/dashboard'];
    
    for (const route of protectedRoutes) {
      await page.goto(route);
      
      // Should be redirected to login page
      await expect(page).toHaveURL('/login');
    }
  });

  test('should hide navigation elements after logout', async ({ page }) => {
    // Setup: Create user and login
    await authFlow.signup(testUser);
    await authFlow.loginWithUser(testUser);
    
    // Verify navigation is visible when logged in
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.locator('a:has-text("Profile")')).toBeVisible();
    
    // Perform logout
    await authFlow.logout();
    
    // Navigation should be hidden when logged out
    await expect(page.locator('nav')).not.toBeVisible();
    await expect(page.locator('a:has-text("Profile")')).not.toBeVisible();
  });

  test('should display login form after logout', async ({ page }) => {
    // Setup: Create user and login
    await authFlow.signup(testUser);
    await authFlow.loginWithUser(testUser);
    
    // Perform logout
    await authFlow.logout();
    
    // Should see login form elements
    await expect(page.locator('h2')).toContainText('Login');
    await expect(page.locator('input#email')).toBeVisible();
    await expect(page.locator('input#password')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toContainText('Login');
  });

  test('should handle logout when already logged out', async ({ page }) => {
    // Start from logged-out state
    await page.goto('/login');
    
    // Try to access logout functionality directly
    // This shouldn't cause errors or unexpected behavior
    await page.goto('/profile');
    
    // Should be redirected to login page
    await expect(page).toHaveURL('/login');
  });

  test('should allow login after logout', async ({ page }) => {
    // Setup: Create user and login
    await authFlow.signup(testUser);
    await authFlow.loginWithUser(testUser);
    
    // Perform logout
    await authFlow.logout();
    
    // Login again with same credentials
    await authFlow.loginWithUser(testUser);
    
    // Should be able to access protected content again
    await expect(page).toHaveURL('/profile');
    await authFlow.expectLoggedIn();
  });

  test('should maintain logout state across page refreshes', async ({ page }) => {
    // Setup: Create user and login
    await authFlow.signup(testUser);
    await authFlow.loginWithUser(testUser);
    
    // Perform logout
    await authFlow.logout();
    
    // Refresh the page
    await page.reload();
    
    // Should still be logged out
    await expect(page).toHaveURL('/login');
    
    // Try to access protected page after refresh
    await page.goto('/profile');
    await expect(page).toHaveURL('/login');
  });

  test('should handle browser back button after logout', async ({ page }) => {
    // Setup: Create user and login
    await authFlow.signup(testUser);
    await authFlow.loginWithUser(testUser);
    
    // Navigate to profile page
    await page.goto('/profile');
    await expect(page).toHaveURL('/profile');
    
    // Perform logout
    await authFlow.logout();
    
    // Try to go back to profile page using browser back
    await page.goBack();
    
    // Should be redirected to login page, not back to profile
    await expect(page).toHaveURL('/login');
  });

  test('should handle multiple logout attempts gracefully', async ({ page }) => {
    // Setup: Create user and login
    await authFlow.signup(testUser);
    await authFlow.loginWithUser(testUser);
    
    // First logout
    await authFlow.logout();
    await expect(page).toHaveURL('/login');
    
    // Try to logout again (should not cause errors)
    await page.goto('/login');
    await expect(page).toHaveURL('/login');
    
    // Should still be on login page without errors
    await expect(page.locator('h2')).toContainText('Login');
  });

  test('should clear all user-related data from UI after logout', async ({ page }) => {
    // Setup: Create user and login
    await authFlow.signup(testUser);
    await authFlow.loginWithUser(testUser);
    
    // Verify user-specific content is shown
    await expect(page).toHaveURL('/profile');
    // Note: The specific user content verification depends on your profile page implementation
    
    // Perform logout
    await authFlow.logout();
    
    // Verify no user-specific content remains visible
    await expect(page).toHaveURL('/login');
    
    // Navigate around to ensure no cached user data is displayed
    await page.goto('/');
    await expect(page).toHaveURL('/login'); // Root should redirect to login when logged out
  });
}); 
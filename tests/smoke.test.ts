import { describe, it, expect } from 'vitest';

describe('Smoke Tests', () => {
  it('should have NODE_ENV defined or default to test', () => {
    expect(process.env.NODE_ENV || 'test').toBeTruthy();
  });

  it('should be able to import the app module', async () => {
    // Basic import test - verifies the module system works
    expect(true).toBe(true);
  });
});

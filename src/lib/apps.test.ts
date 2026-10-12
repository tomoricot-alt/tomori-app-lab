import { describe, expect, it } from 'vitest';
import { apps } from '../data/apps';
import { findApp, validateApps } from './apps';

describe('apps data', () => {
  it('has no validation errors', () => {
    expect(validateApps(apps)).toEqual([]);
  });
  it('registers APP 001-003 with correct URLs', () => {
    expect(findApp('001')?.name).toBe('TOMORI FOCUS');
    expect(findApp('002')?.appUrl).toBe('https://tomoricot-alt.github.io/tomori-idea-002/');
    expect(findApp('003')?.usageSteps).toHaveLength(5);
    expect(findApp('999')).toBeUndefined();
  });
});

/**
 * Immutable shallow merge
 * @private
 */
export const shallowMerge = <T>(obj: T, ...overrides: Partial<T>[]): T => {
  return Object.assign(Object.create(null), obj, ...overrides);
};

export const measure_execution_time = async (fn: Function, ...args: any[]): Promise<number> => {
  const start = Date.now();
  await fn(...args);
  const end = Date.now();
  return end - start;
};

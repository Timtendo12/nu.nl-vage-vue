/**
 * Sanitises an object by removing null and undefined values.
 *
 * @param obj - The object to be sanitised.
 * @returns A new object with only the non-null and non-undefined values from the original object.
 * @template T - The type of the object.
 */
export default <T>(obj: T): Partial<T> => {
  const newObj: Partial<T> = {};
  for (const key in obj) {
    if (obj[key] !== null && obj[key] !== undefined) {
      newObj[key] = obj[key];
    }
  }
  return newObj;
};

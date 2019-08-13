export const addItemToIndex = (array, index, item) => [...array.slice(0, index), item, ...array.slice(index)];
export const removeItemByIndex = (array, index) => [...array.slice(0, index), ...array.slice(index + 1)];
export const replaceItemOnIndex = (array, index, item) => [...array.slice(0, index), item, ...array.slice(index + 1)];
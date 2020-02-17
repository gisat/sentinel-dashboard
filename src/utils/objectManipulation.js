export const removeItemByKey = (object, key) => {
	const {[key]: value, ...withoutKey} = object;
	return withoutKey;
};
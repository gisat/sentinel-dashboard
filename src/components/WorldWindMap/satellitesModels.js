const modelsCache = new Map();

export const getModel = (path, key) => {
	const loader = new Promise((resolve,reject) => {
		const cached = modelsCache.has(key);
		if(cached) {
			resolve(modelsCache.get(key))
		} else {
			fetch(path).then(response => {
				return response.json();
			}).then((model) => {
				model.key = key;
				resolve(model);
			});
		}
	});
	return loader;
}
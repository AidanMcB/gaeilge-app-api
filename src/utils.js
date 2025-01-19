const snakeToCamel = str =>
    str.toLowerCase().replace(/([-_][a-z])/g, group =>
      group
        .toUpperCase()
        .replace('-', '')
        .replace('_', '')
);

const normalizeFromDb = (obj) => {
    const newObj = {};
    Object.keys(obj).forEach((key) => {
        newObj[snakeToCamel(key)] = obj[key]
    });
    return newObj;
}

module.exports = {
    normalizeFromDb,
    snakeToCamel
}
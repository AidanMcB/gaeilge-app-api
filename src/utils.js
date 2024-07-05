const snakeToCamel = str =>
    str.toLowerCase().replace(/([-_][a-z])/g, group =>
      group
        .toUpperCase()
        .replace('-', '')
        .replace('_', '')
);

const regularizeDbObject = (obj) => {
    const newObj = {};
    Object.keys(obj).forEach((key) => {
        newObj[snakeToCamel(key)] = obj[key]
    });
    return newObj;
}

module.exports = {
    regularizeDbObject,
    snakeToCamel
}
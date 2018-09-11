const storage = localStorage;
const key = "socsim";
const saltLength = 7;
const compress = btoa;
const uncompress = atob;

/**
 * Draw a random salt
 * @param {Number} length -
 * @return {String}
 */
function getSalt (length) {
    return Math.random().toString(36).slice(-length);
}

/**
 * @param {*} data -
 */
export const store = (data) => {
    const str = compress(getSalt(saltLength) + compress(JSON.stringify(data)));
    storage.setItem(key, str);
};

/**
 * @return {*}
 */
export const load = () => {
    const item = storage.getItem(key);
    if (!item) {
        return {};
    }

    const str = uncompress(uncompress(item).slice(saltLength));
    return JSON.parse(str);
};

export const clear = () => {
    storage.removeItem(key);
};

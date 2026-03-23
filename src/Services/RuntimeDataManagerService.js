const data = {};

const add = (k, v) => { data[k] = v };

const remove = (k) => { delete data[k] };

const get = (k) => data[k];

const RuntimeDataManagerService = { add, remove, get };
export default RuntimeDataManagerService;
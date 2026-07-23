export const buildFilter = (allowedFields = [], query = {}) => {
    const filter = {};

    for (const field of allowedFields) {
        if (query[field] !== undefined && query[field] !== null && query[field] !== "") {
            filter[field] = query[field];
        }
    }

    return filter;
};
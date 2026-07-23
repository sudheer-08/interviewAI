export const buildSortOrder = (allowedFields = [], sortBy = "createdAt", sortOrder = "desc") => {
    const field = allowedFields.includes(sortBy) ? sortBy : "createdAt";
    const direction = String(sortOrder).toLowerCase() === "asc" ? "asc" : "desc";

    return { [field]: direction };
};
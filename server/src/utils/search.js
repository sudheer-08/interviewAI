export const buildSearchFilter = (fields = [], search) => {
    const term = String(search || "").trim();

    if (!term) {
        return {};
    }

    return {
        OR: fields.map((field) => ({
            [field]: {
                contains: term,
                mode: "insensitive",
            },
        })),
    };
};
export const getSort = (sortQuery = "") => {
  if (!sortQuery) return { createdAt: -1 };

  const [field, order] = sortQuery.split("_");

  return { [field]: order === "asc" ? 1 : -1 };
};

export const getPagination = (req) => {
  let { page = 1, limit = 10 } = req.query;

  page = parseInt(page);
  limit = parseInt(limit);

  if (page < 1) page = 1;
  if (limit < 1 || limit > 100) limit = 10;

  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

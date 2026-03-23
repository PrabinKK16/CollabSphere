export const buildWorkspaceQuery = (req, userId) => {
  const { search = "", role, status } = req.query;

  const query = {
    isArchived: false,
    members: {
      $elemMatch: {
        user: userId,
        status: "accepted",
      },
    },
  };

  if (search.trim()) {
    query.$or = [
      { name: { $regex: search.trim(), $options: "i" } },
      { description: { $regex: search.trim(), $options: "i" } },
    ];
  }

  if (role) {
    query.members.$elemMatch.role = role;
  }

  if (status) {
    query.members.$elemMatch.status = status;
  }

  return query;
};

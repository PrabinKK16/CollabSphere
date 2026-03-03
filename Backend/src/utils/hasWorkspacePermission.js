export const hasWorkspacePermission = (
  workspace,
  userId,
  allowedRoles = []
) => {
  if (!workspace || !userId) return false;

  const member = workspace.members.find(
    (m) => m.user.toString() === userId.toString()
  );

  if (!member) return false;

  return allowedRoles.includes(member.role);
};

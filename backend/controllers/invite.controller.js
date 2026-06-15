import Invite from '../models/Invite.js';
import WorkspaceMember from '../models/WorkspaceMember.js';
import Workspace from '../models/Workspace.js';
import User from '../models/User.js';
import { sendWorkspaceInviteEmail } from '../utils/email.js';
import { logActivity } from '../services/activity.service.js';

const createInvite = async (req, res) => {
  try {
    const { workspaceId, emails, role } = req.body;

    if (!['owner', 'admin', 'manager'].includes(req.userRole)) {
      return res.status(403).json({ success: false, message: 'Insufficient permissions to invite members' });
    }

    const workspace = await Workspace.findById(workspaceId);
    const results = [];

    for (const email of emails) {
      const existingUser = await User.findOne({ email });
      
      if (existingUser) {
        const alreadyMember = await WorkspaceMember.findOne({ workspace: workspaceId, user: existingUser._id, isActive: true });
        if (alreadyMember) {
          results.push({ email, status: 'already_member' });
          continue;
        }
      }

      const existingInvite = await Invite.findOne({ workspace: workspaceId, email, status: 'pending' });
      if (existingInvite) {
        results.push({ email, status: 'already_invited' });
        continue;
      }

      const invite = await Invite.create({
        workspace: workspaceId,
        email,
        role: role || 'member',
        invitedBy: req.user._id
      });

      try {
        await sendWorkspaceInviteEmail(req.user.fullName, email, workspace.name, invite.token);
      } catch (emailError) {
        console.error('Invite email failed:', emailError.message);
      }

      results.push({ email, status: 'invited', inviteId: invite._id });
    }

    await logActivity({
      actor: req.user._id,
      action: 'member_added',
      description: `Invited ${emails.length} member(s) to workspace`,
      workspace: workspaceId,
      req
    });

    res.json({ success: true, data: { results } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const acceptInvite = async (req, res) => {
  try {
    const invite = await Invite.findOne({ token: req.params.token, status: 'pending' });

    if (!invite || invite.expiresAt < new Date()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired invitation' });
    }

    if (invite.email !== req.user.email) {
      return res.status(403).json({ success: false, message: 'This invitation was not sent to your email' });
    }

    const alreadyMember = await WorkspaceMember.findOne({ workspace: invite.workspace, user: req.user._id, isActive: true });
    if (!alreadyMember) {
      await WorkspaceMember.create({
        workspace: invite.workspace,
        user: req.user._id,
        role: invite.role,
        invitedBy: invite.invitedBy
      });
    }

    invite.status = 'accepted';
    invite.acceptedAt = new Date();
    await invite.save();

    const workspace = await Workspace.findById(invite.workspace);

    res.json({ success: true, message: 'Invitation accepted', data: { workspaceId: invite.workspace, workspace } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getInviteInfo = async (req, res) => {
  try {
    const invite = await Invite.findOne({ token: req.params.token })
      .populate('workspace', 'name logo description')
      .populate('invitedBy', 'fullName avatar');

    if (!invite) return res.status(404).json({ success: false, message: 'Invitation not found' });

    if (invite.status !== 'pending' || invite.expiresAt < new Date()) {
      return res.status(400).json({ success: false, message: 'This invitation has expired or been used' });
    }

    res.json({ success: true, data: { invite } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export { createInvite, acceptInvite, getInviteInfo };

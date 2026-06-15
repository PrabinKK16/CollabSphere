import nodemailer from 'nodemailer';

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

const sendEmail = async ({ to, subject, html, text }) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to,
    subject,
    html,
    text
  };

  return transporter.sendMail(mailOptions);
};

const sendVerificationEmail = async (user, token) => {
  const url = `${process.env.CLIENT_URL}/verify-email/${token}`;
  const html = `
    <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #059669, #0D9488); padding: 40px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">CollabSphere</h1>
        <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0;">Where Teams Build Together</p>
      </div>
      <div style="background: #f9fafb; padding: 40px; border-radius: 0 0 12px 12px;">
        <h2 style="color: #111827; margin-top: 0;">Verify Your Email</h2>
        <p style="color: #6b7280;">Hi ${user.fullName}, please verify your email address to complete your registration.</p>
        <a href="${url}" style="display: inline-block; background: linear-gradient(135deg, #059669, #0D9488); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; margin: 20px 0;">Verify Email Address</a>
        <p style="color: #9ca3af; font-size: 14px;">This link expires in 24 hours. If you didn't create an account, please ignore this email.</p>
      </div>
    </div>
  `;
  return sendEmail({ to: user.email, subject: 'Verify your CollabSphere account', html });
};

const sendPasswordResetEmail = async (user, token) => {
  const url = `${process.env.CLIENT_URL}/reset-password/${token}`;
  const html = `
    <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #059669, #0D9488); padding: 40px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">CollabSphere</h1>
      </div>
      <div style="background: #f9fafb; padding: 40px; border-radius: 0 0 12px 12px;">
        <h2 style="color: #111827; margin-top: 0;">Reset Your Password</h2>
        <p style="color: #6b7280;">Hi ${user.fullName}, you requested a password reset for your CollabSphere account.</p>
        <a href="${url}" style="display: inline-block; background: linear-gradient(135deg, #059669, #0D9488); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; margin: 20px 0;">Reset Password</a>
        <p style="color: #9ca3af; font-size: 14px;">This link expires in 1 hour. If you didn't request this, please ignore this email.</p>
      </div>
    </div>
  `;
  return sendEmail({ to: user.email, subject: 'Reset your CollabSphere password', html });
};

const sendWorkspaceInviteEmail = async (inviterName, inviteeEmail, workspaceName, inviteToken) => {
  const url = `${process.env.CLIENT_URL}/invites/${inviteToken}`;
  const html = `
    <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #059669, #0D9488); padding: 40px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">CollabSphere</h1>
      </div>
      <div style="background: #f9fafb; padding: 40px; border-radius: 0 0 12px 12px;">
        <h2 style="color: #111827; margin-top: 0;">You've Been Invited!</h2>
        <p style="color: #6b7280;"><strong>${inviterName}</strong> has invited you to join <strong>${workspaceName}</strong> on CollabSphere.</p>
        <a href="${url}" style="display: inline-block; background: linear-gradient(135deg, #059669, #0D9488); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; margin: 20px 0;">Accept Invitation</a>
        <p style="color: #9ca3af; font-size: 14px;">This invitation expires in 7 days.</p>
      </div>
    </div>
  `;
  return sendEmail({ to: inviteeEmail, subject: `You've been invited to ${workspaceName} on CollabSphere`, html });
};

export { sendEmail, sendVerificationEmail, sendPasswordResetEmail, sendWorkspaceInviteEmail };

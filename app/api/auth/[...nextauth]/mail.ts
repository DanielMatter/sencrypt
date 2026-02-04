import { SendVerificationRequestParams } from "next-auth/providers/email";
import nodemailer from 'nodemailer';
import SMTPTransport from "nodemailer/lib/smtp-transport";

const port = parseInt(process.env.EMAIL_SERVER_PORT || '465');

const transporterConfig: SMTPTransport.Options = {
    host: process.env.EMAIL_SERVER_HOST,
    port,
    secure: port === 465, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
    },
};

const transporter = nodemailer.createTransport(transporterConfig);

export async function sendVerificationRequest(params: SendVerificationRequestParams) {
    const { identifier: email, url, provider, theme } = params;
    const { host } = new URL(url);

    const result = await transporter.sendMail({
        to: email,
        from: process.env.EMAIL_FROM,
        subject: `Sign in to Sencrypt`,
        text: text({ url, host }),
        html: html({ url, host, theme }),
    });

    const failed = result.rejected.concat(result.pending).filter(Boolean);
    if (failed.length) {
        throw new Error(`Email(s) (${failed.join(", ")}) could not be sent`);
    }
}

/**
 * Email HTML body
 * Insert invisible space into domains from being turned into a hyperlink by email
 * clients like Outlook and Apple mail, as this is confusing because it seems
 * like they are supposed to click on it to sign in.
 *
 * @note We shouldn't add the space into the actual URL that links to the site.
 */
function html(params: { url: string; host: string; theme: any }) {
    const { url, host } = params;

    const escapedHost = host.replace(/\./g, "&#8203;.");

    const brandColor = "#6366f1"; // Indigo-500
    const color = {
        background: "#09090b", // Zinc-950
        text: "#fafafa",       // Zinc-50
        textMuted: "#a1a1aa",  // Zinc-400
        border: "rgba(255, 255, 255, 0.1)",
        cardBg: "rgba(255, 255, 255, 0.05)",
        buttonBg: brandColor,
        buttonText: "#ffffff",
    };

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Sign In to Sencrypt</title>
</head>
<body style="background-color: ${color.background}; color: ${color.text}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 40px 20px;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center">
        <div style="max-width: 600px; margin: 0 auto;">
          <!-- Header/Logo -->
          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 32px;">
            <tr>
              <td align="center">
                 <h1 style="color: ${brandColor}; font-size: 28px; font-weight: 800; letter-spacing: -0.025em; margin: 0;">Sencrypt</h1>
              </td>
            </tr>
          </table>

          <!-- Card -->
          <div style="background: ${color.cardBg}; border: 1px solid ${color.border}; border-radius: 24px; padding: 40px; text-align: center; backdrop-filter: blur(10px);">
            <h2 style="font-size: 24px; font-weight: 600; margin: 0 0 16px 0; color: #ffffff;">Sign in to Sencrypt</h2>
            <p style="font-size: 16px; line-height: 1.6; color: ${color.textMuted}; margin: 0 0 32px 0;">
              You requested a magic link to sign in to your account.<br/>Click the button below to satisfy your security requirements.
            </p>
            
            <a href="${url}" target="_blank" style="display: inline-block; background-color: ${color.buttonBg}; color: ${color.buttonText}; padding: 14px 32px; border-radius: 9999px; text-decoration: none; font-weight: 600; font-size: 15px; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3); transition: all 0.2s;">
              Sign in to Sencrypt
            </a>
            
            <p style="font-size: 13px; color: ${color.textMuted}; margin-top: 32px; opacity: 0.7;">
              If you didn't request this email, you can safely ignore it.
            </p>
          </div>

          <!-- Footer -->
          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 32px;">
            <tr>
              <td align="center" style="color: #52525b; font-size: 12px;">
                <p style="margin: 0;">Secure File Transfer, Reimagined.</p>
                <p style="margin: 8px 0 0 0;">${escapedHost}</p>
              </td>
            </tr>
          </table>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

/** Email Text body (fallback for email clients that don't allow HTML) */
function text({ url, host }: { url: string; host: string }) {
    return `Sign in to ${host}\n${url}\n\n`;
}

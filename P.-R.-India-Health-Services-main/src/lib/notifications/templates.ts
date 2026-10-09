import type { NotificationEventType, RenderedMessage, TemplateContext } from "./types";

/**
 * Builds a clean, responsive, healthcare-appropriate HTML email template.
 * Strictly adheres to healthcare privacy principles (no clinical data).
 */
function buildHealthcareEmailHtml(options: {
  subject: string;
  greeting: string;
  bodyText: string;
  referenceId?: string | null | undefined;
  eventTitle: string;
}): string {
  const { subject, greeting, bodyText, referenceId, eventTitle } = options;

  const refBlock = referenceId
    ? `
      <div style="background-color: #F1F5F9; border-left: 4px solid #0D9488; padding: 12px 16px; margin: 20px 0; border-radius: 4px;">
        <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #475569; display: block;">Service Request Reference</span>
        <span style="font-size: 15px; font-weight: 600; color: #0F172A; font-family: monospace;">${referenceId}</span>
      </div>
    `
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1E293B; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #F8FAFC; padding: 32px 16px;">
    <tr>
      <td align="center">
        <!-- Main Email Container -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 580px; background-color: #FFFFFF; border-radius: 12px; border: 1px solid #E2E8F0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <!-- Header Bar -->
          <tr>
            <td style="background-color: #0B2545; padding: 24px 32px; border-bottom: 3px solid #14B8A6;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <h1 style="margin: 0; font-size: 20px; font-weight: 700; color: #FFFFFF; letter-spacing: -0.3px;">
                      P. R. India Health Services
                    </h1>
                    <p style="margin: 4px 0 0 0; font-size: 12px; font-weight: 500; color: #94A3B8; text-transform: uppercase; letter-spacing: 1px;">
                      Home Healthcare & Clinical Support
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content Body -->
          <tr>
            <td style="padding: 32px;">
              <div style="display: inline-block; background-color: #F0FDFA; border: 1px solid #CCFBF1; border-radius: 20px; padding: 4px 12px; font-size: 11px; font-weight: 600; color: #0D9488; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 16px;">
                ${eventTitle}
              </div>

              <h2 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 700; color: #0F172A; line-height: 1.4;">
                ${subject}
              </h2>

              <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.6; color: #334155;">
                ${greeting ? `<strong>${greeting}</strong><br><br>` : ""}${bodyText}
              </p>

              ${refBlock}

              <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid #E2E8F0; font-size: 12px; line-height: 1.5; color: #64748B;">
                <p style="margin: 0 0 4px 0;"><strong>Need immediate coordination assistance?</strong></p>
                <p style="margin: 0;">Our care team is on standby to assist you. Contact us via our official support channels or reply through your coordinator.</p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #F8FAFC; padding: 20px 32px; border-top: 1px solid #E2E8F0; text-align: center; font-size: 11px; color: #94A3B8; line-height: 1.5;">
              <p style="margin: 0 0 4px 0; font-weight: 600; color: #64748B;">P. R. India Health Services — Confidential Operational Notification</p>
              <p style="margin: 0;">This automated message contains operational dispatch details. Personal health and medical records remain securely protected.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Privacy-safe notification template generator.
 * Strict Rule: Contains NO clinical notes, diagnosis, or sensitive medical histories.
 * Generates both plain-text message and branded responsive HTML email.
 */
export function renderNotificationTemplate(
  eventType: NotificationEventType,
  context: TemplateContext = {},
): RenderedMessage {
  const greeting = context.recipientName ? `Dear ${context.recipientName},` : "";
  const refSuffix = context.referenceId ? ` (Ref: ${context.referenceId})` : "";

  let subject = "";
  let bodyText = "";
  let eventTitle = "";

  switch (eventType) {
    // --------------------------------------------------------------------------
    // Patient Notification Templates
    // --------------------------------------------------------------------------
    case "request_received":
      subject = "Home Healthcare Service Request Received";
      eventTitle = "Service Request Confirmation";
      bodyText = `Your home healthcare service request${refSuffix} has been received. Our coordination team will review the request and contact you regarding the next steps.`;
      break;

    case "request_under_review":
      subject = "Service Request Under Clinical Review";
      eventTitle = "Clinical Review in Progress";
      bodyText = `Your service request${refSuffix} is currently being reviewed by our care coordination team to prepare required resources.`;
      break;

    case "request_contacted":
      subject = "Care Coordination Update";
      eventTitle = "Care Coordinator Assigned";
      bodyText = `Our care coordinator has initiated contact regarding your service request${refSuffix}. We will assist you with scheduling and preparation.`;
      break;

    case "request_scheduled":
      subject = "Home Healthcare Service Scheduled";
      eventTitle = "Deployment Scheduled";
      bodyText = `Your requested healthcare service${refSuffix} has been scheduled. Our team will coordinate deployment and setup as agreed.`;
      break;

    // --------------------------------------------------------------------------
    // Professional Notification Templates
    // --------------------------------------------------------------------------
    case "professional_assigned":
      subject = "New Service Request Deployment Assignment";
      eventTitle = "Deployment Assignment";
      bodyText = `You have been assigned to an active home-care service deployment${refSuffix}. Please review deployment instructions with your coordinator.`;
      break;

    case "professional_released":
      subject = "Service Request Deployment Concluded";
      eventTitle = "Assignment Concluded";
      bodyText = `Your assignment for service request${refSuffix} has concluded and your network status remains verified for future deployments.`;
      break;

    // --------------------------------------------------------------------------
    // Admin Notification Templates
    // --------------------------------------------------------------------------
    case "new_service_request":
      subject = "New Service Request Submitted";
      eventTitle = "Admin Alert: New Request";
      bodyText = `A new patient service inquiry${refSuffix} has been submitted and is awaiting administrative review.`;
      break;

    case "new_team_registration":
      subject = "New Healthcare Professional Registration";
      eventTitle = "Admin Alert: Team Application";
      bodyText = `A new candidate application has been submitted to join the care network (${context.recipientName || "Candidate"} - ${context.profession || "Healthcare Professional"}).`;
      break;

    case "new_contact_message":
      subject = "New Contact Message Received";
      eventTitle = "Admin Alert: Contact Message";
      bodyText = `A new inquiry message has been submitted via the public contact form from ${context.recipientName || "Visitor"}.`;
      break;

    default:
      subject = "P. R. India Health Services Notification";
      eventTitle = "Operational Notification";
      bodyText = `You have a new operational update regarding your healthcare service inquiry.`;
      break;
  }

  const plainMessage = greeting ? `${greeting} ${bodyText}` : bodyText;

  const htmlMessage = buildHealthcareEmailHtml({
    subject,
    greeting,
    bodyText,
    referenceId: context.referenceId,
    eventTitle,
  });

  return {
    subject,
    message: plainMessage,
    html: htmlMessage,
  };
}

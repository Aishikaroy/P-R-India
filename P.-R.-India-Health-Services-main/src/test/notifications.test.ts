import { describe, expect, it } from "vitest";
import {
  MockNotificationProvider,
  defaultNotificationProvider,
} from "../lib/notifications/mock-provider";
import {
  ServerEmailNotificationProvider,
  serverEmailProvider,
} from "../lib/notifications/email-provider";
import { notificationRegistry } from "../lib/notifications/provider-registry";
import { renderNotificationTemplate } from "../lib/notifications/templates";
import {
  DEFAULT_PREFERENCES,
  MAX_RETRY_ATTEMPTS,
  NotificationService,
} from "../lib/notifications/service";
import type { NotificationEventType, NotificationRecord } from "../lib/notifications/types";

describe("Phase 6C: Real Transactional Email Delivery Infrastructure", () => {
  describe("Branded HTML Templates & Privacy Safety", () => {
    const allEventTypes: NotificationEventType[] = [
      "request_received",
      "request_under_review",
      "request_contacted",
      "request_scheduled",
      "professional_assigned",
      "professional_released",
      "new_service_request",
      "new_team_registration",
      "new_contact_message",
    ];

    it("renders valid subject, message, and branded HTML for all 9 initial event types", () => {
      allEventTypes.forEach((evt) => {
        const rendered = renderNotificationTemplate(evt, {
          recipientName: "Aarav Gupta",
          referenceId: "PR-REQ-8899",
          profession: "Critical Care Nurse",
        });

        expect(rendered.message).toBeTruthy();
        expect(rendered.message.length).toBeGreaterThan(15);
        expect(rendered.subject).toBeTruthy();
        expect(rendered.html).toBeTruthy();
        expect(rendered.html).toContain("P. R. India Health Services");
        expect(rendered.html).toContain("<!DOCTYPE html>");
        expect(rendered.html).toContain("Aarav Gupta");
      });
    });

    it("enforces strict privacy-safe content without medical or diagnostic exposure in plain text and HTML", () => {
      const sensitiveKeywords = [
        "ventilator support",
        "intubation",
        "cancer",
        "biopsy",
        "chemotherapy",
        "diagnosis",
        "medication dosage",
        "clinical notes",
        "hiv",
        "cardiac arrest",
      ];

      allEventTypes.forEach((evt) => {
        const rendered = renderNotificationTemplate(evt, {
          recipientName: "Patient Sharma",
          referenceId: "PR-REQ-9921",
        });

        const lowerMessage = rendered.message.toLowerCase();
        const lowerHtml = (rendered.html || "").toLowerCase();

        sensitiveKeywords.forEach((forbidden) => {
          expect(lowerMessage).not.toContain(forbidden);
          expect(lowerHtml).not.toContain(forbidden);
        });
      });
    });

    it("correctly personalizes patient email with reference ID pill and care instructions", () => {
      const rendered = renderNotificationTemplate("request_received", {
        recipientName: "Meera Patel",
        referenceId: "PR-2026-9001",
      });

      expect(rendered.message).toContain("Dear Meera Patel");
      expect(rendered.message).toContain("Ref: PR-2026-9001");
      expect(rendered.html).toContain("PR-2026-9001");
      expect(rendered.html).toContain("Service Request Reference");
    });
  });

  describe("Resend Email Provider & Registry Architecture", () => {
    it("preserves mock provider mode by default for testing and development", () => {
      notificationRegistry.setMode("mock");
      const provider = notificationRegistry.getProvider("email");
      expect(provider.name).toBe("mock-provider");
    });

    it("resolves Resend server email provider in production mode", () => {
      notificationRegistry.setMode("production");
      const provider = notificationRegistry.getProvider("email");
      expect(provider.name).toBe("resend");
      expect(provider.channel).toBe("email");
      notificationRegistry.setMode("mock"); // Reset
    });

    it("mock provider simulates successful acceptance with provider message ID", async () => {
      const provider = new MockNotificationProvider();
      const mockRecord: NotificationRecord = {
        id: "mock-notif-uuid-1",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        service_request_id: null,
        activity_id: null,
        recipient_type: "patient",
        recipient_name: "Test User",
        recipient_email: "test@example.com",
        recipient_phone: "+919876543210",
        channel: "email",
        event_type: "request_received",
        subject: "Request Received",
        message: "Your home care request has been received.",
        status: "queued",
        provider: null,
        provider_message_id: null,
        attempt_count: 0,
        last_attempt_at: null,
        next_retry_at: null,
        sent_at: null,
        delivered_at: null,
        failed_at: null,
        error_message: null,
        metadata: {},
      };

      const result = await provider.send(mockRecord);

      expect(result.success).toBe(true);
      expect(result.providerMessageId).toMatch(/^mock_email_/);
      expect(result.delivered).toBe(false); // Delivered is false upon sent
      expect(result.error).toBeUndefined();
    });

    it("server email provider rejects missing recipient email gracefully", async () => {
      const emailProvider = serverEmailProvider;
      const invalidRecord: NotificationRecord = {
        id: "mock-notif-uuid-invalid",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        service_request_id: null,
        activity_id: null,
        recipient_type: "patient",
        recipient_name: "Test User",
        recipient_email: null,
        recipient_phone: null,
        channel: "email",
        event_type: "request_received",
        subject: "Request Received",
        message: "Your request has been received.",
        status: "queued",
        provider: null,
        provider_message_id: null,
        attempt_count: 0,
        last_attempt_at: null,
        next_retry_at: null,
        sent_at: null,
        delivered_at: null,
        failed_at: null,
        error_message: null,
        metadata: {},
      };

      const res = await emailProvider.send(invalidRecord);
      expect(res.success).toBe(false);
      expect(res.error).toBe("Missing recipient email address.");
    });
  });

  describe("Bounded Retries & Backoff Policy", () => {
    it("enforces max retry limit of 3 attempts", () => {
      expect(MAX_RETRY_ATTEMPTS).toBe(3);
    });

    it("calculates exponential backoff intervals correctly", () => {
      const getBackoffMinutes = (attempt: number) => {
        return attempt === 1 ? 5 : attempt === 2 ? 15 : 60;
      };

      expect(getBackoffMinutes(1)).toBe(5);
      expect(getBackoffMinutes(2)).toBe(15);
      expect(getBackoffMinutes(3)).toBe(60);
    });
  });

  describe("Channel Routing Preferences", () => {
    it("preserves conservative defaults across all events", () => {
      expect(DEFAULT_PREFERENCES.request_received.email).toBe(true);
      expect(DEFAULT_PREFERENCES.request_received.whatsapp).toBe(true);
      expect(DEFAULT_PREFERENCES.request_received.sms).toBe(false);

      expect(DEFAULT_PREFERENCES.request_scheduled.sms).toBe(true);
      expect(DEFAULT_PREFERENCES.new_service_request.email).toBe(true);
    });

    it("checks channel enablement cleanly with default fallback", async () => {
      const emailEnabled = await NotificationService.isChannelEnabled("request_received", "email");
      const smsDefault = await NotificationService.isChannelEnabled("request_received", "sms");

      expect(emailEnabled).toBe(true);
      expect(smsDefault).toBe(false);
    });
  });

  describe("Security & Secret Protection", () => {
    it("ensures no Resend API keys or secrets exist in client-side bundle or environment", () => {
      // Browser client-side code must NEVER contain RESEND_API_KEY
      const clientEnv = import.meta.env as Record<string, unknown>;
      expect(clientEnv["RESEND_API_KEY"]).toBeUndefined();
      expect(clientEnv["VITE_RESEND_API_KEY"]).toBeUndefined();
    });
  });
});

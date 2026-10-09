import type { NotificationProvider, NotificationRecord, ProviderSendResult } from "./types";

/**
 * Mock Notification Provider.
 * Safely simulates delivery without transmitting any real WhatsApp, SMS, or Email messages.
 */
export class MockNotificationProvider implements NotificationProvider {
  public readonly name = "mock-provider";
  public readonly channel = "multi" as const;

  public async send(notification: NotificationRecord): Promise<ProviderSendResult> {
    // Simulate slight asynchronous network tick
    await new Promise((resolve) => setTimeout(resolve, 50));

    // Optional simulation hook for testing failures
    const meta = (notification.metadata as Record<string, unknown>) || {};
    if (meta["simulate_failure"] === true) {
      return {
        success: false,
        error: "Simulated mock provider transmission failure.",
      };
    }

    const mockId = `mock_${notification.channel}_${Math.random().toString(36).substring(2, 10)}`;

    return {
      success: true,
      providerMessageId: mockId,
      delivered: meta["simulate_delivered"] === true,
    };
  }
}

export const defaultNotificationProvider = new MockNotificationProvider();

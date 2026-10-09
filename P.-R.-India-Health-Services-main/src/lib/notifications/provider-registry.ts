import { defaultNotificationProvider, MockNotificationProvider } from "./mock-provider";
import { serverEmailProvider } from "./email-provider";
import type { NotificationChannel, NotificationProvider } from "./types";

export type ProviderMode = "mock" | "production";

class ProviderRegistry {
  private mode: ProviderMode = "mock";
  private providers: Map<NotificationChannel, NotificationProvider> = new Map();
  private mockProvider: NotificationProvider = defaultNotificationProvider;

  constructor() {
    // Register default production adapters
    this.providers.set("email", serverEmailProvider);
    // WhatsApp and SMS adapters will be registered in future phases
  }

  public setMode(mode: ProviderMode) {
    this.mode = mode;
  }

  public getMode(): ProviderMode {
    return this.mode;
  }

  public registerProvider(channel: NotificationChannel, provider: NotificationProvider) {
    this.providers.set(channel, provider);
  }

  public getProvider(channel: NotificationChannel): NotificationProvider {
    if (this.mode === "mock") {
      return this.mockProvider;
    }

    const provider = this.providers.get(channel);
    return provider || this.mockProvider;
  }

  public createMockProvider(): NotificationProvider {
    return new MockNotificationProvider();
  }
}

export const notificationRegistry = new ProviderRegistry();

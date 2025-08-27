"use client";

import mixpanel from "mixpanel-browser";

const MIXPANEL_TOKEN: string = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN || "";

export function initMixpanel(): void {
  if (typeof window !== "undefined" && MIXPANEL_TOKEN) {
    mixpanel.init(MIXPANEL_TOKEN, {
      debug: process.env.NODE_ENV === 'development',
    });
  }
}

export function trackEvent(eventName: string, properties?: Record<string, unknown>): void {
  try {
    if (typeof window !== 'undefined' && mixpanel) {
      mixpanel.track(eventName, properties);
    }
  } catch (error) {
    console.error('Mixpanel tracking failed:', error);
  }
}

export function identifyUser(userId: string): void {
  if (typeof window !== "undefined" && MIXPANEL_TOKEN) {
    mixpanel.identify(userId);
  }
}

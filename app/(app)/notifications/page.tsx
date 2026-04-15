"use client";

import { TelegramConnect } from "@/components/notifications/TelegramConnect";

export default function NotificationsPage() {
  return (
    <div className="mx-auto max-w-[720px] space-y-6">
      <div>
        <h1 className="font-display text-[32px] leading-none text-text-primary">
          Notifications
        </h1>
        <p className="mt-1 text-small text-text-muted">
          Pings from Coven when you're not on the page.
        </p>
      </div>

      <TelegramConnect />
    </div>
  );
}

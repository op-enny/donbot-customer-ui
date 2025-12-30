import { VerticalProvider } from "@/contexts/vertical-context";
import { EatHeader } from "@/components/eat/EatHeader";
import { EatBottomNav } from "@/components/eat/EatBottomNav";
import { OrderStatusWatcher } from "@/components/shared/OrderStatusWatcher";
import { VerticalTracker } from "@/components/shared/VerticalTracker";

export default function EatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <VerticalProvider vertical="eat">
      <div className="min-h-screen bg-background eat-theme">
        <VerticalTracker vertical="eat" />
        <OrderStatusWatcher vertical="eat" />
        <EatHeader />
        <main className="pb-24">{children}</main>
        <EatBottomNav />
      </div>
    </VerticalProvider>
  );
}

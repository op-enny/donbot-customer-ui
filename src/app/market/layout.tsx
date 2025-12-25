import { VerticalProvider } from "@/contexts/vertical-context";
import { MarketHeader } from "@/components/market/MarketHeader";
import { MarketBottomNav } from "@/components/market/MarketBottomNav";
import { OrderStatusWatcher } from "@/components/shared/OrderStatusWatcher";

export default function MarketLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <VerticalProvider vertical="market">
      <div className="min-h-screen bg-background market-theme">
        <OrderStatusWatcher vertical="market" />
        <MarketHeader />
        <main className="pb-24">{children}</main>
        <MarketBottomNav />
      </div>
    </VerticalProvider>
  );
}

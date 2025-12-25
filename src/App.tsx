import { useState } from "react";
import { AppLayout } from "./layouts/AppLayout";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { PortList } from "./components/PortList";

import { Toaster } from "sonner";

function App() {
  const [status] = useState<"idle" | "active">("active");

  const handleRefresh = () => {
    // Mock refresh logic
    console.log("Refreshing...");
  };

  const handleOpenSettings = () => {
    console.log("Open settings");
  };

  return (
    <AppLayout>
      <Toaster theme="dark" position="bottom-center" toastOptions={{
        style: { background: '#18181b', border: '1px solid #27272a', color: '#fafafa' },
        className: 'text-xs'
      }} />
      <Header status={status} onRefresh={handleRefresh} />

      <PortList />

      <Footer onOpenSettings={handleOpenSettings} />
    </AppLayout>
  );
}

export default App;

import Layout from "@/components/Layout";
import MultiCameraGrid from "@/components/MultiCameraGrid";
import QuickActionsPanel from "@/components/QuickActionsPanel";
import LiveActivityFeed from "@/components/LiveActivityFeed";

const Index = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <MultiCameraGrid />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <QuickActionsPanel />
          <LiveActivityFeed />
        </div>
      </div>
    </Layout>
  );
};

export default Index;

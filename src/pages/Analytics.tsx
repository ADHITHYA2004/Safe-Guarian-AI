import ThreatAnalytics from "@/components/ThreatAnalytics";

const Analytics = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Threat Analytics</h1>
        <p className="text-muted-foreground">Monitor patterns and trends in security alerts</p>
      </div>
      <ThreatAnalytics />
    </div>
  );
};

export default Analytics;

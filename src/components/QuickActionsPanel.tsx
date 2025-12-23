import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, ShieldAlert, FileText, Download, Bell, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { authApi, emergencyApi, alertsApi } from "@/lib/api";

const QuickActionsPanel = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  const handleEmergencyCall = async () => {
    setLoading("emergency");
    try {
      const data = await emergencyApi.send({
        location: "Quick Action - Manual Alert",
        alertType: "Manual Emergency Alert"
      });

      toast({
        title: "🚨 Emergency Alert Sent",
        description: data.message || "All emergency contacts have been notified",
      });
    } catch (error: any) {
      toast({
        title: "Alert Failed",
        description: error.message || "Failed to send emergency alert",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  const handleCallPolice = () => {
    window.open("tel:911", "_self");
    toast({
      title: "Calling Emergency Services",
      description: "Dialing 911...",
    });
  };

  const handleGenerateReport = async () => {
    setLoading("report");
    try {
      const alerts = await alertsApi.getAll(50);

      if (alerts) {
        const csvContent = [
          ["Date", "Status", "Location", "Description", "Confidence", "Action Taken"].join(","),
          ...alerts.map(a => [
            new Date(a.created_at).toLocaleString(),
            a.status,
            a.location,
            `"${a.description}"`,
            a.confidence + "%",
            `"${a.action_taken}"`
          ].join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `security-report-${new Date().toISOString().split("T")[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);

        toast({
          title: "Report Generated",
          description: "Security report has been downloaded",
        });
      }
    } catch (error: any) {
      toast({
        title: "Export Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  const handleTestAlert = async () => {
    setLoading("test");
    try {
      const { session } = await authApi.getSession();
      if (!session) throw new Error("Not authenticated");

      await alertsApi.create({
        alert_type: "test",
        status: "safe",
        description: "System Test - All systems operational",
        location: "System Test",
        action_taken: "Test alert generated",
        confidence: 100,
        contacts_notified: [],
      });

      toast({
        title: "✅ Test Successful",
        description: "Alert system is functioning properly",
      });
    } catch (error: any) {
      toast({
        title: "Test Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <Button
            onClick={handleEmergencyCall}
            disabled={loading === "emergency"}
            className="bg-danger hover:bg-danger/90 text-danger-foreground flex-col h-auto py-4"
          >
            <Phone className="h-6 w-6 mb-1" />
            <span className="text-xs">Emergency Alert</span>
          </Button>

          <Button
            onClick={handleCallPolice}
            variant="destructive"
            className="flex-col h-auto py-4"
          >
            <AlertTriangle className="h-6 w-6 mb-1" />
            <span className="text-xs">Call Police</span>
          </Button>

          <Button
            onClick={handleGenerateReport}
            disabled={loading === "report"}
            variant="outline"
            className="flex-col h-auto py-4"
          >
            <Download className="h-6 w-6 mb-1" />
            <span className="text-xs">Export Report</span>
          </Button>

          <Button
            onClick={handleTestAlert}
            disabled={loading === "test"}
            variant="secondary"
            className="flex-col h-auto py-4"
          >
            <Bell className="h-6 w-6 mb-1" />
            <span className="text-xs">Test System</span>
          </Button>

          <Button
            onClick={() => window.location.href = "/history"}
            variant="outline"
            className="flex-col h-auto py-4"
          >
            <FileText className="h-6 w-6 mb-1" />
            <span className="text-xs">View History</span>
          </Button>

          <Button
            onClick={() => window.location.href = "/settings"}
            variant="outline"
            className="flex-col h-auto py-4"
          >
            <ShieldAlert className="h-6 w-6 mb-1" />
            <span className="text-xs">Settings</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActionsPanel;

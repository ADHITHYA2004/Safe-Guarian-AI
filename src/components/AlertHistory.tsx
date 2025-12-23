import { useState, useEffect } from "react";
import { Calendar, AlertTriangle, Shield, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { authApi, alertsApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

type AlertStatus = "safe" | "warning" | "danger";

interface AlertRecord {
  id: string;
  created_at: string;
  status: AlertStatus;
  confidence: number;
  description: string;
  location: string;
  action_taken: string;
  contacts_notified: string[];
  camera_name?: string;
  alert_type: string;
}

const AlertHistory = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<AlertStatus | "all">("all");
  const [alerts, setAlerts] = useState<AlertRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const { session } = await authApi.getSession();
      
      if (!session) {
        toast({
          title: "Not Authenticated",
          description: "Please sign in to view alert history",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const data = await alertsApi.getAll();

      setAlerts((data || []) as AlertRecord[]);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      toast({
        title: "Error",
        description: "Failed to load alert history",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = alert.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || alert.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: AlertStatus) => {
    switch (status) {
      case "safe": return "text-success bg-success/10";
      case "warning": return "text-warning bg-warning/10";
      case "danger": return "text-danger bg-danger/10";
    }
  };

  const getStatusIcon = (status: AlertStatus) => {
    switch (status) {
      case "safe": return <Shield className="h-4 w-4" />;
      case "warning": case "danger": return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };


  const dangerAlerts = alerts.filter(a => a.status === "danger").length;
  const warningAlerts = alerts.filter(a => a.status === "warning").length;
  const totalAlerts = alerts.length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Alert History</h2>
        <p className="text-muted-foreground">
          Review past harassment detection alerts and system activities
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-danger" />
              <div>
                <p className="text-sm font-medium">Critical Alerts</p>
                <p className="text-2xl font-bold text-danger">{dangerAlerts}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <div>
                <p className="text-sm font-medium">Warnings</p>
                <p className="text-2xl font-bold text-warning">{warningAlerts}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Total Events</p>
                <p className="text-2xl font-bold">{totalAlerts}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-success" />
              <div>
                <p className="text-sm font-medium">System Uptime</p>
                <p className="text-2xl font-bold text-success">99.8%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search alerts by description or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={(value: AlertStatus | "all") => setStatusFilter(value)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="danger">Critical</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="safe">Safe/Test</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Alert History List */}
      {loading ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Loading alerts...</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-4">
            {filteredAlerts.map((alert) => (
              <Card key={alert.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <Badge className={cn("gap-1", getStatusColor(alert.status))}>
                          {getStatusIcon(alert.status)}
                          {alert.status.toUpperCase()}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(alert.created_at)}
                        </span>
                        <Badge variant="outline">
                          {alert.confidence}% confidence
                        </Badge>
                        {alert.camera_name && (
                          <Badge variant="secondary">
                            {alert.camera_name}
                          </Badge>
                        )}
                      </div>
                      
                      <div>
                        <h3 className="font-semibold text-lg">{alert.description}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Location: {alert.location}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Type: {alert.alert_type}
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <div>
                          <span className="text-sm font-medium">Action Taken: </span>
                          <span className="text-sm text-muted-foreground">{alert.action_taken}</span>
                        </div>
                        
                       {alert.contacts_notified && alert.contacts_notified.length > 0 && (
                          <div>
                            <span className="text-sm font-medium">Contacts Notified: </span>
                            <span className="text-sm text-muted-foreground">
                              {alert.contacts_notified.join(", ")}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredAlerts.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="mx-auto w-fit rounded-full bg-muted p-3">
                  <Calendar className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">No Alerts Found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || statusFilter !== "all" 
                    ? "No alerts match your current filters" 
                    : "No alert history available yet"}
                </p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default AlertHistory;
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { authApi, alertsApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { AlertTriangle, Shield, TrendingUp, MapPin, Clock, Camera } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Alert {
  id: string;
  camera_name: string;
  location: string;
  status: string;
  confidence: number;
  description: string;
  created_at: string;
}

interface Stats {
  total: number;
  danger: number;
  warning: number;
  safe: number;
  avgConfidence: number;
}

const Dashboard = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, danger: 0, warning: 0, safe: 0, avgConfidence: 0 });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
    loadAlerts();
  }, []);

  const checkAuth = async () => {
    try {
      const { session } = await authApi.getSession();
      if (!session) {
        navigate("/auth");
      }
    } catch (error) {
      navigate("/auth");
    }
  };

  const loadAlerts = async () => {
    try {
      const data = await alertsApi.getAll(100);
      setAlerts(data || []);
      calculateStats(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading alerts",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (alertsData: Alert[]) => {
    const total = alertsData.length;
    const danger = alertsData.filter(a => a.status === "danger").length;
    const warning = alertsData.filter(a => a.status === "warning").length;
    const safe = alertsData.filter(a => a.status === "safe").length;
    const avgConfidence = alertsData.reduce((sum, a) => sum + a.confidence, 0) / total || 0;

    setStats({ total, danger, warning, safe, avgConfidence: Math.round(avgConfidence) });
  };

  // Prepare data for charts
  const statusData = [
    { name: "Danger", value: stats.danger, color: "hsl(var(--danger))" },
    { name: "Warning", value: stats.warning, color: "hsl(var(--warning))" },
    { name: "Safe", value: stats.safe, color: "hsl(var(--success))" },
  ];

  // Group alerts by date for trend chart
  const trendData = alerts.reduce((acc: any[], alert) => {
    const date = new Date(alert.created_at).toLocaleDateString();
    const existing = acc.find(item => item.date === date);
    if (existing) {
      existing[alert.status] = (existing[alert.status] || 0) + 1;
    } else {
      acc.push({
        date,
        danger: alert.status === "danger" ? 1 : 0,
        warning: alert.status === "warning" ? 1 : 0,
        safe: alert.status === "safe" ? 1 : 0,
      });
    }
    return acc;
  }, []).slice(-7).reverse();

  // Group by location
  const locationData = alerts.reduce((acc: any[], alert) => {
    const existing = acc.find(item => item.location === alert.location);
    if (existing) {
      existing.count++;
      if (alert.status === "danger") existing.danger++;
    } else {
      acc.push({
        location: alert.location,
        count: 1,
        danger: alert.status === "danger" ? 1 : 0,
      });
    }
    return acc;
  }, []).sort((a, b) => b.count - a.count).slice(0, 5);

  // Recent high-priority alerts
  const recentDangerAlerts = alerts.filter(a => a.status === "danger").slice(0, 5);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 md:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold gradient-text">Analytics Dashboard</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1 md:mt-2">Real-time insights and detection statistics</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4 md:gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Alerts</CardTitle>
            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Danger</CardTitle>
            <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 text-danger" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-danger">{stats.danger}</div>
            <p className="text-xs text-muted-foreground">High priority</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Warning</CardTitle>
            <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-warning">{stats.warning}</div>
            <p className="text-xs text-muted-foreground">Medium</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Confidence</CardTitle>
            <Camera className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{stats.avgConfidence}%</div>
            <p className="text-xs text-muted-foreground">Accuracy</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-3 md:gap-4 grid-cols-1 lg:grid-cols-2">
        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Alert Distribution</CardTitle>
            <CardDescription>Breakdown by severity level</CardDescription>
          </CardHeader>
          <CardContent className="p-2 sm:p-6">
            <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Detection Trend */}
        <Card>
          <CardHeader>
            <CardTitle>7-Day Trend</CardTitle>
            <CardDescription>Detection patterns over time</CardDescription>
          </CardHeader>
          <CardContent className="p-2 sm:p-6">
            <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="danger" stroke="hsl(var(--danger))" strokeWidth={2} />
                <Line type="monotone" dataKey="warning" stroke="hsl(var(--warning))" strokeWidth={2} />
                <Line type="monotone" dataKey="safe" stroke="hsl(var(--success))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Location Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Top Locations
          </CardTitle>
          <CardDescription>Areas with most detections</CardDescription>
        </CardHeader>
        <CardContent className="p-2 sm:p-6">
          <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
            <BarChart data={locationData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="location" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="hsl(var(--primary))" name="Total Alerts" />
              <Bar dataKey="danger" fill="hsl(var(--danger))" name="Danger Alerts" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Danger Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent High-Priority Alerts
          </CardTitle>
          <CardDescription>Latest danger detections requiring attention</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentDangerAlerts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent danger alerts</p>
            ) : (
              recentDangerAlerts.map((alert) => (
                <div key={alert.id} className="flex flex-col sm:flex-row sm:items-start sm:justify-between border-b pb-3 last:border-0 gap-2">
                  <div className="space-y-1 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="destructive" className="text-xs">{alert.status.toUpperCase()}</Badge>
                      <span className="text-sm sm:text-base font-medium">{alert.camera_name}</span>
                      <span className="text-xs sm:text-sm text-muted-foreground">- {alert.location}</span>
                    </div>
                    <p className="text-xs sm:text-sm">{alert.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(alert.created_at).toLocaleString()} • {alert.confidence}% confidence
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;

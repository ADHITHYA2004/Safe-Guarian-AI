import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Activity, AlertTriangle, Shield, Camera, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface ActivityItem {
  id: string;
  type: "alert" | "system" | "camera";
  status: "danger" | "warning" | "safe" | "info";
  message: string;
  location?: string;
  timestamp: string;
}

const LiveActivityFeed = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  useEffect(() => {
    loadRecentActivities();
    subscribeToRealtime();
  }, []);

  const loadRecentActivities = async () => {
    const { data } = await supabase
      .from("alerts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);

    if (data) {
      const items: ActivityItem[] = data.map(alert => ({
        id: alert.id,
        type: "alert",
        status: alert.status as "danger" | "warning" | "safe",
        message: alert.description,
        location: alert.location,
        timestamp: alert.created_at,
      }));
      setActivities(items);
    }
  };

  const subscribeToRealtime = () => {
    const channel = supabase
      .channel("activity_feed")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "alerts",
        },
        (payload) => {
          const alert = payload.new as any;
          const newActivity: ActivityItem = {
            id: alert.id,
            type: "alert",
            status: alert.status,
            message: alert.description,
            location: alert.location,
            timestamp: alert.created_at,
          };
          setActivities(prev => [newActivity, ...prev].slice(0, 20));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const getIcon = (item: ActivityItem) => {
    switch (item.type) {
      case "alert":
        return item.status === "danger" ? 
          <AlertTriangle className="h-4 w-4 text-danger" /> : 
          <Shield className="h-4 w-4 text-warning" />;
      case "camera":
        return <Camera className="h-4 w-4 text-primary" />;
      default:
        return <Activity className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "danger": return "bg-danger/10 text-danger border-danger/20";
      case "warning": return "bg-warning/10 text-warning border-warning/20";
      case "safe": return "bg-success/10 text-success border-success/20";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Live Activity Feed
          <Badge variant="outline" className="ml-auto">
            <span className="relative flex h-2 w-2 mr-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
            </span>
            Live
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            {activities.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No recent activity</p>
              </div>
            ) : (
              activities.map((activity) => (
                <div
                  key={activity.id}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-lg border transition-colors",
                    getStatusColor(activity.status)
                  )}
                >
                  <div className="mt-0.5">{getIcon(activity)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-tight">
                      {activity.message}
                    </p>
                    {activity.location && (
                      <p className="text-xs opacity-80 mt-1">
                        📍 {activity.location}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs opacity-60 whitespace-nowrap">
                    <Clock className="h-3 w-3" />
                    {formatTime(activity.timestamp)}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default LiveActivityFeed;

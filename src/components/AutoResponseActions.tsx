import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  Zap, 
  Video, 
  MapPin, 
  Volume2, 
  Phone, 
  MessageSquare,
  Camera,
  Bell,
  Shield
} from "lucide-react";

interface AutoAction {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
  triggerLevel: "any" | "high" | "critical";
}

const AutoResponseActions = () => {
  const [actions, setActions] = useState<AutoAction[]>([
    {
      id: "record_video",
      name: "Auto Record Video",
      description: "Automatically start recording when threat detected",
      icon: <Video className="h-5 w-5" />,
      enabled: true,
      triggerLevel: "any"
    },
    {
      id: "share_location",
      name: "Share Live Location",
      description: "Send real-time location to emergency contacts",
      icon: <MapPin className="h-5 w-5" />,
      enabled: true,
      triggerLevel: "high"
    },
    {
      id: "sound_alarm",
      name: "Sound Alarm",
      description: "Play loud alarm sound to deter threats",
      icon: <Volume2 className="h-5 w-5" />,
      enabled: false,
      triggerLevel: "critical"
    },
    {
      id: "capture_photos",
      name: "Capture Evidence Photos",
      description: "Take multiple photos when alert triggered",
      icon: <Camera className="h-5 w-5" />,
      enabled: true,
      triggerLevel: "any"
    },
    {
      id: "send_sms",
      name: "Send SMS Alert",
      description: "Automatically send SMS to emergency contacts",
      icon: <MessageSquare className="h-5 w-5" />,
      enabled: true,
      triggerLevel: "high"
    },
    {
      id: "emergency_call",
      name: "Auto Emergency Call",
      description: "Automatically dial emergency services",
      icon: <Phone className="h-5 w-5" />,
      enabled: false,
      triggerLevel: "critical"
    }
  ]);

  const handleToggleAction = (id: string) => {
    setActions(actions.map(action =>
      action.id === id ? { ...action, enabled: !action.enabled } : action
    ));
    
    const action = actions.find(a => a.id === id);
    if (action) {
      toast.success(`${action.name} ${!action.enabled ? "enabled" : "disabled"}`);
    }
  };

  const getTriggerBadge = (level: string) => {
    switch (level) {
      case "any": return <Badge variant="secondary">Any Alert</Badge>;
      case "high": return <Badge variant="outline" className="border-warning text-warning">High Priority</Badge>;
      case "critical": return <Badge variant="destructive">Critical Only</Badge>;
      default: return null;
    }
  };

  const enabledCount = actions.filter(a => a.enabled).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-warning" />
          Auto Response Actions
        </CardTitle>
        <CardDescription>
          Configure automatic actions when threats are detected
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Active Responses</span>
          </div>
          <Badge>{enabledCount} of {actions.length}</Badge>
        </div>

        <div className="space-y-3">
          {actions.map((action) => (
            <div
              key={action.id}
              className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                action.enabled ? "bg-card border-primary/20" : "bg-muted/50"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${action.enabled ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                  {action.icon}
                </div>
                <div>
                  <p className="font-medium">{action.name}</p>
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                  <div className="mt-2">
                    {getTriggerBadge(action.triggerLevel)}
                  </div>
                </div>
              </div>
              <Switch
                checked={action.enabled}
                onCheckedChange={() => handleToggleAction(action.id)}
              />
            </div>
          ))}
        </div>

        <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
          <div className="flex items-start gap-3">
            <Bell className="h-5 w-5 text-warning mt-0.5" />
            <div>
              <p className="font-medium text-sm">Important Notice</p>
              <p className="text-xs text-muted-foreground mt-1">
                Auto emergency call feature requires explicit user consent and may incur charges.
                Test all auto-response actions before relying on them in real emergencies.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AutoResponseActions;

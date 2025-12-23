import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { MapPin, Plus, Trash2, Shield, AlertTriangle } from "lucide-react";

interface Zone {
  id: string;
  name: string;
  type: "safe" | "restricted" | "high_risk";
  enabled: boolean;
  alertLevel: "low" | "medium" | "high";
}

const ZoneMonitoring = () => {
  const [zones, setZones] = useState<Zone[]>([
    { id: "1", name: "Home", type: "safe", enabled: true, alertLevel: "low" },
    { id: "2", name: "Work", type: "safe", enabled: true, alertLevel: "medium" },
    { id: "3", name: "Downtown Area", type: "high_risk", enabled: true, alertLevel: "high" },
  ]);
  const [newZoneName, setNewZoneName] = useState("");
  const [newZoneType, setNewZoneType] = useState<"safe" | "restricted" | "high_risk">("safe");

  const handleAddZone = () => {
    if (!newZoneName.trim()) {
      toast.error("Please enter a zone name");
      return;
    }

    const newZone: Zone = {
      id: Date.now().toString(),
      name: newZoneName,
      type: newZoneType,
      enabled: true,
      alertLevel: newZoneType === "high_risk" ? "high" : newZoneType === "restricted" ? "medium" : "low",
    };

    setZones([...zones, newZone]);
    setNewZoneName("");
    toast.success(`Zone "${newZoneName}" added`);
  };

  const handleDeleteZone = (id: string) => {
    setZones(zones.filter(z => z.id !== id));
    toast.success("Zone deleted");
  };

  const handleToggleZone = (id: string) => {
    setZones(zones.map(zone =>
      zone.id === id ? { ...zone, enabled: !zone.enabled } : zone
    ));
  };

  const getZoneIcon = (type: string) => {
    switch (type) {
      case "safe": return <Shield className="h-4 w-4 text-success" />;
      case "restricted": return <AlertTriangle className="h-4 w-4 text-warning" />;
      case "high_risk": return <AlertTriangle className="h-4 w-4 text-destructive" />;
      default: return <MapPin className="h-4 w-4" />;
    }
  };

  const getZoneBadgeVariant = (type: string) => {
    switch (type) {
      case "safe": return "secondary";
      case "restricted": return "outline";
      case "high_risk": return "destructive";
      default: return "secondary";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          Zone Monitoring
        </CardTitle>
        <CardDescription>
          Define safe zones and high-risk areas for location-based alerts
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add New Zone */}
        <div className="space-y-4 p-4 rounded-lg border bg-muted/50">
          <Label>Add New Zone</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Zone name (e.g., School, Gym)"
              value={newZoneName}
              onChange={(e) => setNewZoneName(e.target.value)}
              className="flex-1"
            />
            <Select value={newZoneType} onValueChange={(v) => setNewZoneType(v as typeof newZoneType)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="safe">Safe Zone</SelectItem>
                <SelectItem value="restricted">Restricted</SelectItem>
                <SelectItem value="high_risk">High Risk</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleAddZone} size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Zone List */}
        <div className="space-y-3">
          <Label>Configured Zones</Label>
          {zones.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No zones configured yet
            </p>
          ) : (
            zones.map((zone) => (
              <div
                key={zone.id}
                className="flex items-center justify-between p-4 rounded-lg border bg-card"
              >
                <div className="flex items-center gap-3">
                  {getZoneIcon(zone.type)}
                  <div>
                    <p className="font-medium">{zone.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={getZoneBadgeVariant(zone.type) as any}>
                        {zone.type.replace("_", " ")}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Alert Level: {zone.alertLevel}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={zone.enabled}
                    onCheckedChange={() => handleToggleZone(zone.id)}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteZone(zone.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="font-medium text-sm">Zone-Based Protection</p>
              <p className="text-xs text-muted-foreground mt-1">
                When enabled, the system will adjust alert sensitivity based on your current zone.
                High-risk zones trigger immediate alerts, while safe zones reduce false positives.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ZoneMonitoring;

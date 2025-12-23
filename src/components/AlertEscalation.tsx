import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AlertTriangle, Clock, Phone, Mail, MessageSquare, Zap } from "lucide-react";

interface EscalationRule {
  id: string;
  level: number;
  delay_minutes: number;
  action: string;
  notify_method: string;
  enabled: boolean;
}

const AlertEscalation = () => {
  const [autoEscalate, setAutoEscalate] = useState(true);
  const [escalationTimeout, setEscalationTimeout] = useState("5");
  const [rules, setRules] = useState<EscalationRule[]>([
    { id: "1", level: 1, delay_minutes: 0, action: "notify_user", notify_method: "push", enabled: true },
    { id: "2", level: 2, delay_minutes: 5, action: "notify_contacts", notify_method: "sms", enabled: true },
    { id: "3", level: 3, delay_minutes: 10, action: "emergency_call", notify_method: "call", enabled: false },
  ]);
  const [saving, setSaving] = useState(false);

  const handleToggleRule = (id: string) => {
    setRules(rules.map(rule => 
      rule.id === id ? { ...rule, enabled: !rule.enabled } : rule
    ));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to save settings");
        return;
      }

      // Save to user_settings as JSON
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          auto_escalate: autoEscalate,
          escalation_timeout: parseInt(escalationTimeout),
          escalation_rules: JSON.stringify(rules),
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      if (error) throw error;
      toast.success("Escalation settings saved");
    } catch (error) {
      console.error("Error saving escalation settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case "notify_user": return "Notify User";
      case "notify_contacts": return "Alert Emergency Contacts";
      case "emergency_call": return "Emergency Services Call";
      default: return action;
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case "push": return <MessageSquare className="h-4 w-4" />;
      case "sms": return <Phone className="h-4 w-4" />;
      case "email": return <Mail className="h-4 w-4" />;
      case "call": return <Phone className="h-4 w-4 text-destructive" />;
      default: return <Zap className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-warning" />
          Alert Escalation
        </CardTitle>
        <CardDescription>
          Configure automatic escalation when alerts are not acknowledged
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Auto Escalation</Label>
            <p className="text-sm text-muted-foreground">
              Automatically escalate unacknowledged alerts
            </p>
          </div>
          <Switch checked={autoEscalate} onCheckedChange={setAutoEscalate} />
        </div>

        <div className="space-y-2">
          <Label>Escalation Timeout (minutes)</Label>
          <Select value={escalationTimeout} onValueChange={setEscalationTimeout}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 minute</SelectItem>
              <SelectItem value="2">2 minutes</SelectItem>
              <SelectItem value="5">5 minutes</SelectItem>
              <SelectItem value="10">10 minutes</SelectItem>
              <SelectItem value="15">15 minutes</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          <Label>Escalation Rules</Label>
          {rules.map((rule, index) => (
            <div
              key={rule.id}
              className="flex items-center justify-between p-4 rounded-lg border bg-card"
            >
              <div className="flex items-center gap-4">
                <Badge variant={rule.enabled ? "default" : "secondary"}>
                  Level {rule.level}
                </Badge>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{rule.delay_minutes === 0 ? "Immediate" : `After ${rule.delay_minutes} min`}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {getMethodIcon(rule.notify_method)}
                  <span>{getActionLabel(rule.action)}</span>
                </div>
              </div>
              <Switch
                checked={rule.enabled}
                onCheckedChange={() => handleToggleRule(rule.id)}
              />
            </div>
          ))}
        </div>

        <Button onClick={handleSave} disabled={saving} className="w-full">
          {saving ? "Saving..." : "Save Escalation Settings"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default AlertEscalation;

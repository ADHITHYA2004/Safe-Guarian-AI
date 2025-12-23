import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Settings as SettingsIcon, Shield, Bell, Camera, Database, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { authApi, settingsApi } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import QuietHoursSettings from "@/components/QuietHoursSettings";
import AlertEscalation from "@/components/AlertEscalation";
import ZoneMonitoring from "@/components/ZoneMonitoring";
import AutoResponseActions from "@/components/AutoResponseActions";

interface UserSettings {
  detection_sensitivity: string;
  confidence_threshold: number;
  realtime_processing: boolean;
  video_quality: string;
  frame_rate: number;
  auto_start_detection: boolean;
  audio_alerts: boolean;
  alert_volume: number;
  auto_notify_contacts: boolean;
}

const defaultSettings: UserSettings = {
  detection_sensitivity: 'high',
  confidence_threshold: 75,
  realtime_processing: true,
  video_quality: 'hd',
  frame_rate: 30,
  auto_start_detection: false,
  audio_alerts: true,
  alert_volume: 85,
  auto_notify_contacts: true,
};

const Settings = () => {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { session } = await authApi.getSession();
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please log in to manage settings",
          variant: "destructive",
        });
        return;
      }

      const data = await settingsApi.get();
      if (data) {
        setSettings({
          detection_sensitivity: data.detection_sensitivity,
          confidence_threshold: data.confidence_threshold,
          realtime_processing: data.realtime_processing,
          video_quality: data.video_quality,
          frame_rate: data.frame_rate,
          auto_start_detection: data.auto_start_detection,
          audio_alerts: data.audio_alerts,
          alert_volume: data.alert_volume,
          auto_notify_contacts: data.auto_notify_contacts,
        });
      }
    } catch (error: any) {
      console.error('Error loading settings:', error);
      toast({
        title: "Error loading settings",
        description: error.message || "Failed to load settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const { session } = await authApi.getSession();
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please log in to save settings",
          variant: "destructive",
        });
        return;
      }

      await settingsApi.update(settings);

      toast({
        title: "Settings saved",
        description: "Your preferences have been updated successfully",
      });
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error saving settings",
        description: error.message || "Unknown error",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = () => {
    setSettings(defaultSettings);
    toast({
      title: "Reset to defaults",
      description: "Settings have been reset. Click Save to apply changes.",
    });
  };

  const exportConfiguration = () => {
    const configJson = JSON.stringify(settings, null, 2);
    const blob = new Blob([configJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `harassment-detection-settings-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Configuration exported",
      description: "Your settings have been downloaded",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">System Settings</h2>
        <p className="text-muted-foreground">
          Configure harassment detection and alert preferences
        </p>
      </div>

      {/* Detection Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Detection Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">AI Detection Sensitivity</Label>
              <p className="text-sm text-muted-foreground">
                Higher sensitivity may trigger more false positives
              </p>
            </div>
            <Badge variant="outline">{settings.detection_sensitivity}</Badge>
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Confidence Threshold</Label>
              <p className="text-sm text-muted-foreground">
                Minimum confidence level to trigger alerts
              </p>
            </div>
            <Input 
              className="w-20" 
              type="number"
              min="0"
              max="100"
              value={settings.confidence_threshold}
              onChange={(e) => setSettings({ ...settings, confidence_threshold: parseInt(e.target.value) || 0 })}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Real-time Processing</Label>
              <p className="text-sm text-muted-foreground">
                Process video feed in real-time for immediate detection
              </p>
            </div>
            <Switch 
              checked={settings.realtime_processing}
              onCheckedChange={(checked) => setSettings({ ...settings, realtime_processing: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Camera Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Camera Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Video Quality</Label>
              <p className="text-sm text-muted-foreground">
                Higher quality uses more bandwidth and processing power
              </p>
            </div>
            <Badge variant="outline">{settings.video_quality === 'hd' ? 'HD (720p)' : settings.video_quality}</Badge>
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Frame Rate</Label>
              <p className="text-sm text-muted-foreground">
                Frames per second for detection analysis
              </p>
            </div>
            <Input 
              className="w-20" 
              type="number"
              min="15"
              max="60"
              value={settings.frame_rate}
              onChange={(e) => setSettings({ ...settings, frame_rate: parseInt(e.target.value) || 30 })}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Auto-start Detection</Label>
              <p className="text-sm text-muted-foreground">
                Automatically start detection when camera is accessed
              </p>
            </div>
            <Switch 
              checked={settings.auto_start_detection}
              onCheckedChange={(checked) => setSettings({ ...settings, auto_start_detection: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Alert Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Alert Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Audio Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Play loud sound when harassment is detected
              </p>
            </div>
            <Switch 
              checked={settings.audio_alerts}
              onCheckedChange={(checked) => setSettings({ ...settings, audio_alerts: checked })}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Alert Volume</Label>
              <p className="text-sm text-muted-foreground">
                Volume level for emergency alerts (0-100)
              </p>
            </div>
            <Input 
              className="w-20" 
              type="number"
              min="0"
              max="100"
              value={settings.alert_volume}
              onChange={(e) => setSettings({ ...settings, alert_volume: parseInt(e.target.value) || 0 })}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Auto-notify Contacts</Label>
              <p className="text-sm text-muted-foreground">
                Automatically notify emergency contacts on detection
              </p>
            </div>
            <Switch 
              checked={settings.auto_notify_contacts}
              onCheckedChange={(checked) => setSettings({ ...settings, auto_notify_contacts: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Quiet Hours */}
      <QuietHoursSettings />

      {/* Alert Escalation */}
      <AlertEscalation />

      {/* Auto Response Actions */}
      <AutoResponseActions />

      {/* Zone Monitoring */}
      <ZoneMonitoring />

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            System Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">AI Model Version</Label>
              <p className="text-sm text-muted-foreground">v2.1.0</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Last Updated</Label>
              <p className="text-sm text-muted-foreground">{new Date().toLocaleDateString()}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Detection Accuracy</Label>
              <p className="text-sm text-muted-foreground">94.2%</p>
            </div>
            <div>
              <Label className="text-sm font-medium">System Status</Label>
              <Badge className="status-safe">Operational</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-4">
        <Button onClick={saveSettings} disabled={saving}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Settings
        </Button>
        <Button variant="outline" onClick={resetToDefaults}>
          Reset to Defaults
        </Button>
        <Button variant="outline" onClick={exportConfiguration}>
          Export Configuration
        </Button>
      </div>
    </div>
  );
};

export default Settings;
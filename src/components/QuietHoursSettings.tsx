import { useState, useEffect } from "react";
import { authApi, settingsApi } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Clock, Moon, Sun } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const DAYS = [
  { value: 'monday', label: 'Mon' },
  { value: 'tuesday', label: 'Tue' },
  { value: 'wednesday', label: 'Wed' },
  { value: 'thursday', label: 'Thu' },
  { value: 'friday', label: 'Fri' },
  { value: 'saturday', label: 'Sat' },
  { value: 'sunday', label: 'Sun' },
];

const HOURS = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
const MINUTES = ['00', '15', '30', '45'];

const QuietHoursSettings = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [enabled, setEnabled] = useState(false);
  const [startHour, setStartHour] = useState('22');
  const [startMinute, setStartMinute] = useState('00');
  const [endHour, setEndHour] = useState('08');
  const [endMinute, setEndMinute] = useState('00');
  const [selectedDays, setSelectedDays] = useState<string[]>([
    'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
  ]);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { session } = await authApi.getSession();
      if (!session) return;

      const data = await settingsApi.get();

      if (data) {
        setEnabled(data.quiet_hours_enabled);
        const [sHour, sMinute] = data.quiet_hours_start.split(':');
        const [eHour, eMinute] = data.quiet_hours_end.split(':');
        setStartHour(sHour);
        setStartMinute(sMinute);
        setEndHour(eHour);
        setEndMinute(eMinute);
        setSelectedDays(data.quiet_hours_days || []);
      }
    } catch (error) {
      console.error('Error loading quiet hours settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      const { session } = await authApi.getSession();
      if (!session) return;

      const startTime = `${startHour}:${startMinute}`;
      const endTime = `${endHour}:${endMinute}`;

      await settingsApi.update({
        quiet_hours_enabled: enabled,
        quiet_hours_start: startTime,
        quiet_hours_end: endTime,
        quiet_hours_days: selectedDays,
      });

      toast({
        title: "Settings Saved",
        description: "Quiet hours settings have been updated successfully.",
      });
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save quiet hours settings.",
        variant: "destructive",
      });
    }
  };

  const handleDayToggle = (day: string) => {
    setSelectedDays(prev => {
      const newDays = prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day];
      return newDays;
    });
  };

  useEffect(() => {
    if (!loading) {
      saveSettings();
    }
  }, [enabled, startHour, startMinute, endHour, endMinute, selectedDays]);

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">Loading settings...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Moon className="h-5 w-5 text-primary" />
            <CardTitle>Quiet Hours</CardTitle>
          </div>
          <Switch checked={enabled} onCheckedChange={setEnabled} />
        </div>
        <CardDescription>
          Automatically pause all alerts during specified hours. System monitoring continues in the background.
        </CardDescription>
      </CardHeader>

      {enabled && (
        <CardContent className="space-y-6">
          {/* Time Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Start Time */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Sun className="h-4 w-4 text-warning" />
                Start Time
              </Label>
              <div className="flex gap-2">
                <Select value={startHour} onValueChange={setStartHour}>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {HOURS.map(h => (
                      <SelectItem key={h} value={h}>{h}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="flex items-center text-2xl font-bold">:</span>
                <Select value={startMinute} onValueChange={setStartMinute}>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MINUTES.map(m => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* End Time */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Moon className="h-4 w-4 text-primary" />
                End Time
              </Label>
              <div className="flex gap-2">
                <Select value={endHour} onValueChange={setEndHour}>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {HOURS.map(h => (
                      <SelectItem key={h} value={h}>{h}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="flex items-center text-2xl font-bold">:</span>
                <Select value={endMinute} onValueChange={setEndMinute}>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MINUTES.map(m => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Days Selection */}
          <div className="space-y-3">
            <Label>Active Days</Label>
            <div className="flex flex-wrap gap-2">
              {DAYS.map(day => (
                <Badge
                  key={day.value}
                  variant={selectedDays.includes(day.value) ? "default" : "outline"}
                  className="cursor-pointer px-3 py-1.5"
                  onClick={() => handleDayToggle(day.value)}
                >
                  {day.label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="rounded-lg bg-muted p-4">
            <div className="flex items-start gap-2">
              <Clock className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Active Schedule</p>
                <p className="text-sm text-muted-foreground">
                  Alerts paused from {startHour}:{startMinute} to {endHour}:{endMinute}
                  {selectedDays.length === 7 ? ' daily' : ` on ${selectedDays.join(', ')}`}
                </p>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="text-sm text-muted-foreground">
            <p>• Critical alerts can still be logged for review later</p>
            <p>• Emergency contacts will not be notified during quiet hours</p>
            <p>• Browser notifications will be suppressed</p>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default QuietHoursSettings;

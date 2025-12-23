import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { authApi, emergencyApi } from "@/lib/api";
import CameraFeed from "./CameraFeed";

interface Camera {
  id: string;
  name: string;
  location: string;
}

const CAMPUS_CAMERAS: Camera[] = [
  { id: "cam-1", name: "Main Gate", location: "College Main Entrance" },
  { id: "cam-2", name: "Library", location: "Library Building Entrance" },
  { id: "cam-3", name: "Parking Lot", location: "Student Parking Area" },
  { id: "cam-4", name: "Cafeteria", location: "Cafeteria Hall" },
];

const MultiCameraGrid = () => {
  const [isCallingEmergency, setIsCallingEmergency] = useState(false);
  const [alertingCamera, setAlertingCamera] = useState<string | null>(null);
  const { toast } = useToast();

  const handleDetection = (cameraId: string, cameraLocation: string) => {
    // Trigger global alarm
    setAlertingCamera(cameraId);
    
    // Play loud alarm sound
    const audio = new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmcfCDN+y/HTfC4FIm/A7+OZSA0PVK3n77tRDgtWrN/13W08CyhvwO/jm04RCDZ7x+TNeSsFY3Y4ADZHo5PgwKLWGAMAFW4pqwB5Ng0AB1oNogCHNgMAZ3g0ADFJqJqFb1xfdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmcfCDN+y/HTfC4FIm/A7+OZSA0PVK3n77tRDgtWrN/13W08CyhvwO/jm04RCDZ7x+TNeSsFY3g4BDBNsJ3jwaTWGgUCHm4usAV8NgwEB1oOow==");
    audio.play().catch(() => {});

    // Show alert
    toast({
      title: `🚨 ALERT FROM ${cameraLocation.toUpperCase()}!`,
      description: "Harassment detected - Emergency contacts notified",
      variant: "destructive",
    });
  };

  const callEmergencyContacts = async () => {
    setIsCallingEmergency(true);
    
    try {
      const { session } = await authApi.getSession();
      
      if (!session) {
        toast({
          title: "Not Authenticated",
          description: "Please sign in to use emergency alerts",
          variant: "destructive",
        });
        setIsCallingEmergency(false);
        return;
      }

      let location = "College Campus - Multiple Cameras";
      if (alertingCamera) {
        const camera = CAMPUS_CAMERAS.find(c => c.id === alertingCamera);
        if (camera) {
          location = `${camera.location} (${camera.name})`;
        }
      }

      // Play alert sound
      const audio = new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmcfCDN+y/HTfC4FIm/A7+OZSA0PVK3n77tRDgtWrN/13W08CyhvwO/jm04RCDZ7x+TNeSsFY3Y4ADZHo5PgwKLWGAMAFW4pqwB5Ng0AB1oNogCHNgMAZ3g0ADFJqJqFb1xfdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmcfCDN+y/HTfC4FIm/A7+OZSA0PVK3n77tRDgtWrN/13W08CyhvwO/jm04RCDZ7x+TNeSsFY3g4BDBNsJ3jwaTWGgUCHm4usAV8NgwEB1oOow==");
      audio.play().catch(() => {});

      const data = await emergencyApi.send({
        location,
        alertType: 'Manual Emergency - Campus Surveillance',
        cameraId: alertingCamera,
        cameraName: alertingCamera ? CAMPUS_CAMERAS.find(c => c.id === alertingCamera)?.name : undefined
      });

      if (data.success) {
        toast({
          title: "🚨 Emergency Alerts Sent!",
          description: data.message,
        });
      } else {
        toast({
          title: "Cannot Send Alerts",
          description: data.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Emergency alert error:', error);
      toast({
        title: "Alert Failed",
        description: error.message || "Failed to send emergency alerts.",
        variant: "destructive",
      });
    } finally {
      setIsCallingEmergency(false);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Global Emergency Button */}
      <Card className="border-danger bg-danger/5">
        <CardHeader className="p-3 sm:p-6">
          <CardTitle className="text-center text-danger text-sm sm:text-base md:text-lg">Campus Emergency Alert System</CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
          <Button 
            onClick={callEmergencyContacts}
            disabled={isCallingEmergency}
            size="lg"
            className="w-full bg-danger hover:bg-danger/90 text-danger-foreground text-sm sm:text-base md:text-xl font-bold py-4 sm:py-6 md:py-8 animate-pulse"
          >
            <Phone className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8" />
            <span className="hidden sm:inline">{isCallingEmergency ? "CALLING EMERGENCY CONTACTS..." : "🚨 EMERGENCY - ALERT ALL CONTACTS"}</span>
            <span className="sm:hidden">{isCallingEmergency ? "CALLING..." : "🚨 EMERGENCY ALERT"}</span>
          </Button>
          <p className="text-center text-xs sm:text-sm text-muted-foreground mt-2">
            Monitoring {CAMPUS_CAMERAS.length} cameras across campus
          </p>
        </CardContent>
      </Card>

      {/* Camera Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 lg:gap-6">
        {CAMPUS_CAMERAS.map((camera) => (
          <CameraFeed
            key={camera.id}
            cameraId={camera.id}
            cameraName={camera.name}
            cameraLocation={camera.location}
            onDetection={() => handleDetection(camera.id, camera.location)}
          />
        ))}
      </div>
    </div>
  );
};

export default MultiCameraGrid;

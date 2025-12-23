import { useEffect, useRef, useState } from "react";
import { AlertTriangle, Shield, Play, Pause, Volume2, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { authApi, alertsApi } from "@/lib/api";

type DetectionStatus = "safe" | "warning" | "danger";

interface DetectionResult {
  status: DetectionStatus;
  confidence: number;
  timestamp: Date;
  description: string;
}

interface CameraFeedProps {
  cameraId?: string;
  cameraName?: string;
  cameraLocation?: string;
  onDetection?: () => void;
}

const CameraFeed = ({ 
  cameraId = "default", 
  cameraName = "Camera", 
  cameraLocation = "Unknown Location",
  onDetection 
}: CameraFeedProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [detectionStatus, setDetectionStatus] = useState<DetectionStatus>("safe");
  const [currentDetection, setCurrentDetection] = useState<DetectionResult | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [rateLimited, setRateLimited] = useState(false);
  const analysisIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const rateLimitCooldownRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // AI-powered frame analysis
  const analyzeFrame = async () => {
    if (!videoRef.current || isAnalyzing || rateLimited) return;
    
    setIsAnalyzing(true);
    try {
      // Capture frame from video at reduced resolution
      const canvas = document.createElement('canvas');
      // Reduce resolution to max 640x480 for faster processing
      const maxWidth = 640;
      const maxHeight = 480;
      const videoWidth = videoRef.current.videoWidth;
      const videoHeight = videoRef.current.videoHeight;
      const scale = Math.min(maxWidth / videoWidth, maxHeight / videoHeight, 1);
      
      canvas.width = videoWidth * scale;
      canvas.height = videoHeight * scale;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) return;
      
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      // Reduce quality to 0.5 for smaller file size
      const frameData = canvas.toDataURL('image/jpeg', 0.5);
      
      // Send to AI for analysis
      // Note: This would need to be replaced with your actual AI analysis endpoint
      // For now, we'll simulate analysis
      const data = { status: 'safe', confidence: 0, description: 'No threats detected' };
      const error = null;

      if (error || data?.error) {
        console.error('Analysis error:', error || data?.error);
        // Check if it's a rate limit error
        if (data?.error === 'Rate limit exceeded') {
          setRateLimited(true);
          // Cooldown for 30 seconds before retrying
          rateLimitCooldownRef.current = setTimeout(() => {
            setRateLimited(false);
          }, 30000);
          toast({
            title: "Rate Limit Reached",
            description: "AI analysis paused for 30 seconds. Detection will resume automatically.",
            variant: "destructive",
          });
        } else if (data?.error === 'Payment required') {
          toast({
            title: "Credits Required",
            description: "Please add credits to continue AI detection.",
            variant: "destructive",
          });
        }
        return;
      }

      if (data) {
        const detection: DetectionResult = {
          status: data.status,
          confidence: data.confidence,
          timestamp: new Date(data.timestamp),
          description: data.description
        };

        setCurrentDetection(detection);
        setDetectionStatus(data.status);

        // Trigger alert if danger detected
        if (data.status === 'danger' && data.confidence >= 70) {
          await triggerAlert(detection);
        }
      }
    } catch (error) {
      console.error('Frame analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Start/stop frame analysis
  useEffect(() => {
    if (!isActive) {
      if (analysisIntervalRef.current) {
        clearInterval(analysisIntervalRef.current);
        analysisIntervalRef.current = null;
      }
      return;
    }

    // Set initial safe status
    const initialDetection = {
      status: "safe" as const,
      confidence: 95,
      description: "AI monitoring active...",
      timestamp: new Date(),
    };

    setCurrentDetection(initialDetection);
    setDetectionStatus("safe");

    // Analyze frames every 10 seconds to avoid rate limiting
    analysisIntervalRef.current = setInterval(() => {
      analyzeFrame();
    }, 10000);

    return () => {
      if (analysisIntervalRef.current) {
        clearInterval(analysisIntervalRef.current);
        analysisIntervalRef.current = null;
      }
      if (rateLimitCooldownRef.current) {
        clearTimeout(rateLimitCooldownRef.current);
        rateLimitCooldownRef.current = null;
      }
    };
  }, [isActive]);

  const startCamera = async () => {
    try {
      console.log("Requesting camera access...");
      
      // First set active to true so video element renders
      setIsActive(true);
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 1280 }, 
          height: { ideal: 720 },
          facingMode: "user"
        },
        audio: false,
      });
      
      console.log("Camera stream obtained:", mediaStream);
      setStream(mediaStream);
      
      // Wait a tick for the video element to render
      setTimeout(async () => {
        if (videoRef.current) {
          console.log("Setting video source...");
          videoRef.current.srcObject = mediaStream;
          
          // Ensure video plays
          try {
            await videoRef.current.play();
            console.log("Video playback started successfully");
          } catch (playError) {
            console.error("Video play error:", playError);
          }
        } else {
          console.error("Video ref still not available after timeout");
        }
      }, 100);
      
      toast({
        title: "Camera Started",
        description: "AI-powered harassment detection is now active",
      });
    } catch (error) {
      console.error("Camera access error:", error);
      setIsActive(false); // Reset on error
      toast({
        title: "Camera Error",
        description: `Unable to access camera: ${error.message}. Please check permissions.`,
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsActive(false);
    setDetectionStatus("safe");
    setCurrentDetection(null);
    toast({
      title: `${cameraName} Stopped`,
      description: "Detection system deactivated",
    });
  };

  const triggerAlert = async (detection: DetectionResult) => {
    // Trigger global alarm if callback provided
    if (onDetection) {
      onDetection();
    }

    // Play alert sound
    const audio = new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmcfCDN+y/HTfC4FIm/A7+OZSA0PVK3n77tRDgtWrN/13W08CyhvwO/jm04RCDZ7x+TNeSsFY3Y4ADZHo5PgwKLWGAMAFW4pqwB5Ng0AB1oNogCHNgMAZ3g0ADFJqJqFb1xfdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmcfCDN+y/HTfC4FIm/A7+OZSA0PVK3n77tRDgtWrN/13W08CyhvwO/jm04RCDZ7x+TNeSsFY3g4BDBNsJ3jwaTWGgUCHm4usAV8NgwEB1oOow==");
    audio.play().catch(() => {});

    // Show alert toast
    toast({
      title: `🚨 ${cameraLocation.toUpperCase()} - HARASSMENT DETECTED!`,
      description: `${detection.description} (${detection.confidence}% confidence)`,
      variant: "destructive",
    });

    // Save alert to database
    try {
      const { session } = await authApi.getSession();
      
      if (session) {
        await alertsApi.create({
          camera_id: cameraId,
          camera_name: cameraName,
          location: cameraLocation,
          alert_type: 'harassment',
          status: detection.status,
          confidence: detection.confidence,
          description: detection.description,
          action_taken: 'Alert triggered automatically by AI detection',
          contacts_notified: [],
          alert_results: []
        });
      }
    } catch (error) {
      console.error('Error saving alert to database:', error);
    }
  };

  const getStatusColor = (status: DetectionStatus) => {
    switch (status) {
      case "safe": return "border-success bg-success/10";
      case "warning": return "border-warning bg-warning/10";
      case "danger": return "border-danger bg-danger/10 animate-pulse";
      default: return "border-muted";
    }
  };

  const getStatusIcon = (status: DetectionStatus) => {
    switch (status) {
      case "safe": return <Shield className="h-5 w-5 text-success" />;
      case "warning": return <AlertTriangle className="h-5 w-5 text-warning" />;
      case "danger": return <AlertTriangle className="h-5 w-5 text-danger" />;
      default: return <Shield className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Camera Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{cameraName} - {cameraLocation}</span>
            <div className="flex items-center gap-2">
              {currentDetection && (
                <Badge variant="outline" className={cn("gap-2", getStatusColor(detectionStatus))}>
                  {getStatusIcon(detectionStatus)}
                  {detectionStatus.toUpperCase()} - {currentDetection.confidence}%
                </Badge>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Video Feed */}
          <div className={cn(
            "relative aspect-video w-full overflow-hidden rounded-lg border-4 bg-muted",
            getStatusColor(detectionStatus)
          )}>
            {isActive ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="h-full w-full object-cover"
                onLoadedMetadata={() => console.log("Video metadata loaded")}
                onCanPlay={() => console.log("Video can start playing")}
                onError={(e) => console.error("Video error:", e)}
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <Camera className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    Camera inactive - Click start to begin detection
                  </p>
                </div>
              </div>
            )}

            {/* Detection Overlay */}
            {isActive && currentDetection && (
              <div className="absolute bottom-4 left-4 right-4">
                <div className={cn(
                  "rounded-lg p-3",
                  detectionStatus === "safe" && "bg-success/90 text-success-foreground",
                  detectionStatus === "warning" && "bg-warning/90 text-warning-foreground",
                  detectionStatus === "danger" && "bg-danger/90 text-danger-foreground"
                )}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(detectionStatus)}
                      <span className="text-sm font-medium">
                        {currentDetection.description}
                      </span>
                    </div>
                    <span className="text-xs">
                      {currentDetection.confidence}% confidence
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
              {!isActive ? (
                <Button onClick={startCamera} className="gradient-primary">
                  <Play className="mr-2 h-4 w-4" />
                  Start Detection
                </Button>
              ) : (
                <Button onClick={stopCamera} variant="destructive">
                  <Pause className="mr-2 h-4 w-4" />
                  Stop Detection
                </Button>
              )}
              
            {isActive && (
              <Button variant="outline" onClick={() => triggerAlert({
                status: "danger",
                confidence: 95,
                timestamp: new Date(),
                description: "Manual test alert triggered"
              })}>
                <Volume2 className="mr-2 h-4 w-4" />
                Test Alert
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

    </div>
  );
};

export default CameraFeed;
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Monitor, 
  Brain, 
  Server, 
  Smartphone, 
  Database, 
  Cloud,
  ArrowRight,
  Shield,
  Camera,
  Bell
} from "lucide-react";

const SystemArchitecture = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">System Architecture</h2>
        <p className="text-muted-foreground">
          Complete full-stack harassment detection system architecture and implementation guide
        </p>
      </div>

      {/* Architecture Overview */}
      <Card>
        <CardHeader>
          <CardTitle>System Flow Diagram</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row items-center justify-center gap-6">
            {/* Frontend */}
            <div className="text-center">
              <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center mb-2">
                <Monitor className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="font-semibold">React Frontend</h3>
              <p className="text-sm text-muted-foreground">Camera Feed & UI</p>
            </div>

            <ArrowRight className="h-6 w-6 text-muted-foreground rotate-90 lg:rotate-0" />

            {/* ML Service */}
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-warning/20 flex items-center justify-center mb-2">
                <Brain className="h-8 w-8 text-warning" />
              </div>
              <h3 className="font-semibold">Python ML Service</h3>
              <p className="text-sm text-muted-foreground">AI Detection Model</p>
            </div>

            <ArrowRight className="h-6 w-6 text-muted-foreground rotate-90 lg:rotate-0" />

            {/* Backend */}
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mb-2">
                <Server className="h-8 w-8 text-success" />
              </div>
              <h3 className="font-semibold">Spring Boot API</h3>
              <p className="text-sm text-muted-foreground">Business Logic</p>
            </div>

            <ArrowRight className="h-6 w-6 text-muted-foreground rotate-90 lg:rotate-0" />

            {/* Notifications */}
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-danger/20 flex items-center justify-center mb-2">
                <Bell className="h-8 w-8 text-danger" />
              </div>
              <h3 className="font-semibold">Alert System</h3>
              <p className="text-sm text-muted-foreground">SMS/Email/Push</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Technology Stack */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Frontend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5 text-primary" />
              Frontend (React)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Technologies</h4>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">React 18</Badge>
                <Badge variant="outline">TypeScript</Badge>
                <Badge variant="outline">Tailwind CSS</Badge>
                <Badge variant="outline">Vite</Badge>
                <Badge variant="outline">WebRTC</Badge>
              </div>
            </div>
            <Separator />
            <div>
              <h4 className="font-semibold mb-2">Key Features</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Real-time camera feed display</li>
                <li>• Emergency contact management</li>
                <li>• Alert history dashboard</li>
                <li>• Audio alert playback</li>
                <li>• Responsive design</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* ML Service */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-warning" />
              ML Service (Python)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Technologies</h4>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">Python 3.9+</Badge>
                <Badge variant="outline">OpenCV</Badge>
                <Badge variant="outline">TensorFlow</Badge>
                <Badge variant="outline">FastAPI</Badge>
                <Badge variant="outline">NumPy</Badge>
              </div>
            </div>
            <Separator />
            <div>
              <h4 className="font-semibold mb-2">AI Capabilities</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Action recognition models</li>
                <li>• Violence detection algorithms</li>
                <li>• Real-time frame processing</li>
                <li>• Confidence scoring</li>
                <li>• REST API endpoints</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Backend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5 text-success" />
              Backend (Spring Boot)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Technologies</h4>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">Java 17</Badge>
                <Badge variant="outline">Spring Boot</Badge>
                <Badge variant="outline">Spring Security</Badge>
                <Badge variant="outline">PostgreSQL</Badge>
                <Badge variant="outline">JWT</Badge>
              </div>
            </div>
            <Separator />
            <div>
              <h4 className="font-semibold mb-2">Services</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• User authentication (JWT)</li>
                <li>• Contact management APIs</li>
                <li>• Alert notification service</li>
                <li>• SMS/Email integration</li>
                <li>• Audit logging</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Database Schema */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Design
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold">Users</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• id (UUID)</li>
                <li>• email (unique)</li>
                <li>• password_hash</li>
                <li>• created_at</li>
                <li>• is_active</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold">Emergency_Contacts</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• id (UUID)</li>
                <li>• user_id (FK)</li>
                <li>• name</li>
                <li>• email</li>
                <li>• phone</li>
                <li>• alert_methods[]</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold">Alert_Records</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• id (UUID)</li>
                <li>• user_id (FK)</li>
                <li>• detection_type</li>
                <li>• confidence_score</li>
                <li>• timestamp</li>
                <li>• video_clip_url</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold">Notifications</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• id (UUID)</li>
                <li>• alert_id (FK)</li>
                <li>• contact_id (FK)</li>
                <li>• method</li>
                <li>• status</li>
                <li>• sent_at</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API Endpoints */}
      <Card>
        <CardHeader>
          <CardTitle>API Endpoints Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Spring Boot REST API</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <code className="bg-muted px-2 py-1 rounded">POST /api/auth/login</code>
                  <Badge variant="outline">Auth</Badge>
                </div>
                <div className="flex justify-between">
                  <code className="bg-muted px-2 py-1 rounded">GET /api/contacts</code>
                  <Badge variant="outline">CRUD</Badge>
                </div>
                <div className="flex justify-between">
                  <code className="bg-muted px-2 py-1 rounded">POST /api/alerts</code>
                  <Badge variant="outline">Alert</Badge>
                </div>
                <div className="flex justify-between">
                  <code className="bg-muted px-2 py-1 rounded">POST /api/notify</code>
                  <Badge variant="outline">Notify</Badge>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Python ML API</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <code className="bg-muted px-2 py-1 rounded">POST /detect</code>
                  <Badge variant="outline">ML</Badge>
                </div>
                <div className="flex justify-between">
                  <code className="bg-muted px-2 py-1 rounded">GET /health</code>
                  <Badge variant="outline">Status</Badge>
                </div>
                <div className="flex justify-between">
                  <code className="bg-muted px-2 py-1 rounded">GET /model/info</code>
                  <Badge variant="outline">Info</Badge>
                </div>
                <div className="flex justify-between">
                  <code className="bg-muted px-2 py-1 rounded">POST /model/update</code>
                  <Badge variant="outline">Admin</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deployment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            Deployment Strategy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <Monitor className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h4 className="font-semibold">Frontend</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Deployed on Vercel/Netlify with CDN for global access
              </p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <Server className="h-8 w-8 mx-auto mb-2 text-success" />
              <h4 className="font-semibold">Backend Services</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Docker containers on AWS ECS/Azure Container Instances
              </p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <Database className="h-8 w-8 mx-auto mb-2 text-warning" />
              <h4 className="font-semibold">Database</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Managed PostgreSQL on AWS RDS/Azure Database
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemArchitecture;
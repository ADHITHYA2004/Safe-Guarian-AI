import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Edit, Trash2, Mail, Phone, MessageCircle, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { authApi, contactsApi } from "@/lib/api";

interface Friend {
  id: string;
  name: string;
  email: string;
  phone: string;
  relationship: string;
  isActive: boolean;
  alertMethods: ("email" | "sms" | "push")[];
}

const FriendsManager = () => {
  const navigate = useNavigate();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFriend, setEditingFriend] = useState<Friend | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    relationship: "",
    alertMethods: [] as ("email" | "sms" | "push")[],
  });

  const { toast } = useToast();

  useEffect(() => {
    checkAuthAndFetchContacts();
  }, [navigate]);

  const checkAuthAndFetchContacts = async () => {
    try {
      const { session } = await authApi.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      await fetchContacts();
    } catch (error) {
      navigate("/auth");
    }
  };

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const data = await contactsApi.getAll();
      setFriends(data.map(contact => ({
        id: contact.id,
        name: contact.name,
        email: contact.email,
        phone: contact.phone,
        relationship: contact.relationship,
        isActive: contact.is_active,
        alertMethods: contact.alert_methods as ("email" | "sms" | "push")[],
      })));
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load contacts",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveFriend = async () => {
    if (!formData.name || !formData.email) {
      toast({
        title: "Validation Error",
        description: "Name and email are required",
        variant: "destructive",
      });
      return;
    }

    try {
      const contactData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        relationship: formData.relationship || "Friend",
        alert_methods: formData.alertMethods.length > 0 ? formData.alertMethods : ["email"],
      };

      if (editingFriend) {
        await contactsApi.update(editingFriend.id, contactData);
        toast({
          title: "Contact Updated",
          description: `${contactData.name} has been updated successfully`,
        });
      } else {
        await contactsApi.create(contactData);
        toast({
          title: "Contact Added",
          description: `${contactData.name} has been added to your emergency contacts`,
        });
      }
      await fetchContacts();
      resetForm();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save contact",
        variant: "destructive",
      });
      console.error(error);
    }
  };

  const handleEditFriend = (friend: Friend) => {
    setEditingFriend(friend);
    setFormData({
      name: friend.name,
      email: friend.email,
      phone: friend.phone,
      relationship: friend.relationship,
      alertMethods: friend.alertMethods,
    });
    setIsDialogOpen(true);
  };

  const handleDeleteFriend = async (friendId: string) => {
    const friend = friends.find(f => f.id === friendId);
    
    try {
      await contactsApi.delete(friendId);
      toast({
        title: "Contact Removed",
        description: `${friend?.name} has been removed from your emergency contacts`,
      });
      await fetchContacts();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete contact",
        variant: "destructive",
      });
      console.error(error);
    }
  };

  const toggleFriendStatus = async (friendId: string) => {
    const friend = friends.find(f => f.id === friendId);
    if (!friend) return;

    try {
      await contactsApi.update(friendId, { is_active: !friend.isActive });
      toast({
        title: "Status Updated",
        description: `${friend.name} is now ${!friend.isActive ? "active" : "inactive"}`,
      });
      await fetchContacts();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update status",
        variant: "destructive",
      });
      console.error(error);
    }
  };

  const handleSignOut = async () => {
    authApi.signOut();
    toast({
      title: "Signed Out",
      description: "You have been signed out successfully",
    });
    navigate("/auth");
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      relationship: "",
      alertMethods: [],
    });
    setEditingFriend(null);
    setIsDialogOpen(false);
  };

  const toggleAlertMethod = (method: "email" | "sms" | "push") => {
    setFormData(prev => ({
      ...prev,
      alertMethods: prev.alertMethods.includes(method)
        ? prev.alertMethods.filter(m => m !== method)
        : [...prev.alertMethods, method]
    }));
  };

  const getMethodIcon = (method: "email" | "sms" | "push") => {
    switch (method) {
      case "email": return <Mail className="h-3 w-3" />;
      case "sms": return <MessageCircle className="h-3 w-3" />;
      case "push": return <Phone className="h-3 w-3" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">Loading contacts...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Emergency Contacts</h2>
          <p className="text-muted-foreground">
            Manage people who will be notified during harassment detection alerts
          </p>
        </div>
        
        <div className="flex gap-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="mr-2 h-4 w-4" />
                Add Contact
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingFriend ? "Edit Contact" : "Add Emergency Contact"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter contact name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter email address"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Enter phone number"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="relationship">Relationship</Label>
                  <Input
                    id="relationship"
                    value={formData.relationship}
                    onChange={(e) => setFormData(prev => ({ ...prev, relationship: e.target.value }))}
                    placeholder="e.g., Friend, Family, Partner"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Alert Methods</Label>
                  <div className="flex gap-2">
                    {(["email", "sms", "push"] as const).map(method => (
                      <Button
                        key={method}
                        type="button"
                        variant={formData.alertMethods.includes(method) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleAlertMethod(method)}
                        className="gap-1"
                      >
                        {getMethodIcon(method)}
                        {method.toUpperCase()}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button onClick={handleSaveFriend} className="flex-1">
                    {editingFriend ? "Update Contact" : "Add Contact"}
                  </Button>
                  <Button variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Contacts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {friends.map((friend) => (
          <Card key={friend.id} className={`${!friend.isActive ? "opacity-50" : ""}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{friend.name}</CardTitle>
                <Badge variant={friend.isActive ? "default" : "secondary"}>
                  {friend.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{friend.relationship}</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-3 w-3 text-muted-foreground" />
                  <span className="truncate">{friend.email}</span>
                </div>
                {friend.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-3 w-3 text-muted-foreground" />
                    <span>{friend.phone}</span>
                  </div>
                )}
              </div>
              
              <div className="flex flex-wrap gap-1">
                {friend.alertMethods.map(method => (
                  <Badge key={method} variant="outline" className="gap-1">
                    {getMethodIcon(method)}
                    {method}
                  </Badge>
                ))}
              </div>
              
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditFriend(friend)}
                  className="flex-1"
                >
                  <Edit className="mr-1 h-3 w-3" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleFriendStatus(friend.id)}
                >
                  {friend.isActive ? "Disable" : "Enable"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteFriend(friend.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {friends.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="mx-auto w-fit rounded-full bg-muted p-3">
              <Plus className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">No Emergency Contacts</h3>
            <p className="text-muted-foreground">
              Add emergency contacts to receive alerts when harassment is detected
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FriendsManager;
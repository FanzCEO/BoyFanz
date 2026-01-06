import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserX, Search, Plus, Trash2 } from "lucide-react";

export default function Restricted() {
  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8">
      <div className="flex items-center gap-3 mb-8">
        <UserX className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Restricted Users</h1>
          <p className="text-muted-foreground">Manage blocked and restricted users</p>
        </div>
      </div>

      {/* Add User */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Block a User</CardTitle>
          <CardDescription>Search for a user to add them to your block list</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Enter username..." className="pl-9" />
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" /> Block
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Blocked Users */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Blocked Users</CardTitle>
          <CardDescription>These users cannot view your profile or interact with you</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <UserX className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No blocked users</p>
            <p className="text-sm">Users you block will appear here</p>
          </div>
        </CardContent>
      </Card>

      {/* Restricted Users */}
      <Card>
        <CardHeader>
          <CardTitle>Restricted Users</CardTitle>
          <CardDescription>
            Restricted users can see your public content but cannot message you or see your stories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <UserX className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No restricted users</p>
            <p className="text-sm">Users you restrict will appear here</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

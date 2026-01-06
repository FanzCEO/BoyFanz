import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Plus, Image, Video, Eye, Trash2 } from "lucide-react";

export default function Stories() {
  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Clock className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">My Stories</h1>
            <p className="text-muted-foreground">Stories disappear after 24 hours</p>
          </div>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" /> Create Story
        </Button>
      </div>

      {/* Create Story Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="cursor-pointer hover:border-primary transition-colors">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Image className="h-6 w-6 text-primary" />
            </div>
            <p className="font-medium">Photo Story</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-primary transition-colors">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Video className="h-6 w-6 text-primary" />
            </div>
            <p className="font-medium">Video Story</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Stories */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Active Stories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No active stories</p>
            <p className="text-sm">Create a story to share with your fans</p>
          </div>
        </CardContent>
      </Card>

      {/* Story Archive */}
      <Card>
        <CardHeader>
          <CardTitle>Story Archive</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <p>Your expired stories will appear here</p>
            <p className="text-sm">You can repost them as regular content</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Code, AlertTriangle, Save, RotateCcw } from "lucide-react";

export default function CustomCodeEditor() {
  const { toast } = useToast();
  const [customCSS, setCustomCSS] = useState("");
  const [customJS, setCustomJS] = useState("");

  const handleSaveCSS = () => {
    // TODO: Implement API call to save custom CSS
    toast({
      title: "Custom CSS Saved",
      description: "Your custom CSS has been applied to the platform.",
    });
  };

  const handleSaveJS = () => {
    // TODO: Implement API call to save custom JavaScript
    toast({
      title: "Custom JavaScript Saved",
      description: "Your custom JavaScript has been applied to the platform.",
    });
  };

  const handleResetCSS = () => {
    setCustomCSS("");
    toast({
      title: "CSS Reset",
      description: "Custom CSS has been cleared.",
      variant: "destructive",
    });
  };

  const handleResetJS = () => {
    setCustomJS("");
    toast({
      title: "JavaScript Reset",
      description: "Custom JavaScript has been cleared.",
      variant: "destructive",
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-cyan-400 flex items-center gap-2">
          <Code className="h-8 w-8" />
          Custom Code Editor
        </h1>
        <p className="text-gray-400 mt-2">Add custom CSS and JavaScript to the platform</p>
      </div>

      <Alert className="bg-yellow-900/20 border-yellow-500/30">
        <AlertTriangle className="h-4 w-4 text-yellow-500" />
        <AlertDescription className="text-yellow-200">
          Warning: Custom code can affect platform functionality. Test thoroughly before deploying to production.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="css" className="space-y-6">
        <TabsList className="bg-gray-900 border border-cyan-500/20">
          <TabsTrigger value="css">Custom CSS</TabsTrigger>
          <TabsTrigger value="javascript">Custom JavaScript</TabsTrigger>
        </TabsList>

        <TabsContent value="css" className="space-y-4">
          <Card className="bg-gray-900 border-cyan-500/20">
            <CardHeader>
              <CardTitle className="text-cyan-400">Custom CSS Code</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={customCSS}
                onChange={(e) => setCustomCSS(e.target.value)}
                placeholder="/* Enter your custom CSS here */&#10;.my-custom-class {&#10;  color: #00e5ff;&#10;  font-weight: bold;&#10;}"
                className="font-mono text-sm bg-gray-800 border-cyan-500/20 min-h-[400px]"
              />
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={handleResetCSS}
                  className="border-cyan-500/20 text-gray-400 hover:text-white"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
                <Button
                  onClick={handleSaveCSS}
                  className="bg-gradient-to-r from-cyan-500 to-blue-500"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save CSS
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="javascript" className="space-y-4">
          <Card className="bg-gray-900 border-cyan-500/20">
            <CardHeader>
              <CardTitle className="text-cyan-400">Custom JavaScript Code</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="bg-red-900/20 border-red-500/30">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <AlertDescription className="text-red-200">
                  Custom JavaScript can pose security risks. Only add code from trusted sources and validate all inputs.
                </AlertDescription>
              </Alert>
              <Textarea
                value={customJS}
                onChange={(e) => setCustomJS(e.target.value)}
                placeholder="// Enter your custom JavaScript here&#10;(function() {&#10;  console.log('Custom JS loaded');&#10;})();"
                className="font-mono text-sm bg-gray-800 border-cyan-500/20 min-h-[400px]"
              />
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={handleResetJS}
                  className="border-cyan-500/20 text-gray-400 hover:text-white"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
                <Button
                  onClick={handleSaveJS}
                  className="bg-gradient-to-r from-cyan-500 to-blue-500"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save JavaScript
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="bg-gray-900 border-cyan-500/20">
        <CardHeader>
          <CardTitle className="text-cyan-400">Usage Guidelines</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-gray-400">
          <p>• CSS code will be injected into the platform's stylesheet</p>
          <p>• JavaScript code will execute after DOM content is loaded</p>
          <p>• Use the BoyFanz theme variable: --cyan-primary: #00e5ff</p>
          <p>• Test changes in a development environment first</p>
          <p>• Avoid conflicting with existing platform styles and scripts</p>
        </CardContent>
      </Card>
    </div>
  );
}

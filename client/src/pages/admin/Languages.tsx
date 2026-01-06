import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Globe, Plus, Edit, Trash2, CheckCircle, Download, Upload } from "lucide-react";

export default function Languages() {
  const { toast } = useToast();
  const [languages, setLanguages] = useState([
    { code: "en", name: "English", enabled: true, default: true, progress: 100 },
    { code: "es", name: "Spanish", enabled: true, default: false, progress: 85 },
    { code: "fr", name: "French", enabled: false, default: false, progress: 60 },
    { code: "de", name: "German", enabled: false, default: false, progress: 45 },
    { code: "pt", name: "Portuguese", enabled: true, default: false, progress: 92 },
  ]);

  const handleToggleLanguage = (code: string) => {
    setLanguages(languages.map(lang =>
      lang.code === code ? { ...lang, enabled: !lang.enabled } : lang
    ));
    toast({
      title: "Language Updated",
      description: `Language has been ${languages.find(l => l.code === code)?.enabled ? 'disabled' : 'enabled'}.`,
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-cyan-400 flex items-center gap-2">
            <Globe className="h-8 w-8" />
            Languages & Localization
          </h1>
          <p className="text-gray-400 mt-2">Manage platform languages and translations</p>
        </div>
        <Button className="bg-gradient-to-r from-cyan-500 to-blue-500">
          <Plus className="h-4 w-4 mr-2" />
          Add Language
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-900 border-cyan-500/20">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-cyan-400">5</div>
            <p className="text-gray-400">Available Languages</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-900 border-cyan-500/20">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-green-400">3</div>
            <p className="text-gray-400">Active Languages</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-900 border-cyan-500/20">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-cyan-400">76.4%</div>
            <p className="text-gray-400">Avg. Translation</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-900 border-cyan-500/20">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-yellow-400">124</div>
            <p className="text-gray-400">Missing Keys</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="languages" className="space-y-6">
        <TabsList className="bg-gray-900 border border-cyan-500/20">
          <TabsTrigger value="languages">Languages</TabsTrigger>
          <TabsTrigger value="translations">Translations</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="languages" className="space-y-4">
          <Card className="bg-gray-900 border-cyan-500/20">
            <CardHeader>
              <CardTitle className="text-cyan-400">Available Languages</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-cyan-500/20">
                    <TableHead>Language</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Default</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {languages.map((lang) => (
                    <TableRow key={lang.code} className="border-cyan-500/10">
                      <TableCell className="font-medium">{lang.name}</TableCell>
                      <TableCell className="uppercase">{lang.code}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-cyan-500"
                              style={{ width: `${lang.progress}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-400">{lang.progress}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={lang.enabled ? "default" : "secondary"} className={lang.enabled ? "bg-green-500" : ""}>
                          {lang.enabled ? "Enabled" : "Disabled"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {lang.default && <CheckCircle className="h-4 w-4 text-cyan-400" />}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-cyan-500/20"
                            onClick={() => handleToggleLanguage(lang.code)}
                          >
                            {lang.enabled ? "Disable" : "Enable"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-cyan-500/20"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="translations" className="space-y-4">
          <Card className="bg-gray-900 border-cyan-500/20">
            <CardHeader>
              <CardTitle className="text-cyan-400">Translation Keys</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Search translation keys..."
                    className="bg-gray-800 border-cyan-500/20"
                  />
                  <Button className="bg-gradient-to-r from-cyan-500 to-blue-500">
                    Search
                  </Button>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow className="border-cyan-500/20">
                      <TableHead>Key</TableHead>
                      <TableHead>English</TableHead>
                      <TableHead>Spanish</TableHead>
                      <TableHead>Portuguese</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className="border-cyan-500/10">
                      <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                        Select a language to view translations
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card className="bg-gray-900 border-cyan-500/20">
            <CardHeader>
              <CardTitle className="text-cyan-400">Localization Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Auto-detect User Language</Label>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label>Allow User Language Override</Label>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label>Show Language Selector</Label>
                <Switch defaultChecked />
              </div>
              <div>
                <Label>Default Language</Label>
                <select className="w-full mt-2 p-2 bg-gray-800 border border-cyan-500/20 rounded-md">
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="pt">Portuguese</option>
                </select>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-cyan-500/20">
            <CardHeader>
              <CardTitle className="text-cyan-400">Import/Export</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button variant="outline" className="border-cyan-500/20">
                  <Download className="h-4 w-4 mr-2" />
                  Export Translations
                </Button>
                <Button variant="outline" className="border-cyan-500/20">
                  <Upload className="h-4 w-4 mr-2" />
                  Import Translations
                </Button>
              </div>
              <p className="text-sm text-gray-500">
                Export and import translation files in JSON format
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

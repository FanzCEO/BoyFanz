/**
 * FanzEditor Demo Page
 *
 * Demonstrates all features of the FanzEditor component
 */

import React, { useRef, useState } from 'react';
import { FanzEditor, FanzEditorRef } from './FanzEditor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const EditorDemo: React.FC = () => {
  const editorRef = useRef<FanzEditorRef>(null);
  const [htmlOutput, setHtmlOutput] = useState('');
  const [jsonOutput, setJsonOutput] = useState('');

  // Simulated image upload (replace with your actual S3 upload)
  const handleImageUpload = async (file: File): Promise<string> => {
    // Simulate upload delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // In production, upload to S3 and return the URL
    // For demo, create a local object URL
    return URL.createObjectURL(file);
  };

  // Simulated mention suggestions (replace with your actual user search)
  const handleMentionSuggestions = async (query: string) => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    // In production, search your users database
    const mockUsers = [
      { id: '1', label: 'JohnDoe' },
      { id: '2', label: 'JaneSmith' },
      { id: '3', label: 'BobWilson' },
      { id: '4', label: 'AliceJohnson' },
      { id: '5', label: 'CharlieGreen' },
    ];

    return mockUsers.filter((user) =>
      user.label.toLowerCase().includes(query.toLowerCase())
    );
  };

  const handleGetContent = () => {
    if (editorRef.current) {
      setHtmlOutput(editorRef.current.getHTML());
      setJsonOutput(JSON.stringify(editorRef.current.getJSON(), null, 2));
    }
  };

  const handleClearEditor = () => {
    editorRef.current?.clearContent();
    setHtmlOutput('');
    setJsonOutput('');
  };

  const handleInsertSampleContent = () => {
    editorRef.current?.setContent(`
      <h1>Welcome to FanzEditor</h1>
      <p>This is a <strong>full-featured</strong> rich text editor built on <a href="https://tiptap.dev">Tiptap</a>.</p>

      <h2>Features</h2>
      <ul>
        <li>Rich text formatting (bold, italic, underline, etc.)</li>
        <li>Tables with advanced features</li>
        <li>Media embedding (images, videos, YouTube)</li>
        <li>@mentions for users</li>
        <li>Code blocks with syntax highlighting</li>
        <li>Export to HTML/JSON</li>
      </ul>

      <h2>Code Example</h2>
      <pre><code class="language-typescript">const editor = useEditor({
  extensions: [StarterKit, Image, Table],
  content: 'Hello World!',
});</code></pre>

      <blockquote>
        <p>This editor is completely free with no API keys, no load limits, and no subscription fees.</p>
      </blockquote>

      <table>
        <tr>
          <th>Feature</th>
          <th>TinyMCE</th>
          <th>FanzEditor</th>
        </tr>
        <tr>
          <td>Price</td>
          <td>$0-$180/mo</td>
          <td>Free forever</td>
        </tr>
        <tr>
          <td>API Key Required</td>
          <td>Yes</td>
          <td>No</td>
        </tr>
        <tr>
          <td>Load Limits</td>
          <td>1000/mo free</td>
          <td>Unlimited</td>
        </tr>
      </table>
    `);
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold">FanzEditor</h1>
        <p className="text-muted-foreground">
          A full-featured rich text editor with zero subscription fees
        </p>
      </div>

      <div className="flex justify-center gap-4">
        <Button onClick={handleInsertSampleContent}>
          Load Sample Content
        </Button>
        <Button variant="outline" onClick={handleGetContent}>
          Get Content
        </Button>
        <Button variant="destructive" onClick={handleClearEditor}>
          Clear Editor
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Editor</CardTitle>
          <CardDescription>
            Try out all the features - formatting, tables, images, videos, and more!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FanzEditor
            ref={editorRef}
            placeholder="Start typing your amazing content..."
            onHTMLChange={setHtmlOutput}
            onImageUpload={handleImageUpload}
            mentionSuggestions={handleMentionSuggestions}
            characterLimit={10000}
            showCharacterCount
            showWordCount
            minHeight="300px"
            maxHeight="500px"
          />
        </CardContent>
      </Card>

      <Tabs defaultValue="html">
        <TabsList>
          <TabsTrigger value="html">HTML Output</TabsTrigger>
          <TabsTrigger value="json">JSON Output</TabsTrigger>
        </TabsList>
        <TabsContent value="html">
          <Card>
            <CardHeader>
              <CardTitle>HTML Output</CardTitle>
              <CardDescription>
                The raw HTML generated by the editor
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-96 text-sm">
                <code>{htmlOutput || 'Editor is empty...'}</code>
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="json">
          <Card>
            <CardHeader>
              <CardTitle>JSON Output</CardTitle>
              <CardDescription>
                The ProseMirror document structure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-96 text-sm">
                <code>{jsonOutput || 'Editor is empty...'}</code>
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Usage Example</CardTitle>
          <CardDescription>
            How to use FanzEditor in your components
          </CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">
            <code>{`import { FanzEditor, FanzEditorRef } from '@/components/editor';

function MyComponent() {
  const editorRef = useRef<FanzEditorRef>(null);

  const handleSave = () => {
    const html = editorRef.current?.getHTML();
    const json = editorRef.current?.getJSON();
    // Save to your backend
  };

  const handleImageUpload = async (file: File) => {
    // Upload to S3 and return URL
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    const { url } = await response.json();
    return url;
  };

  return (
    <FanzEditor
      ref={editorRef}
      placeholder="Write something..."
      onImageUpload={handleImageUpload}
      characterLimit={5000}
      showCharacterCount
    />
  );
}`}</code>
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Comparison: TinyMCE vs FanzEditor</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted">
                  <th className="border border-border p-3 text-left">Feature</th>
                  <th className="border border-border p-3 text-left">TinyMCE</th>
                  <th className="border border-border p-3 text-left">FanzEditor</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-border p-3">License</td>
                  <td className="border border-border p-3">GPL-2 + Paid</td>
                  <td className="border border-border p-3 text-green-500">MIT (Free)</td>
                </tr>
                <tr>
                  <td className="border border-border p-3">Monthly Cost</td>
                  <td className="border border-border p-3">$0-$180/mo</td>
                  <td className="border border-border p-3 text-green-500">$0 forever</td>
                </tr>
                <tr>
                  <td className="border border-border p-3">API Key Required</td>
                  <td className="border border-border p-3">Yes</td>
                  <td className="border border-border p-3 text-green-500">No</td>
                </tr>
                <tr>
                  <td className="border border-border p-3">Load Limits</td>
                  <td className="border border-border p-3">1000/mo free</td>
                  <td className="border border-border p-3 text-green-500">Unlimited</td>
                </tr>
                <tr>
                  <td className="border border-border p-3">Tables</td>
                  <td className="border border-border p-3">Paid plugin</td>
                  <td className="border border-border p-3 text-green-500">Free</td>
                </tr>
                <tr>
                  <td className="border border-border p-3">Media Embed</td>
                  <td className="border border-border p-3">Paid plugin</td>
                  <td className="border border-border p-3 text-green-500">Free</td>
                </tr>
                <tr>
                  <td className="border border-border p-3">Mentions</td>
                  <td className="border border-border p-3">Paid plugin</td>
                  <td className="border border-border p-3 text-green-500">Free</td>
                </tr>
                <tr>
                  <td className="border border-border p-3">Spell Check</td>
                  <td className="border border-border p-3">Paid plugin</td>
                  <td className="border border-border p-3 text-green-500">Browser native</td>
                </tr>
                <tr>
                  <td className="border border-border p-3">Source Control</td>
                  <td className="border border-border p-3">Cloud only</td>
                  <td className="border border-border p-3 text-green-500">Full ownership</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditorDemo;

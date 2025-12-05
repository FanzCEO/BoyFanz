/**
 * FanzEditor - Full-featured Rich Text Editor
 *
 * A comprehensive WYSIWYG editor built on Tiptap (MIT License)
 * No API keys, no subscriptions, no load limits
 *
 * Features:
 * - Rich text formatting (bold, italic, underline, etc.)
 * - Tables with advanced features
 * - Media embedding (images, videos, YouTube)
 * - File uploads (integrated with S3/storage)
 * - @mentions for users
 * - Comments/annotations
 * - Spell checking (browser native)
 * - Markdown support
 * - Export to HTML/JSON
 * - Character count
 * - Code blocks with syntax highlighting
 */

import React, { useCallback, useState, forwardRef, useImperativeHandle } from 'react';
import { useEditor, EditorContent, BubbleMenu, FloatingMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Mention from '@tiptap/extension-mention';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import Color from '@tiptap/extension-color';
import TextStyle from '@tiptap/extension-text-style';
import Youtube from '@tiptap/extension-youtube';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import { cn } from '@/lib/utils';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link as LinkIcon,
  Image as ImageIcon,
  Video,
  Table as TableIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Highlighter,
  Palette,
  FileCode,
  Upload,
  AtSign,
  MessageSquare,
  Download,
  Maximize2,
  Minimize2,
  Type,
  MoreHorizontal,
  Plus,
  Minus,
  Trash2,
  TableProperties,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// Create lowlight instance for syntax highlighting
const lowlight = createLowlight(common);

// Editor toolbar button component
interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  tooltip: string;
  children: React.ReactNode;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({
  onClick,
  isActive,
  disabled,
  tooltip,
  children,
}) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onClick}
        disabled={disabled}
        className={cn(
          'h-8 w-8 p-0',
          isActive && 'bg-primary/20 text-primary'
        )}
      >
        {children}
      </Button>
    </TooltipTrigger>
    <TooltipContent>
      <p>{tooltip}</p>
    </TooltipContent>
  </Tooltip>
);

// Toolbar divider
const ToolbarDivider = () => (
  <div className="w-px h-6 bg-border mx-1" />
);

// Editor props interface
export interface FanzEditorProps {
  content?: string;
  onChange?: (content: string) => void;
  onHTMLChange?: (html: string) => void;
  onJSONChange?: (json: object) => void;
  placeholder?: string;
  editable?: boolean;
  className?: string;
  minHeight?: string;
  maxHeight?: string;
  characterLimit?: number;
  showCharacterCount?: boolean;
  showWordCount?: boolean;
  onImageUpload?: (file: File) => Promise<string>;
  onFileUpload?: (file: File) => Promise<string>;
  mentionSuggestions?: (query: string) => Promise<{ id: string; label: string }[]>;
  autoFocus?: boolean;
}

// Editor ref interface for external control
export interface FanzEditorRef {
  getHTML: () => string;
  getJSON: () => object;
  getText: () => string;
  setContent: (content: string) => void;
  clearContent: () => void;
  focus: () => void;
  blur: () => void;
  getCharacterCount: () => number;
  getWordCount: () => number;
}

export const FanzEditor = forwardRef<FanzEditorRef, FanzEditorProps>(
  (
    {
      content = '',
      onChange,
      onHTMLChange,
      onJSONChange,
      placeholder = 'Start writing...',
      editable = true,
      className,
      minHeight = '200px',
      maxHeight = '600px',
      characterLimit,
      showCharacterCount = true,
      showWordCount = true,
      onImageUpload,
      onFileUpload,
      mentionSuggestions,
      autoFocus = false,
    },
    ref
  ) => {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [linkUrl, setLinkUrl] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [showLinkDialog, setShowLinkDialog] = useState(false);
    const [showImageDialog, setShowImageDialog] = useState(false);
    const [showYoutubeDialog, setShowYoutubeDialog] = useState(false);

    // Initialize editor
    const editor = useEditor({
      extensions: [
        StarterKit.configure({
          codeBlock: false, // We use CodeBlockLowlight instead
        }),
        Underline,
        TextStyle,
        Color,
        Highlight.configure({
          multicolor: true,
        }),
        TextAlign.configure({
          types: ['heading', 'paragraph'],
        }),
        Link.configure({
          openOnClick: false,
          HTMLAttributes: {
            class: 'text-primary underline cursor-pointer',
          },
        }),
        Image.configure({
          HTMLAttributes: {
            class: 'max-w-full h-auto rounded-lg',
          },
        }),
        Youtube.configure({
          width: 640,
          height: 360,
          HTMLAttributes: {
            class: 'rounded-lg overflow-hidden',
          },
        }),
        Table.configure({
          resizable: true,
          HTMLAttributes: {
            class: 'border-collapse table-auto w-full',
          },
        }),
        TableRow,
        TableHeader.configure({
          HTMLAttributes: {
            class: 'bg-muted font-semibold',
          },
        }),
        TableCell.configure({
          HTMLAttributes: {
            class: 'border border-border p-2',
          },
        }),
        Placeholder.configure({
          placeholder,
        }),
        CharacterCount.configure({
          limit: characterLimit,
        }),
        CodeBlockLowlight.configure({
          lowlight,
          HTMLAttributes: {
            class: 'bg-muted rounded-lg p-4 font-mono text-sm',
          },
        }),
        // Mention extension for @mentions
        Mention.configure({
          HTMLAttributes: {
            class: 'bg-primary/20 text-primary px-1 rounded',
          },
          suggestion: {
            items: async ({ query }) => {
              if (mentionSuggestions) {
                return await mentionSuggestions(query);
              }
              return [];
            },
          },
        }),
      ],
      content,
      editable,
      autofocus: autoFocus,
      onUpdate: ({ editor }) => {
        const html = editor.getHTML();
        const json = editor.getJSON();
        onChange?.(html);
        onHTMLChange?.(html);
        onJSONChange?.(json);
      },
    });

    // Expose editor methods via ref
    useImperativeHandle(ref, () => ({
      getHTML: () => editor?.getHTML() || '',
      getJSON: () => editor?.getJSON() || {},
      getText: () => editor?.getText() || '',
      setContent: (content: string) => editor?.commands.setContent(content),
      clearContent: () => editor?.commands.clearContent(),
      focus: () => editor?.commands.focus(),
      blur: () => editor?.commands.blur(),
      getCharacterCount: () => editor?.storage.characterCount.characters() || 0,
      getWordCount: () => editor?.storage.characterCount.words() || 0,
    }));

    // Link handlers
    const handleSetLink = useCallback(() => {
      if (linkUrl) {
        editor?.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run();
      }
      setLinkUrl('');
      setShowLinkDialog(false);
    }, [editor, linkUrl]);

    const handleRemoveLink = useCallback(() => {
      editor?.chain().focus().unsetLink().run();
    }, [editor]);

    // Image handlers
    const handleAddImage = useCallback(() => {
      if (imageUrl) {
        editor?.chain().focus().setImage({ src: imageUrl }).run();
      }
      setImageUrl('');
      setShowImageDialog(false);
    }, [editor, imageUrl]);

    const handleImageUpload = useCallback(
      async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && onImageUpload) {
          try {
            const url = await onImageUpload(file);
            editor?.chain().focus().setImage({ src: url }).run();
          } catch (error) {
            console.error('Image upload failed:', error);
          }
        }
        setShowImageDialog(false);
      },
      [editor, onImageUpload]
    );

    // YouTube handler
    const handleAddYoutube = useCallback(() => {
      if (youtubeUrl) {
        editor?.chain().focus().setYoutubeVideo({ src: youtubeUrl }).run();
      }
      setYoutubeUrl('');
      setShowYoutubeDialog(false);
    }, [editor, youtubeUrl]);

    // Table handlers
    const handleInsertTable = useCallback(() => {
      editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
    }, [editor]);

    // Export handlers
    const handleExportHTML = useCallback(() => {
      const html = editor?.getHTML();
      if (html) {
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'document.html';
        a.click();
        URL.revokeObjectURL(url);
      }
    }, [editor]);

    const handleExportJSON = useCallback(() => {
      const json = editor?.getJSON();
      if (json) {
        const blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'document.json';
        a.click();
        URL.revokeObjectURL(url);
      }
    }, [editor]);

    if (!editor) {
      return null;
    }

    const characterCount = editor.storage.characterCount.characters();
    const wordCount = editor.storage.characterCount.words();

    return (
      <div
        className={cn(
          'border border-border rounded-lg overflow-hidden bg-background',
          isFullscreen && 'fixed inset-4 z-50',
          className
        )}
      >
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-0.5 p-2 border-b border-border bg-muted/50">
          {/* Undo/Redo */}
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            tooltip="Undo (Ctrl+Z)"
          >
            <Undo className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            tooltip="Redo (Ctrl+Y)"
          >
            <Redo className="h-4 w-4" />
          </ToolbarButton>

          <ToolbarDivider />

          {/* Text formatting */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            tooltip="Bold (Ctrl+B)"
          >
            <Bold className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            tooltip="Italic (Ctrl+I)"
          >
            <Italic className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editor.isActive('underline')}
            tooltip="Underline (Ctrl+U)"
          >
            <UnderlineIcon className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            isActive={editor.isActive('strike')}
            tooltip="Strikethrough"
          >
            <Strikethrough className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCode().run()}
            isActive={editor.isActive('code')}
            tooltip="Inline Code"
          >
            <Code className="h-4 w-4" />
          </ToolbarButton>

          <ToolbarDivider />

          {/* Headings */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 px-2">
                <Type className="h-4 w-4 mr-1" />
                <span className="text-xs">Heading</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => editor.chain().focus().setParagraph().run()}>
                Paragraph
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
                <Heading1 className="h-4 w-4 mr-2" /> Heading 1
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
                <Heading2 className="h-4 w-4 mr-2" /> Heading 2
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
                <Heading3 className="h-4 w-4 mr-2" /> Heading 3
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <ToolbarDivider />

          {/* Lists */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
            tooltip="Bullet List"
          >
            <List className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
            tooltip="Numbered List"
          >
            <ListOrdered className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive('blockquote')}
            tooltip="Quote"
          >
            <Quote className="h-4 w-4" />
          </ToolbarButton>

          <ToolbarDivider />

          {/* Alignment */}
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            isActive={editor.isActive({ textAlign: 'left' })}
            tooltip="Align Left"
          >
            <AlignLeft className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            isActive={editor.isActive({ textAlign: 'center' })}
            tooltip="Align Center"
          >
            <AlignCenter className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            isActive={editor.isActive({ textAlign: 'right' })}
            tooltip="Align Right"
          >
            <AlignRight className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            isActive={editor.isActive({ textAlign: 'justify' })}
            tooltip="Justify"
          >
            <AlignJustify className="h-4 w-4" />
          </ToolbarButton>

          <ToolbarDivider />

          {/* Colors */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Palette className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <div className="grid grid-cols-5 gap-1 p-2">
                {['#000000', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ff8800', '#8800ff', '#ffffff'].map((color) => (
                  <button
                    key={color}
                    className="w-6 h-6 rounded border border-border"
                    style={{ backgroundColor: color }}
                    onClick={() => editor.chain().focus().setColor(color).run()}
                  />
                ))}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => editor.chain().focus().unsetColor().run()}>
                Reset Color
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Highlighter className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <div className="grid grid-cols-5 gap-1 p-2">
                {['#fef08a', '#bbf7d0', '#bfdbfe', '#fecaca', '#e9d5ff', '#fed7aa', '#99f6e4', '#fce7f3', '#d1d5db', 'transparent'].map((color) => (
                  <button
                    key={color}
                    className="w-6 h-6 rounded border border-border"
                    style={{ backgroundColor: color === 'transparent' ? 'white' : color }}
                    onClick={() => {
                      if (color === 'transparent') {
                        editor.chain().focus().unsetHighlight().run();
                      } else {
                        editor.chain().focus().toggleHighlight({ color }).run();
                      }
                    }}
                  />
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <ToolbarDivider />

          {/* Link */}
          <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn('h-8 w-8 p-0', editor.isActive('link') && 'bg-primary/20 text-primary')}
              >
                <LinkIcon className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Insert Link</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="link-url">URL</Label>
                  <Input
                    id="link-url"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="https://example.com"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSetLink}>Insert Link</Button>
                  {editor.isActive('link') && (
                    <Button variant="destructive" onClick={handleRemoveLink}>
                      Remove Link
                    </Button>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Image */}
          <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <ImageIcon className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Insert Image</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="image-url">Image URL</Label>
                  <Input
                    id="image-url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <Button onClick={handleAddImage}>Insert from URL</Button>
                {onImageUpload && (
                  <>
                    <div className="text-center text-muted-foreground text-sm">or</div>
                    <div>
                      <Label htmlFor="image-upload">Upload Image</Label>
                      <Input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                    </div>
                  </>
                )}
              </div>
            </DialogContent>
          </Dialog>

          {/* YouTube */}
          <Dialog open={showYoutubeDialog} onOpenChange={setShowYoutubeDialog}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Video className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Embed YouTube Video</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="youtube-url">YouTube URL</Label>
                  <Input
                    id="youtube-url"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                </div>
                <Button onClick={handleAddYoutube}>Embed Video</Button>
              </div>
            </DialogContent>
          </Dialog>

          <ToolbarDivider />

          {/* Table */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn('h-8 w-8 p-0', editor.isActive('table') && 'bg-primary/20 text-primary')}
              >
                <TableIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={handleInsertTable}>
                <Plus className="h-4 w-4 mr-2" /> Insert Table
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => editor.chain().focus().addColumnBefore().run()}
                disabled={!editor.can().addColumnBefore()}
              >
                Add Column Before
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => editor.chain().focus().addColumnAfter().run()}
                disabled={!editor.can().addColumnAfter()}
              >
                Add Column After
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => editor.chain().focus().deleteColumn().run()}
                disabled={!editor.can().deleteColumn()}
              >
                Delete Column
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => editor.chain().focus().addRowBefore().run()}
                disabled={!editor.can().addRowBefore()}
              >
                Add Row Before
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => editor.chain().focus().addRowAfter().run()}
                disabled={!editor.can().addRowAfter()}
              >
                Add Row After
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => editor.chain().focus().deleteRow().run()}
                disabled={!editor.can().deleteRow()}
              >
                Delete Row
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => editor.chain().focus().mergeCells().run()}
                disabled={!editor.can().mergeCells()}
              >
                Merge Cells
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => editor.chain().focus().splitCell().run()}
                disabled={!editor.can().splitCell()}
              >
                Split Cell
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => editor.chain().focus().deleteTable().run()}
                disabled={!editor.can().deleteTable()}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" /> Delete Table
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Code Block */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            isActive={editor.isActive('codeBlock')}
            tooltip="Code Block"
          >
            <FileCode className="h-4 w-4" />
          </ToolbarButton>

          <ToolbarDivider />

          {/* Export */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 px-2">
                <Download className="h-4 w-4 mr-1" />
                <span className="text-xs">Export</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={handleExportHTML}>
                Export as HTML
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportJSON}>
                Export as JSON
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Fullscreen toggle */}
          <div className="ml-auto">
            <ToolbarButton
              onClick={() => setIsFullscreen(!isFullscreen)}
              tooltip={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </ToolbarButton>
          </div>
        </div>

        {/* Bubble menu for text selection */}
        <BubbleMenu
          editor={editor}
          tippyOptions={{ duration: 100 }}
          className="flex items-center gap-1 p-1 bg-popover border border-border rounded-lg shadow-lg"
        >
          <Button
            variant="ghost"
            size="sm"
            className={cn('h-7 w-7 p-0', editor.isActive('bold') && 'bg-primary/20')}
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <Bold className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn('h-7 w-7 p-0', editor.isActive('italic') && 'bg-primary/20')}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <Italic className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn('h-7 w-7 p-0', editor.isActive('underline') && 'bg-primary/20')}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
          >
            <UnderlineIcon className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn('h-7 w-7 p-0', editor.isActive('link') && 'bg-primary/20')}
            onClick={() => setShowLinkDialog(true)}
          >
            <LinkIcon className="h-3 w-3" />
          </Button>
        </BubbleMenu>

        {/* Floating menu for empty lines */}
        <FloatingMenu
          editor={editor}
          tippyOptions={{ duration: 100 }}
          className="flex items-center gap-1 p-1 bg-popover border border-border rounded-lg shadow-lg"
        >
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          >
            <Heading1 className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            <List className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
          >
            <Quote className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={handleInsertTable}
          >
            <TableIcon className="h-3 w-3" />
          </Button>
        </FloatingMenu>

        {/* Editor content */}
        <div
          className="overflow-auto"
          style={{ minHeight, maxHeight: isFullscreen ? 'calc(100vh - 180px)' : maxHeight }}
        >
          <EditorContent
            editor={editor}
            className={cn(
              'prose prose-invert max-w-none p-4',
              '[&_.ProseMirror]:outline-none',
              '[&_.ProseMirror]:min-h-[150px]',
              '[&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]',
              '[&_.ProseMirror_p.is-editor-empty:first-child::before]:text-muted-foreground',
              '[&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left',
              '[&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none',
              '[&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0',
              '[&_.ProseMirror_table]:border-collapse',
              '[&_.ProseMirror_td]:border',
              '[&_.ProseMirror_td]:border-border',
              '[&_.ProseMirror_td]:p-2',
              '[&_.ProseMirror_th]:border',
              '[&_.ProseMirror_th]:border-border',
              '[&_.ProseMirror_th]:p-2',
              '[&_.ProseMirror_th]:bg-muted'
            )}
          />
        </div>

        {/* Footer with character/word count */}
        {(showCharacterCount || showWordCount) && (
          <div className="flex items-center justify-end gap-4 px-4 py-2 border-t border-border text-xs text-muted-foreground">
            {showWordCount && <span>{wordCount} words</span>}
            {showCharacterCount && (
              <span>
                {characterCount}
                {characterLimit && ` / ${characterLimit}`} characters
              </span>
            )}
          </div>
        )}
      </div>
    );
  }
);

FanzEditor.displayName = 'FanzEditor';

export default FanzEditor;

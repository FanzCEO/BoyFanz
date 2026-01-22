// @ts-nocheck
/**
 * ProfileQRCode - QR Code Generator for Creator Profiles
 *
 * Generates a downloadable QR code that links to the creator's profile
 */

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { QrCode, Download, Share2, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import QRCode from 'qrcode';

interface ProfileQRCodeProps {
  username: string;
  userId: string;
  profileImageUrl?: string;
  className?: string;
}

export function ProfileQRCode({ username, userId, profileImageUrl, className }: ProfileQRCodeProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [size, setSize] = useState<number>(256);
  const [color, setColor] = useState<string>('#ff0000');
  const [bgColor, setBgColor] = useState<string>('#ffffff');
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const profileUrl = `${window.location.origin}/creator/${userId}`;

  useEffect(() => {
    generateQRCode();
  }, [userId, size, color, bgColor]);

  const generateQRCode = async () => {
    try {
      const dataUrl = await QRCode.toDataURL(profileUrl, {
        width: size,
        margin: 2,
        color: {
          dark: color,
          light: bgColor,
        },
        errorCorrectionLevel: 'H',
      });
      setQrDataUrl(dataUrl);
    } catch (err) {
      console.error('Error generating QR code:', err);
    }
  };

  const downloadQRCode = async (format: 'png' | 'svg' = 'png') => {
    try {
      if (format === 'svg') {
        const svgString = await QRCode.toString(profileUrl, {
          type: 'svg',
          width: size,
          margin: 2,
          color: {
            dark: color,
            light: bgColor,
          },
        });
        const blob = new Blob([svgString], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `${username}-qr-code.svg`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
      } else {
        const link = document.createElement('a');
        link.download = `${username}-qr-code.png`;
        link.href = qrDataUrl;
        link.click();
      }

      toast({
        title: 'QR Code Downloaded',
        description: `Your ${format.toUpperCase()} QR code has been downloaded!`,
      });
    } catch (err) {
      toast({
        title: 'Download Failed',
        description: 'Could not download QR code',
        variant: 'destructive',
      });
    }
  };

  const copyProfileLink = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: 'Link Copied',
        description: 'Profile link copied to clipboard!',
      });
    } catch (err) {
      toast({
        title: 'Copy Failed',
        description: 'Could not copy link',
        variant: 'destructive',
      });
    }
  };

  const shareProfile = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${username}'s Profile`,
          text: `Check out ${username} on BoyFanz!`,
          url: profileUrl,
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          copyProfileLink();
        }
      }
    } else {
      copyProfileLink();
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className={className}>
          <QrCode className="h-4 w-4 mr-2" />
          QR Code
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-primary" />
            Profile QR Code
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* QR Code Preview */}
          <div className="flex justify-center">
            <div
              className="p-4 rounded-lg border-2 border-dashed border-primary/30"
              style={{ backgroundColor: bgColor }}
            >
              {qrDataUrl && (
                <img
                  src={qrDataUrl}
                  alt={`QR code for ${username}'s profile`}
                  className="rounded"
                  style={{ width: Math.min(size, 200), height: Math.min(size, 200) }}
                />
              )}
            </div>
          </div>

          {/* Customization Options */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="qr-color">QR Color</Label>
              <div className="flex gap-2">
                <Input
                  id="qr-color"
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-12 h-10 p-1 cursor-pointer"
                />
                <Input
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="flex-1"
                  placeholder="#ff0000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bg-color">Background</Label>
              <div className="flex gap-2">
                <Input
                  id="bg-color"
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-12 h-10 p-1 cursor-pointer"
                />
                <Input
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="flex-1"
                  placeholder="#ffffff"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Size</Label>
            <Select value={String(size)} onValueChange={(v) => setSize(Number(v))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="128">Small (128px)</SelectItem>
                <SelectItem value="256">Medium (256px)</SelectItem>
                <SelectItem value="512">Large (512px)</SelectItem>
                <SelectItem value="1024">Extra Large (1024px)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Profile URL */}
          <div className="space-y-2">
            <Label>Profile Link</Label>
            <div className="flex gap-2">
              <Input
                value={profileUrl}
                readOnly
                className="flex-1 text-xs"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={copyProfileLink}
              >
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={() => downloadQRCode('png')} className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Download PNG
            </Button>
            <Button onClick={() => downloadQRCode('svg')} variant="outline" className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Download SVG
            </Button>
          </div>

          <Button onClick={shareProfile} variant="secondary" className="w-full">
            <Share2 className="h-4 w-4 mr-2" />
            Share Profile
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ProfileQRCode;

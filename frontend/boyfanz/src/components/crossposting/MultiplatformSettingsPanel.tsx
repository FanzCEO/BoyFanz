'use client';

import { useState, useEffect } from 'react';
import { Save, AlertCircle, Check, Settings, ChevronDown, ChevronUp } from 'lucide-react';
import { useMultiplatformSettings } from '@/hooks/useMultiplatformSettings';
import { Platform } from '@/types/crossposting';

// This would typically come from an API endpoint
const AVAILABLE_PLATFORMS: Platform[] = [
  { id: 'girlfanz', slug: 'girlfanz', name: 'GirlFanz', domain: 'girlfanz.com', icon: '👧', color: '#FF69B4', isActive: true },
  { id: 'gayfanz', slug: 'gayfanz', name: 'GayFanz', domain: 'gayfanz.com', icon: '🌈', color: '#9B59B6', isActive: true },
  { id: 'bearfanz', slug: 'bearfanz', name: 'BearFanz', domain: 'bearfanz.com', icon: '🐻', color: '#8B4513', isActive: true },
  { id: 'dlbroz', slug: 'dlbroz', name: 'DLBroz', domain: 'dlbroz.com', icon: '💪', color: '#34495E', isActive: true },
  { id: 'southernstuz', slug: 'southernstuz', name: 'SouthernStuz', domain: 'southernstuz.com', icon: '🤠', color: '#E67E22', isActive: true },
  { id: 'taboofanz', slug: 'taboofanz', name: 'TabooFanz', domain: 'taboofanz.com', icon: '🔞', color: '#C0392B', isActive: true },
  { id: 'sissyboyz', slug: 'sissyboyz', name: 'SissyBoyz', domain: 'sissyboyz.com', icon: '💋', color: '#E91E63', isActive: true },
  { id: 'slutzruz', slug: 'slutzruz', name: 'SlutzRuz', domain: 'slutzruz.com', icon: '💃', color: '#FF5722', isActive: true },
  { id: 'guyz', slug: 'guyz', name: 'Guyz', domain: 'guyz.com', icon: '👔', color: '#607D8B', isActive: true },
  { id: 'tranzfanz', slug: 'tranzfanz', name: 'TranzFanz', domain: 'tranzfanz.com', icon: '⚧️', color: '#5BCEFA', isActive: true },
];

export function MultiplatformSettingsPanel() {
  const { settings, loading, error, update } = useMultiplatformSettings();

  const [localSettings, setLocalSettings] = useState(settings);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [expandedPlatforms, setExpandedPlatforms] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    }
  }, [settings]);

  const handleTogglePlatform = (platformId: string) => {
    if (!localSettings) return;

    const isCurrentlyDefault = localSettings.defaultPlatforms.includes(platformId);
    const newDefaults = isCurrentlyDefault
      ? localSettings.defaultPlatforms.filter(id => id !== platformId)
      : [...localSettings.defaultPlatforms, platformId];

    setLocalSettings({
      ...localSettings,
      defaultPlatforms: newDefaults,
    });
  };

  const handleToggleAutoPost = () => {
    if (!localSettings) return;
    setLocalSettings({
      ...localSettings,
      autoPostEnabled: !localSettings.autoPostEnabled,
    });
  };

  const handleDelayChange = (seconds: number) => {
    if (!localSettings) return;
    setLocalSettings({
      ...localSettings,
      autoPostDelaySeconds: seconds,
    });
  };

  const handleToggleNotification = (field: 'notifyOnPostSuccess' | 'notifyOnPostFailure') => {
    if (!localSettings) return;
    setLocalSettings({
      ...localSettings,
      [field]: !localSettings[field],
    });
  };

  const handlePlatformSettingChange = (
    platformId: string,
    field: keyof typeof localSettings.platformSettings[string],
    value: any
  ) => {
    if (!localSettings) return;

    const currentSettings = localSettings.platformSettings[platformId] || {
      enabled: true,
      modifyCaption: false,
      addWatermark: false,
    };

    setLocalSettings({
      ...localSettings,
      platformSettings: {
        ...localSettings.platformSettings,
        [platformId]: {
          ...currentSettings,
          [field]: value,
        },
      },
    });
  };

  const togglePlatformExpansion = (platformId: string) => {
    const newExpanded = new Set(expandedPlatforms);
    if (newExpanded.has(platformId)) {
      newExpanded.delete(platformId);
    } else {
      newExpanded.add(platformId);
    }
    setExpandedPlatforms(newExpanded);
  };

  const handleSave = async () => {
    if (!localSettings) return;

    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      await update({
        defaultPlatforms: localSettings.defaultPlatforms,
        autoPostEnabled: localSettings.autoPostEnabled,
        autoPostDelaySeconds: localSettings.autoPostDelaySeconds,
        platformSettings: localSettings.platformSettings,
        notifyOnPostSuccess: localSettings.notifyOnPostSuccess,
        notifyOnPostFailure: localSettings.notifyOnPostFailure,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !localSettings) {
    return (
      <div className="p-6 bg-primary/10 border border-primary/30 rounded-lg flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-primary font-semibold mb-1">Failed to Load Settings</p>
          <p className="text-sm text-text-secondary">{error || 'Unknown error occurred'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-text">Multi-Platform Settings</h3>
          <p className="text-sm text-text-secondary mt-1">
            Configure automatic cross-posting to other FANZ platforms
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2.5 rounded-lg bg-primary text-accent font-semibold hover:shadow-red-glow transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
        >
          {saveSuccess ? (
            <>
              <Check className="w-5 h-5" />
              Saved
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </>
          )}
        </button>
      </div>

      {/* Save Error */}
      {saveError && (
        <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <p className="text-sm text-primary">{saveError}</p>
        </div>
      )}

      {/* Auto-Post Toggle */}
      <div className="p-6 bg-background/50 rounded-lg border border-border neon-border-subtle">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <label className="block font-semibold text-text mb-1">
              Enable Auto-Posting
            </label>
            <p className="text-sm text-text-secondary">
              Automatically post to selected platforms when you create new content
            </p>
          </div>
          <button
            onClick={handleToggleAutoPost}
            className={`
              relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent
              transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
              ${localSettings.autoPostEnabled ? 'bg-primary' : 'bg-border'}
            `}
            role="switch"
            aria-checked={localSettings.autoPostEnabled}
          >
            <span
              className={`
                pointer-events-none inline-block h-5 w-5 transform rounded-full bg-accent shadow-lg ring-0
                transition duration-200 ease-in-out
                ${localSettings.autoPostEnabled ? 'translate-x-5' : 'translate-x-0'}
              `}
            />
          </button>
        </div>

        {/* Post Delay */}
        {localSettings.autoPostEnabled && (
          <div className="mt-4 pt-4 border-t border-border">
            <label className="block font-medium text-text mb-2">
              Post Delay (seconds)
            </label>
            <input
              type="number"
              min="0"
              max="300"
              value={localSettings.autoPostDelaySeconds}
              onChange={(e) => handleDelayChange(parseInt(e.target.value) || 0)}
              className="w-full px-4 py-2 bg-surface border border-border rounded-lg text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary neon-border-subtle"
            />
            <p className="text-xs text-text-secondary mt-1">
              Delay between posting to each platform (0-300 seconds)
            </p>
          </div>
        )}
      </div>

      {/* Default Platforms */}
      <div className="p-6 bg-background/50 rounded-lg border border-border neon-border-subtle space-y-4">
        <div>
          <h4 className="font-semibold text-text mb-1">Default Platforms</h4>
          <p className="text-sm text-text-secondary">
            Select which platforms to post to by default
          </p>
        </div>

        <div className="space-y-2">
          {AVAILABLE_PLATFORMS.map((platform) => {
            const isSelected = localSettings.defaultPlatforms.includes(platform.id);
            const isExpanded = expandedPlatforms.has(platform.id);
            const platformSettings = localSettings.platformSettings[platform.id] || {
              enabled: true,
              modifyCaption: false,
              addWatermark: false,
            };

            return (
              <div
                key={platform.id}
                className="bg-surface rounded-lg border border-border hover:border-primary/30 transition-colors overflow-hidden"
              >
                {/* Platform Header */}
                <div className="flex items-center gap-3 p-4">
                  <input
                    type="checkbox"
                    id={`platform-${platform.id}`}
                    checked={isSelected}
                    onChange={() => handleTogglePlatform(platform.id)}
                    className="w-5 h-5 rounded border-2 border-border bg-surface checked:bg-primary checked:border-primary focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors cursor-pointer"
                  />

                  <label
                    htmlFor={`platform-${platform.id}`}
                    className="flex-1 flex items-center gap-3 cursor-pointer"
                  >
                    <span className="text-2xl">{platform.icon}</span>
                    <div className="flex-1">
                      <div className="font-medium text-text">{platform.name}</div>
                      <div className="text-xs text-text-secondary">{platform.domain}</div>
                    </div>
                  </label>

                  {isSelected && (
                    <button
                      onClick={() => togglePlatformExpansion(platform.id)}
                      className="p-2 rounded-lg hover:bg-background transition-colors text-text-secondary hover:text-text"
                      aria-label={isExpanded ? 'Collapse settings' : 'Expand settings'}
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </button>
                  )}
                </div>

                {/* Platform-Specific Settings */}
                {isSelected && isExpanded && (
                  <div className="px-4 pb-4 space-y-3 border-t border-border/50">
                    <div className="pt-3 flex items-center gap-3">
                      <Settings className="w-4 h-4 text-text-secondary flex-shrink-0" />
                      <span className="text-sm font-medium text-text">Platform-Specific Settings</span>
                    </div>

                    {/* Modify Caption */}
                    <div className="flex items-start gap-3 pl-7">
                      <input
                        type="checkbox"
                        id={`modify-caption-${platform.id}`}
                        checked={platformSettings.modifyCaption || false}
                        onChange={(e) =>
                          handlePlatformSettingChange(platform.id, 'modifyCaption', e.target.checked)
                        }
                        className="mt-1 w-4 h-4 rounded border-2 border-border bg-surface checked:bg-primary checked:border-primary focus:ring-2 focus:ring-primary transition-colors cursor-pointer"
                      />
                      <label
                        htmlFor={`modify-caption-${platform.id}`}
                        className="flex-1 cursor-pointer"
                      >
                        <div className="text-sm font-medium text-text">Modify Caption</div>
                        <div className="text-xs text-text-secondary">
                          Add custom prefix/suffix to captions for this platform
                        </div>
                      </label>
                    </div>

                    {platformSettings.modifyCaption && (
                      <div className="pl-7 space-y-2">
                        <input
                          type="text"
                          placeholder="Caption prefix..."
                          value={platformSettings.captionPrefix || ''}
                          onChange={(e) =>
                            handlePlatformSettingChange(platform.id, 'captionPrefix', e.target.value)
                          }
                          className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg text-text placeholder:text-text-secondary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                        />
                        <input
                          type="text"
                          placeholder="Caption suffix..."
                          value={platformSettings.captionSuffix || ''}
                          onChange={(e) =>
                            handlePlatformSettingChange(platform.id, 'captionSuffix', e.target.value)
                          }
                          className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg text-text placeholder:text-text-secondary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                        />
                      </div>
                    )}

                    {/* Add Watermark */}
                    <div className="flex items-start gap-3 pl-7">
                      <input
                        type="checkbox"
                        id={`watermark-${platform.id}`}
                        checked={platformSettings.addWatermark || false}
                        onChange={(e) =>
                          handlePlatformSettingChange(platform.id, 'addWatermark', e.target.checked)
                        }
                        className="mt-1 w-4 h-4 rounded border-2 border-border bg-surface checked:bg-primary checked:border-primary focus:ring-2 focus:ring-primary transition-colors cursor-pointer"
                      />
                      <label
                        htmlFor={`watermark-${platform.id}`}
                        className="flex-1 cursor-pointer"
                      >
                        <div className="text-sm font-medium text-text">Add Platform Watermark</div>
                        <div className="text-xs text-text-secondary">
                          Add {platform.name} watermark to images/videos
                        </div>
                      </label>
                    </div>

                    {/* Custom Hashtags */}
                    <div className="pl-7">
                      <label className="text-sm font-medium text-text block mb-2">
                        Custom Hashtags
                      </label>
                      <input
                        type="text"
                        placeholder="#hashtag1 #hashtag2"
                        value={platformSettings.customHashtags?.join(' ') || ''}
                        onChange={(e) => {
                          const hashtags = e.target.value
                            .split(' ')
                            .filter(h => h.trim())
                            .map(h => h.startsWith('#') ? h : `#${h}`);
                          handlePlatformSettingChange(platform.id, 'customHashtags', hashtags);
                        }}
                        className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg text-text placeholder:text-text-secondary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                      />
                      <p className="text-xs text-text-secondary mt-1">
                        Space-separated hashtags to add for this platform
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Notification Settings */}
      <div className="p-6 bg-background/50 rounded-lg border border-border neon-border-subtle space-y-4">
        <h4 className="font-semibold text-text mb-3">Notification Preferences</h4>

        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <label className="block font-medium text-text mb-1">
              Notify on successful posts
            </label>
            <p className="text-sm text-text-secondary">
              Get notified when posts are successfully published
            </p>
          </div>
          <button
            onClick={() => handleToggleNotification('notifyOnPostSuccess')}
            className={`
              relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent
              transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
              ${localSettings.notifyOnPostSuccess ? 'bg-primary' : 'bg-border'}
            `}
            role="switch"
            aria-checked={localSettings.notifyOnPostSuccess}
          >
            <span
              className={`
                pointer-events-none inline-block h-5 w-5 transform rounded-full bg-accent shadow-lg ring-0
                transition duration-200 ease-in-out
                ${localSettings.notifyOnPostSuccess ? 'translate-x-5' : 'translate-x-0'}
              `}
            />
          </button>
        </div>

        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <label className="block font-medium text-text mb-1">
              Notify on failed posts
            </label>
            <p className="text-sm text-text-secondary">
              Get notified when posts fail to publish
            </p>
          </div>
          <button
            onClick={() => handleToggleNotification('notifyOnPostFailure')}
            className={`
              relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent
              transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
              ${localSettings.notifyOnPostFailure ? 'bg-primary' : 'bg-border'}
            `}
            role="switch"
            aria-checked={localSettings.notifyOnPostFailure}
          >
            <span
              className={`
                pointer-events-none inline-block h-5 w-5 transform rounded-full bg-accent shadow-lg ring-0
                transition duration-200 ease-in-out
                ${localSettings.notifyOnPostFailure ? 'translate-x-5' : 'translate-x-0'}
              `}
            />
          </button>
        </div>
      </div>
    </div>
  );
}

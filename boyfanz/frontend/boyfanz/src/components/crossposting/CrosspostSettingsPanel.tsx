'use client';

import { useState, useEffect } from 'react';
import { Save, AlertCircle, Check, UserPlus, UserMinus, Search, X } from 'lucide-react';
import { useCrosspostSettings } from '@/hooks/useCrosspostSettings';
import { searchCreators } from '@/lib/api/crossposting';
import { Creator } from '@/types/crossposting';

export function CrosspostSettingsPanel() {
  const { settings, loading, error, update } = useCrosspostSettings();

  const [localSettings, setLocalSettings] = useState(settings);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Search states for whitelist/blacklist
  const [whitelistSearch, setWhitelistSearch] = useState('');
  const [blacklistSearch, setBlacklistSearch] = useState('');
  const [whitelistResults, setWhitelistResults] = useState<Creator[]>([]);
  const [blacklistResults, setBlacklistResults] = useState<Creator[]>([]);
  const [isSearchingWhitelist, setIsSearchingWhitelist] = useState(false);
  const [isSearchingBlacklist, setIsSearchingBlacklist] = useState(false);

  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    }
  }, [settings]);

  const handleToggle = (field: keyof typeof localSettings) => {
    if (!localSettings) return;
    setLocalSettings({
      ...localSettings,
      [field]: !localSettings[field],
    });
  };

  const handleSave = async () => {
    if (!localSettings) return;

    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      await update({
        autoApproveAllTags: localSettings.autoApproveAllTags,
        autoApproveFromFollowing: localSettings.autoApproveFromFollowing,
        autoApproveFromSubscribers: localSettings.autoApproveFromSubscribers,
        autoApproveFromVerified: localSettings.autoApproveFromVerified,
        notifyOnTag: localSettings.notifyOnTag,
        notifyOnApprovalNeeded: localSettings.notifyOnApprovalNeeded,
        blockedCreatorIds: localSettings.blockedCreatorIds,
        alwaysApproveCreatorIds: localSettings.alwaysApproveCreatorIds,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  // Search for creators to add to whitelist
  const handleWhitelistSearch = async (query: string) => {
    setWhitelistSearch(query);
    if (query.trim().length < 2) {
      setWhitelistResults([]);
      return;
    }

    setIsSearchingWhitelist(true);
    try {
      const results = await searchCreators(query);
      setWhitelistResults(results.filter(c =>
        !localSettings?.alwaysApproveCreatorIds.includes(c.id)
      ));
    } catch (err) {
      console.error('Whitelist search failed:', err);
    } finally {
      setIsSearchingWhitelist(false);
    }
  };

  // Search for creators to add to blacklist
  const handleBlacklistSearch = async (query: string) => {
    setBlacklistSearch(query);
    if (query.trim().length < 2) {
      setBlacklistResults([]);
      return;
    }

    setIsSearchingBlacklist(true);
    try {
      const results = await searchCreators(query);
      setBlacklistResults(results.filter(c =>
        !localSettings?.blockedCreatorIds.includes(c.id)
      ));
    } catch (err) {
      console.error('Blacklist search failed:', err);
    } finally {
      setIsSearchingBlacklist(false);
    }
  };

  const addToWhitelist = (creatorId: string) => {
    if (!localSettings) return;
    setLocalSettings({
      ...localSettings,
      alwaysApproveCreatorIds: [...localSettings.alwaysApproveCreatorIds, creatorId],
      blockedCreatorIds: localSettings.blockedCreatorIds.filter(id => id !== creatorId),
    });
    setWhitelistSearch('');
    setWhitelistResults([]);
  };

  const removeFromWhitelist = (creatorId: string) => {
    if (!localSettings) return;
    setLocalSettings({
      ...localSettings,
      alwaysApproveCreatorIds: localSettings.alwaysApproveCreatorIds.filter(id => id !== creatorId),
    });
  };

  const addToBlacklist = (creatorId: string) => {
    if (!localSettings) return;
    setLocalSettings({
      ...localSettings,
      blockedCreatorIds: [...localSettings.blockedCreatorIds, creatorId],
      alwaysApproveCreatorIds: localSettings.alwaysApproveCreatorIds.filter(id => id !== creatorId),
    });
    setBlacklistSearch('');
    setBlacklistResults([]);
  };

  const removeFromBlacklist = (creatorId: string) => {
    if (!localSettings) return;
    setLocalSettings({
      ...localSettings,
      blockedCreatorIds: localSettings.blockedCreatorIds.filter(id => id !== creatorId),
    });
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
          <h3 className="text-lg font-bold text-text">Cross-Post Tag Settings</h3>
          <p className="text-sm text-text-secondary mt-1">
            Configure how you want to handle tags from other creators
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

      {/* Auto-Approval Settings */}
      <div className="p-6 bg-background/50 rounded-lg border border-border neon-border-subtle space-y-4">
        <h4 className="font-semibold text-text mb-3">Auto-Approval Rules</h4>

        <ToggleRow
          label="Auto-approve all tags"
          description="Automatically approve all tags without review (not recommended)"
          checked={localSettings.autoApproveAllTags}
          onChange={() => handleToggle('autoApproveAllTags')}
        />

        <div className="h-px bg-border" />

        <ToggleRow
          label="Auto-approve from following"
          description="Automatically approve tags from creators you follow"
          checked={localSettings.autoApproveFromFollowing}
          onChange={() => handleToggle('autoApproveFromFollowing')}
          disabled={localSettings.autoApproveAllTags}
        />

        <ToggleRow
          label="Auto-approve from subscribers"
          description="Automatically approve tags from your subscribers"
          checked={localSettings.autoApproveFromSubscribers}
          onChange={() => handleToggle('autoApproveFromSubscribers')}
          disabled={localSettings.autoApproveAllTags}
        />

        <ToggleRow
          label="Auto-approve from verified creators"
          description="Automatically approve tags from verified creators"
          checked={localSettings.autoApproveFromVerified}
          onChange={() => handleToggle('autoApproveFromVerified')}
          disabled={localSettings.autoApproveAllTags}
        />
      </div>

      {/* Notification Settings */}
      <div className="p-6 bg-background/50 rounded-lg border border-border neon-border-subtle space-y-4">
        <h4 className="font-semibold text-text mb-3">Notification Preferences</h4>

        <ToggleRow
          label="Notify on tag"
          description="Get notified when someone tags you in a post"
          checked={localSettings.notifyOnTag}
          onChange={() => handleToggle('notifyOnTag')}
        />

        <ToggleRow
          label="Notify on approval needed"
          description="Get notified when a tag requires your approval"
          checked={localSettings.notifyOnApprovalNeeded}
          onChange={() => handleToggle('notifyOnApprovalNeeded')}
        />
      </div>

      {/* Whitelist (Always Approve) */}
      <div className="p-6 bg-background/50 rounded-lg border border-border neon-border-subtle space-y-4">
        <div>
          <h4 className="font-semibold text-text mb-1">Always Approve List</h4>
          <p className="text-sm text-text-secondary">
            Always auto-approve tags from these creators
          </p>
        </div>

        {/* Search Input */}
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
            <input
              type="text"
              value={whitelistSearch}
              onChange={(e) => handleWhitelistSearch(e.target.value)}
              placeholder="Search creators to add..."
              className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-lg text-text placeholder:text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary neon-border-subtle"
            />
          </div>

          {/* Search Results Dropdown */}
          {whitelistResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-surface border border-border rounded-lg shadow-xl neon-border max-h-60 overflow-y-auto z-10">
              {whitelistResults.map((creator) => (
                <button
                  key={creator.id}
                  onClick={() => addToWhitelist(creator.id)}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-background/50 transition-colors text-left"
                >
                  {creator.avatarUrl ? (
                    <img
                      src={creator.avatarUrl}
                      alt={creator.displayName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center">
                      <span className="text-text-secondary text-lg">
                        {creator.displayName[0]}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-text truncate">
                        {creator.displayName}
                      </span>
                      {creator.isVerified && (
                        <svg className="w-4 h-4 text-primary flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                        </svg>
                      )}
                    </div>
                    <p className="text-sm text-text-secondary truncate">
                      @{creator.username}
                    </p>
                  </div>
                  <UserPlus className="w-5 h-5 text-primary flex-shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Whitelist Items */}
        <div className="space-y-2">
          {localSettings.alwaysApproveCreatorIds.length === 0 ? (
            <p className="text-sm text-text-secondary text-center py-4">
              No creators in your always approve list
            </p>
          ) : (
            localSettings.alwaysApproveCreatorIds.map((creatorId) => (
              <div
                key={creatorId}
                className="flex items-center justify-between p-3 bg-surface rounded-lg border border-border hover:border-primary/30 transition-colors"
              >
                <span className="text-sm text-text">{creatorId}</span>
                <button
                  onClick={() => removeFromWhitelist(creatorId)}
                  className="p-1.5 rounded-lg hover:bg-background transition-colors text-text-secondary hover:text-primary"
                  aria-label="Remove from whitelist"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Blacklist (Always Reject) */}
      <div className="p-6 bg-background/50 rounded-lg border border-border neon-border-subtle space-y-4">
        <div>
          <h4 className="font-semibold text-text mb-1">Blocked Creators</h4>
          <p className="text-sm text-text-secondary">
            Always reject tags from these creators
          </p>
        </div>

        {/* Search Input */}
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
            <input
              type="text"
              value={blacklistSearch}
              onChange={(e) => handleBlacklistSearch(e.target.value)}
              placeholder="Search creators to block..."
              className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-lg text-text placeholder:text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary neon-border-subtle"
            />
          </div>

          {/* Search Results Dropdown */}
          {blacklistResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-surface border border-border rounded-lg shadow-xl neon-border max-h-60 overflow-y-auto z-10">
              {blacklistResults.map((creator) => (
                <button
                  key={creator.id}
                  onClick={() => addToBlacklist(creator.id)}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-background/50 transition-colors text-left"
                >
                  {creator.avatarUrl ? (
                    <img
                      src={creator.avatarUrl}
                      alt={creator.displayName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center">
                      <span className="text-text-secondary text-lg">
                        {creator.displayName[0]}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-text truncate">
                        {creator.displayName}
                      </span>
                      {creator.isVerified && (
                        <svg className="w-4 h-4 text-primary flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                        </svg>
                      )}
                    </div>
                    <p className="text-sm text-text-secondary truncate">
                      @{creator.username}
                    </p>
                  </div>
                  <UserMinus className="w-5 h-5 text-primary flex-shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Blacklist Items */}
        <div className="space-y-2">
          {localSettings.blockedCreatorIds.length === 0 ? (
            <p className="text-sm text-text-secondary text-center py-4">
              No blocked creators
            </p>
          ) : (
            localSettings.blockedCreatorIds.map((creatorId) => (
              <div
                key={creatorId}
                className="flex items-center justify-between p-3 bg-surface rounded-lg border border-border hover:border-primary/30 transition-colors"
              >
                <span className="text-sm text-text">{creatorId}</span>
                <button
                  onClick={() => removeFromBlacklist(creatorId)}
                  className="p-1.5 rounded-lg hover:bg-background transition-colors text-text-secondary hover:text-primary"
                  aria-label="Remove from blacklist"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// Helper component for toggle rows
interface ToggleRowProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}

function ToggleRow({ label, description, checked, onChange, disabled = false }: ToggleRowProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1">
        <label className="block font-medium text-text mb-1">
          {label}
        </label>
        <p className="text-sm text-text-secondary">
          {description}
        </p>
      </div>
      <button
        onClick={onChange}
        disabled={disabled}
        className={`
          relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent
          transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
          disabled:opacity-50 disabled:cursor-not-allowed
          ${checked ? 'bg-primary' : 'bg-border'}
        `}
        role="switch"
        aria-checked={checked}
        aria-label={label}
      >
        <span
          className={`
            pointer-events-none inline-block h-5 w-5 transform rounded-full bg-accent shadow-lg ring-0
            transition duration-200 ease-in-out
            ${checked ? 'translate-x-5' : 'translate-x-0'}
          `}
        />
      </button>
    </div>
  );
}

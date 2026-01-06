-- ============================================================================
-- OUTLAWZ PROGRAM DATABASE SCHEMA
-- "Banned elsewhere? Be legendary here."
-- ============================================================================
--
-- This migration adds the Outlawz Program tables to the FANZ ecosystem.
-- The Outlawz Program showcases creators who have been banned from competitor
-- platforms, transforming stigma into a badge of honor.
--
-- Author: Joshua Stone
-- Date: 2025-11-02
-- License: FANZ Group Holdings LLC
-- ============================================================================

-- Enable Required Extensions (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- TABLE 1: outlawz_profiles
-- Stores verification data for creators banned from other platforms
-- ============================================================================

CREATE TABLE IF NOT EXISTS outlawz_profiles (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Creator Reference
    creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Verification Information
    banned_from TEXT[] NOT NULL DEFAULT '{}', -- Array of platforms: ['OnlyFans', 'JustForFans', etc.]
    banned_reason VARCHAR(255), -- General categorization of ban reason
    banned_reason_tag VARCHAR(100), -- Tag for filtering: 'tos', 'dmca', 'content', 'behavior', etc.
    proof_documents JSONB DEFAULT '[]', -- Array of proof document URLs/metadata

    -- Application Details
    application_text TEXT, -- Creator's story about their ban
    application_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Verification Status
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected', 'suspended')),
    verified_by UUID REFERENCES users(id), -- FanzHubVault staff who verified
    verified_at TIMESTAMP,
    rejection_reason TEXT,

    -- Metadata
    verification_notes TEXT, -- Internal notes from reviewer
    compliance_flags JSONB DEFAULT '{}', -- Any compliance concerns

    -- Badge & Display
    is_featured BOOLEAN DEFAULT FALSE, -- Featured on Outlawz showcase
    badge_tier VARCHAR(50) DEFAULT 'outlawz' CHECK (badge_tier IN ('outlawz', 'legend', 'icon')), -- Badge level
    showcase_priority INTEGER DEFAULT 0, -- Higher number = higher priority in showcase

    -- Analytics
    total_views INTEGER DEFAULT 0,
    total_clips INTEGER DEFAULT 0,
    total_revenue DECIMAL(12,2) DEFAULT 0.00,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Indexes for outlawz_profiles
CREATE INDEX idx_outlawz_profiles_creator_id ON outlawz_profiles(creator_id);
CREATE INDEX idx_outlawz_profiles_status ON outlawz_profiles(status);
CREATE INDEX idx_outlawz_profiles_verified_at ON outlawz_profiles(verified_at);
CREATE INDEX idx_outlawz_profiles_featured ON outlawz_profiles(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_outlawz_profiles_banned_from ON outlawz_profiles USING GIN(banned_from);
CREATE INDEX idx_outlawz_profiles_showcase ON outlawz_profiles(showcase_priority DESC) WHERE status = 'approved' AND deleted_at IS NULL;

-- Unique constraint: One Outlawz profile per creator
CREATE UNIQUE INDEX idx_outlawz_profiles_unique_creator ON outlawz_profiles(creator_id) WHERE deleted_at IS NULL;

-- ============================================================================
-- TABLE 2: outlawz_clips
-- Stores safe-excerpt clips for the Outlawz showcase
-- ============================================================================

CREATE TABLE IF NOT EXISTS outlawz_clips (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- References
    outlawz_profile_id UUID NOT NULL REFERENCES outlawz_profiles(id) ON DELETE CASCADE,
    creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Clip Metadata
    title VARCHAR(255) NOT NULL,
    description TEXT,
    tags TEXT[] DEFAULT '{}',

    -- Asset Information (references FanzMediaCore or local storage)
    asset_id VARCHAR(255), -- Reference to FanzMediaCore asset
    video_url VARCHAR(500), -- CDN URL for the clip
    thumbnail_url VARCHAR(500), -- Thumbnail URL
    duration_seconds INTEGER, -- Duration in seconds

    -- Safe Excerpt Timestamps (if trimmed from longer content)
    safe_excerpt_start INTEGER, -- Start time in seconds (null if full clip)
    safe_excerpt_end INTEGER, -- End time in seconds (null if full clip)

    -- Compliance & Consent
    consent_hash VARCHAR(255), -- FanzHubVault consent verification hash
    consent_verified_at TIMESTAMP,
    consent_verified_by UUID REFERENCES users(id),
    compliance_status VARCHAR(50) DEFAULT 'pending' CHECK (compliance_status IN ('pending', 'approved', 'flagged', 'rejected')),

    -- Visibility Rules
    is_published BOOLEAN DEFAULT FALSE,
    verticals TEXT[] DEFAULT '{}', -- Which verticals this clip appears on: ['boyfanz', 'girlfanz', etc.]
    regions_allowed TEXT[] DEFAULT '{}', -- Regional restrictions (empty = all regions)
    regions_blocked TEXT[] DEFAULT '{}', -- Blocked regions
    age_gate_level VARCHAR(50) DEFAULT '18+' CHECK (age_gate_level IN ('18+', '21+')),

    -- Analytics
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    share_count INTEGER DEFAULT 0,
    click_through_rate DECIMAL(5,2) DEFAULT 0.00, -- % who clicked to full profile

    -- Revenue (if monetized)
    revenue_generated DECIMAL(10,2) DEFAULT 0.00,
    is_monetized BOOLEAN DEFAULT FALSE,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Indexes for outlawz_clips
CREATE INDEX idx_outlawz_clips_profile_id ON outlawz_clips(outlawz_profile_id);
CREATE INDEX idx_outlawz_clips_creator_id ON outlawz_clips(creator_id);
CREATE INDEX idx_outlawz_clips_status ON outlawz_clips(compliance_status);
CREATE INDEX idx_outlawz_clips_published ON outlawz_clips(is_published, published_at DESC) WHERE is_published = TRUE AND deleted_at IS NULL;
CREATE INDEX idx_outlawz_clips_verticals ON outlawz_clips USING GIN(verticals);
CREATE INDEX idx_outlawz_clips_tags ON outlawz_clips USING GIN(tags);
CREATE INDEX idx_outlawz_clips_views ON outlawz_clips(view_count DESC);

-- ============================================================================
-- TABLE 3: outlawz_analytics
-- Tracks detailed analytics for the Outlawz program
-- ============================================================================

CREATE TABLE IF NOT EXISTS outlawz_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- References
    outlawz_profile_id UUID REFERENCES outlawz_profiles(id) ON DELETE CASCADE,
    outlawz_clip_id UUID REFERENCES outlawz_clips(id) ON DELETE CASCADE,

    -- Event Data
    event_type VARCHAR(100) NOT NULL, -- 'view', 'click', 'share', 'purchase', etc.
    event_metadata JSONB DEFAULT '{}',

    -- User Context
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    session_id VARCHAR(255),
    user_agent TEXT,
    ip_address INET,

    -- Geographic Data
    country_code VARCHAR(10),
    region VARCHAR(100),
    city VARCHAR(100),

    -- Platform Context
    vertical VARCHAR(100), -- Which platform: 'boyfanz', 'girlfanz', etc.
    device_type VARCHAR(50), -- 'desktop', 'mobile', 'tablet'
    referrer_url TEXT,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for outlawz_analytics (optimized for time-series queries)
CREATE INDEX idx_outlawz_analytics_profile_id ON outlawz_analytics(outlawz_profile_id, created_at DESC);
CREATE INDEX idx_outlawz_analytics_clip_id ON outlawz_analytics(outlawz_clip_id, created_at DESC);
CREATE INDEX idx_outlawz_analytics_event_type ON outlawz_analytics(event_type, created_at DESC);
CREATE INDEX idx_outlawz_analytics_vertical ON outlawz_analytics(vertical, created_at DESC);
CREATE INDEX idx_outlawz_analytics_created_at ON outlawz_analytics(created_at DESC);

-- ============================================================================
-- TABLE 4: outlawz_verification_documents
-- Stores proof documents separately for better organization
-- ============================================================================

CREATE TABLE IF NOT EXISTS outlawz_verification_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- References
    outlawz_profile_id UUID NOT NULL REFERENCES outlawz_profiles(id) ON DELETE CASCADE,
    uploaded_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Document Details
    document_type VARCHAR(100) NOT NULL, -- 'ban_email', 'screenshot', 'dmca_notice', etc.
    file_url VARCHAR(500) NOT NULL,
    file_name VARCHAR(255),
    file_size INTEGER, -- Size in bytes
    mime_type VARCHAR(100),

    -- Metadata
    platform_name VARCHAR(100), -- Which platform this document relates to
    ban_date DATE, -- Date creator was banned (if known)
    description TEXT,

    -- Verification
    is_verified BOOLEAN DEFAULT FALSE,
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMP,
    verification_notes TEXT,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for outlawz_verification_documents
CREATE INDEX idx_outlawz_docs_profile_id ON outlawz_verification_documents(outlawz_profile_id);
CREATE INDEX idx_outlawz_docs_platform ON outlawz_verification_documents(platform_name);
CREATE INDEX idx_outlawz_docs_verified ON outlawz_verification_documents(is_verified);

-- ============================================================================
-- TRIGGERS: Auto-update timestamps
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_outlawz_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for outlawz_profiles
CREATE TRIGGER trigger_outlawz_profiles_updated_at
    BEFORE UPDATE ON outlawz_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_outlawz_timestamp();

-- Trigger for outlawz_clips
CREATE TRIGGER trigger_outlawz_clips_updated_at
    BEFORE UPDATE ON outlawz_clips
    FOR EACH ROW
    EXECUTE FUNCTION update_outlawz_timestamp();

-- Trigger for outlawz_verification_documents
CREATE TRIGGER trigger_outlawz_docs_updated_at
    BEFORE UPDATE ON outlawz_verification_documents
    FOR EACH ROW
    EXECUTE FUNCTION update_outlawz_timestamp();

-- ============================================================================
-- VIEWS: Convenience views for common queries
-- ============================================================================

-- Active Outlawz Profiles (approved and not deleted)
CREATE OR REPLACE VIEW view_active_outlawz AS
SELECT
    op.*,
    u.username,
    u.display_name,
    u.avatar_url,
    COUNT(DISTINCT oc.id) as clip_count,
    COALESCE(SUM(oc.view_count), 0) as total_clip_views
FROM outlawz_profiles op
JOIN users u ON op.creator_id = u.id
LEFT JOIN outlawz_clips oc ON op.id = oc.outlawz_profile_id
    AND oc.is_published = TRUE
    AND oc.deleted_at IS NULL
WHERE op.status = 'approved'
    AND op.deleted_at IS NULL
    AND u.deleted_at IS NULL
GROUP BY op.id, u.id;

-- Published Outlawz Clips (ready for showcase)
CREATE OR REPLACE VIEW view_published_outlawz_clips AS
SELECT
    oc.*,
    op.creator_id,
    u.username,
    u.display_name,
    u.avatar_url,
    op.badge_tier,
    op.banned_from
FROM outlawz_clips oc
JOIN outlawz_profiles op ON oc.outlawz_profile_id = op.id
JOIN users u ON oc.creator_id = u.id
WHERE oc.is_published = TRUE
    AND oc.deleted_at IS NULL
    AND oc.compliance_status = 'approved'
    AND op.status = 'approved'
    AND op.deleted_at IS NULL;

-- ============================================================================
-- SAMPLE DATA (for development/testing)
-- Uncomment to insert sample data
-- ============================================================================

-- INSERT INTO outlawz_profiles (creator_id, banned_from, banned_reason, status, is_featured, badge_tier)
-- VALUES
--     ((SELECT id FROM users WHERE username = 'examplecreator' LIMIT 1),
--      ARRAY['OnlyFans', 'JustForFans'],
--      'Content policy violation',
--      'approved',
--      TRUE,
--      'legend');

-- ============================================================================
-- GRANTS: Set appropriate permissions
-- Adjust based on your user roles
-- ============================================================================

-- Grant select to all authenticated users
GRANT SELECT ON view_active_outlawz TO PUBLIC;
GRANT SELECT ON view_published_outlawz_clips TO PUBLIC;

-- Grant CRUD to application role (adjust role name as needed)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON outlawz_profiles TO fanz_app_role;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON outlawz_clips TO fanz_app_role;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON outlawz_analytics TO fanz_app_role;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON outlawz_verification_documents TO fanz_app_role;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Log completion
DO $$
BEGIN
    RAISE NOTICE 'Outlawz Program schema migration completed successfully!';
    RAISE NOTICE 'Tables created:';
    RAISE NOTICE '  - outlawz_profiles';
    RAISE NOTICE '  - outlawz_clips';
    RAISE NOTICE '  - outlawz_analytics';
    RAISE NOTICE '  - outlawz_verification_documents';
    RAISE NOTICE 'Views created:';
    RAISE NOTICE '  - view_active_outlawz';
    RAISE NOTICE '  - view_published_outlawz_clips';
END $$;

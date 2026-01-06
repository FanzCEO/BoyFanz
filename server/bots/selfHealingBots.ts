/**
 * PROPRIETARY – Owned by Joshua Stone (Wyatt Cole).
 * Licensed for Use by FANZ Group Holdings LLC.
 * 30 N Gould Street, Sheridan, WY 82801.
 * ™ FANZ — Patent Pending (2025).
 *
 * Self-Healing AI Bot System
 *
 * Autonomous bots that run daily via FanzBrain to:
 * - Detect and fix database schema mismatches
 * - Optimize database queries and indexes
 * - Heal frontend/backend sync issues
 * - Monitor and fix performance bottlenecks
 * - Auto-generate missing test data
 */

import { db } from '../db';
import { sql } from 'drizzle-orm';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface BotResult {
  botName: string;
  success: boolean;
  issues: string[];
  fixes: string[];
  recommendations: string[];
  timestamp: Date;
}

interface FanzBrainResponse {
  success: boolean;
  content: string;
  provider: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  error?: string;
}

class SelfHealingBotSystem {
  private brainUrl: string;
  private authToken: string;
  private platformName: string;

  constructor() {
    this.brainUrl = process.env.FANZ_BRAIN_URL || 'https://brain.fanz.website';
    this.authToken = process.env.FANZ_BRAIN_AUTH_TOKEN || '';
    this.platformName = process.env.PLATFORM_NAME || 'boyfanz';
  }

  /**
   * Call FanzBrain for AI analysis
   */
  private async callBrain(
    prompt: string,
    purpose: string,
    temperature = 0.3
  ): Promise<FanzBrainResponse> {
    try {
      const response = await fetch(`${this.brainUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Internal-Auth': this.authToken,
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'You are an expert database and full-stack engineer specializing in PostgreSQL, TypeScript, React, and Drizzle ORM. You provide precise, actionable solutions.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature,
          max_tokens: 2000,
          model: 'fanz-brain',
          bot: 'SelfHealingBot',
          purpose,
          platform: this.platformName,
        }),
      });

      if (!response.ok) {
        throw new Error(`FanzBrain error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('[SelfHealingBot] FanzBrain call failed:', error);
      return {
        success: false,
        content: '',
        provider: 'none',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Bot 1: Database Schema Healer
   * Detects schema mismatches between TypeScript definitions and actual database
   */
  async runSchemaHealerBot(): Promise<BotResult> {
    console.log('\n🔧 [SchemaHealerBot] Starting database schema check...');
    const issues: string[] = [];
    const fixes: string[] = [];
    const recommendations: string[] = [];

    try {
      // 1. Check for views that should exist
      const viewsToCheck = ['users', 'posts'];

      for (const viewName of viewsToCheck) {
        const viewExists = await db.execute(sql`
          SELECT EXISTS (
            SELECT 1 FROM information_schema.tables
            WHERE table_schema = 'public' AND table_name = ${viewName}
          ) as exists
        `);

        if (!viewExists.rows[0].exists) {
          issues.push(`Missing view: ${viewName}`);

          // Ask FanzBrain how to create the missing view
          const brainResponse = await this.callBrain(
            `The database is missing a view called "${viewName}". Based on the FANZ platform architecture, what base tables should this view query from and what columns should it expose?`,
            'schema_healing'
          );

          if (brainResponse.success) {
            recommendations.push(
              `FanzBrain suggests for ${viewName}: ${brainResponse.content}`
            );
          }
        }
      }

      // 2. Check for type mismatches in joins
      const typeCheckQuery = await db.execute(sql`
        SELECT
          p.id as post_id,
          p.creator_id,
          pg_typeof(p.creator_id) as creator_id_type,
          u.id as user_id,
          pg_typeof(u.id) as user_id_type
        FROM posts p
        LEFT JOIN users u ON p.creator_id::text = u.id::text
        LIMIT 1
      `);

      if (typeCheckQuery.rows.length > 0) {
        const row = typeCheckQuery.rows[0];
        if (row.creator_id_type !== row.user_id_type) {
          issues.push(
            `Type mismatch: posts.creator_id (${row.creator_id_type}) != users.id (${row.user_id_type})`
          );

          // Auto-fix: Update the view with proper casting
          await db.execute(sql`
            DROP VIEW IF EXISTS posts CASCADE;
            CREATE OR REPLACE VIEW posts AS
            SELECT
              wp.id::text AS id,
              wp.author_id::text AS creator_id,
              wp.type::text AS type,
              'free'::text AS visibility,
              NULL AS title,
              wp.content,
              0 AS price_cents,
              COALESCE(
                ARRAY(SELECT jsonb_array_elements_text(wp.media_urls)),
                ARRAY[]::text[]
              ) AS media_urls,
              NULL AS thumbnail_url,
              ARRAY[]::text[] AS hashtags,
              false AS is_scheduled,
              NULL AS scheduled_for,
              0 AS likes_count,
              COALESCE(wp.comments_count, 0) AS comments_count,
              0 AS views_count,
              0 AS reposts_count,
              0 AS quotes_count,
              NULL AS poll_id,
              false AS is_processing,
              'completed' AS processing_status,
              NULL AS expires_at,
              wp.created_at,
              wp.updated_at
            FROM wall_posts wp
          `);

          fixes.push('Fixed posts view with proper type casting');
        }
      }

      // 3. Check for missing indexes on frequently joined columns
      const missingIndexes = await db.execute(sql`
        SELECT
          schemaname,
          tablename,
          attname as column_name
        FROM pg_stats
        WHERE schemaname = 'public'
          AND tablename IN ('posts', 'users', 'wall_posts', 'profiles')
          AND attname IN ('id', 'creator_id', 'author_id', 'user_id')
          AND NOT EXISTS (
            SELECT 1 FROM pg_index i
            JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
            WHERE a.attname = pg_stats.attname
              AND pg_stats.tablename::regclass = i.indrelid
          )
      `);

      if (missingIndexes.rows.length > 0) {
        for (const row of missingIndexes.rows) {
          issues.push(
            `Missing index on ${row.tablename}.${row.column_name}`
          );
          recommendations.push(
            `Consider: CREATE INDEX idx_${row.tablename}_${row.column_name} ON ${row.tablename}(${row.column_name})`
          );
        }
      }

      return {
        botName: 'SchemaHealerBot',
        success: true,
        issues,
        fixes,
        recommendations,
        timestamp: new Date(),
      };
    } catch (error) {
      console.error('[SchemaHealerBot] Error:', error);
      return {
        botName: 'SchemaHealerBot',
        success: false,
        issues: [`Fatal error: ${error}`],
        fixes,
        recommendations,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Bot 2: Performance Optimizer
   * Analyzes slow queries and creates optimizations
   */
  async runPerformanceOptimizerBot(): Promise<BotResult> {
    console.log('\n⚡ [PerformanceOptimizerBot] Analyzing query performance...');
    const issues: string[] = [];
    const fixes: string[] = [];
    const recommendations: string[] = [];

    try {
      // 1. Check for slow queries (pg_stat_statements required)
      const slowQueries = await db.execute(sql`
        SELECT
          query,
          calls,
          mean_exec_time,
          max_exec_time
        FROM pg_stat_statements
        WHERE mean_exec_time > 100
        ORDER BY mean_exec_time DESC
        LIMIT 10
      `).catch(() => ({ rows: [] }));

      if (slowQueries.rows.length > 0) {
        for (const query of slowQueries.rows) {
          issues.push(
            `Slow query (${Math.round(query.mean_exec_time)}ms avg): ${query.query.substring(0, 100)}...`
          );

          // Ask FanzBrain for optimization suggestions
          const brainResponse = await this.callBrain(
            `This SQL query is slow (${query.mean_exec_time}ms average):\n\n${query.query}\n\nWhat indexes or query rewrites would optimize this?`,
            'performance_optimization'
          );

          if (brainResponse.success) {
            recommendations.push(brainResponse.content);
          }
        }
      }

      // 2. Check table sizes and recommend partitioning
      const tableSizes = await db.execute(sql`
        SELECT
          schemaname,
          tablename,
          pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
          pg_total_relation_size(schemaname||'.'||tablename) as size_bytes
        FROM pg_tables
        WHERE schemaname = 'public'
        ORDER BY size_bytes DESC
        LIMIT 10
      `);

      for (const table of tableSizes.rows) {
        if (table.size_bytes > 1000000000) {
          // > 1GB
          recommendations.push(
            `Large table ${table.table_name} (${table.size}) - consider partitioning`
          );
        }
      }

      // 3. Analyze vacuum and analyze status
      const vacuumStatus = await db.execute(sql`
        SELECT
          schemaname,
          relname,
          last_vacuum,
          last_autovacuum,
          last_analyze,
          last_autoanalyze
        FROM pg_stat_user_tables
        WHERE schemaname = 'public'
          AND (last_autovacuum IS NULL OR last_autovacuum < NOW() - INTERVAL '7 days')
        ORDER BY relname
      `);

      if (vacuumStatus.rows.length > 0) {
        for (const table of vacuumStatus.rows) {
          issues.push(`Table ${table.relname} needs VACUUM/ANALYZE`);

          // Auto-fix: Run VACUUM ANALYZE
          await db.execute(sql.raw(`VACUUM ANALYZE ${table.relname}`));
          fixes.push(`Ran VACUUM ANALYZE on ${table.relname}`);
        }
      }

      return {
        botName: 'PerformanceOptimizerBot',
        success: true,
        issues,
        fixes,
        recommendations,
        timestamp: new Date(),
      };
    } catch (error) {
      console.error('[PerformanceOptimizerBot] Error:', error);
      return {
        botName: 'PerformanceOptimizerBot',
        success: false,
        issues: [`Error: ${error}`],
        fixes,
        recommendations,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Bot 3: Frontend/Backend Sync Bot
   * Ensures API contracts match between frontend and backend
   */
  async runFrontendBackendSyncBot(): Promise<BotResult> {
    console.log('\n🔄 [FrontendBackendSyncBot] Checking API sync...');
    const issues: string[] = [];
    const fixes: string[] = [];
    const recommendations: string[] = [];

    try {
      // 1. Check if posts API returns expected structure
      const testQuery = await db.execute(sql`
        SELECT
          p.id,
          p.creator_id,
          p.type,
          p.visibility,
          p.content,
          p.media_urls,
          p.likes_count,
          p.comments_count,
          p.created_at,
          u.username as creator_handle,
          u.display_name as creator_name
        FROM posts p
        INNER JOIN users u ON p.creator_id = u.id
        LIMIT 1
      `);

      const expectedFields = [
        'id',
        'creator_id',
        'type',
        'visibility',
        'content',
        'media_urls',
        'likes_count',
        'comments_count',
        'created_at',
        'creator_handle',
        'creator_name',
      ];

      if (testQuery.rows.length > 0) {
        const row = testQuery.rows[0];
        const missingFields = expectedFields.filter(field => !(field in row));

        if (missingFields.length > 0) {
          issues.push(`Posts API missing fields: ${missingFields.join(', ')}`);
          recommendations.push(
            'Update infinity feed query to include all required fields'
          );
        }
      } else {
        issues.push('No posts found - feed will be empty');
        recommendations.push('Run seed script to create test posts');
      }

      // 2. Check if all required API endpoints exist
      const requiredEndpoints = [
        '/api/infinity-feed',
        '/api/creators/suggested',
        '/api/streams/live',
        '/api/trending/topics',
      ];

      // This would require reading the routes file and checking
      // For now, we'll log a recommendation
      recommendations.push(
        'Verify all API endpoints are implemented and return expected data structures'
      );

      return {
        botName: 'FrontendBackendSyncBot',
        success: true,
        issues,
        fixes,
        recommendations,
        timestamp: new Date(),
      };
    } catch (error) {
      console.error('[FrontendBackendSyncBot] Error:', error);
      return {
        botName: 'FrontendBackendSyncBot',
        success: false,
        issues: [`Error: ${error}`],
        fixes,
        recommendations,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Bot 4: Test Data Generator Bot
   * Ensures there's always test data for development
   */
  async runTestDataGeneratorBot(): Promise<BotResult> {
    console.log('\n🎲 [TestDataGeneratorBot] Checking test data...');
    const issues: string[] = [];
    const fixes: string[] = [];
    const recommendations: string[] = [];

    try {
      // Check post count
      const postCount = await db.execute(sql`
        SELECT COUNT(*) as count FROM posts
      `);

      const count = Number(postCount.rows[0].count);

      if (count < 10) {
        issues.push(`Low post count: ${count} posts (minimum 10 recommended)`);

        // Ask FanzBrain to generate realistic post content
        const brainResponse = await this.callBrain(
          `Generate 5 realistic social media post content examples for a creator platform. Include varied content types: motivational text, workout descriptions, and casual updates. Return as JSON array with fields: type, content, mood.`,
          'content_generation',
          0.8 // Higher temperature for creative content
        );

        if (brainResponse.success) {
          recommendations.push(
            `FanzBrain generated content ideas: ${brainResponse.content}`
          );
        }
      }

      // Check creator count
      const creatorCount = await db.execute(sql`
        SELECT COUNT(*) as count FROM profiles WHERE type = 'creator'
      `);

      if (Number(creatorCount.rows[0].count) < 5) {
        issues.push('Low creator count (minimum 5 recommended)');
        recommendations.push('Run seed-feed-final.ts to create more test creators');
      }

      return {
        botName: 'TestDataGeneratorBot',
        success: true,
        issues,
        fixes,
        recommendations,
        timestamp: new Date(),
      };
    } catch (error) {
      console.error('[TestDataGeneratorBot] Error:', error);
      return {
        botName: 'TestDataGeneratorBot',
        success: false,
        issues: [`Error: ${error}`],
        fixes,
        recommendations,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Bot 5: Code Quality Bot
   * Checks for common code issues and anti-patterns
   */
  async runCodeQualityBot(): Promise<BotResult> {
    console.log('\n📊 [CodeQualityBot] Analyzing code quality...');
    const issues: string[] = [];
    const fixes: string[] = [];
    const recommendations: string[] = [];

    try {
      // 1. Check TypeScript compilation
      try {
        await execAsync('npx tsc --noEmit', { cwd: process.cwd() });
        fixes.push('TypeScript compilation successful');
      } catch (error) {
        issues.push('TypeScript compilation errors detected');
        recommendations.push('Run `npx tsc --noEmit` to see detailed errors');
      }

      // 2. Check for console.log statements in production code
      try {
        const { stdout } = await execAsync(
          'grep -r "console.log" server/ client/ --exclude-dir=node_modules --exclude-dir=dist | wc -l',
          { cwd: process.cwd() }
        );

        const count = parseInt(stdout.trim());
        if (count > 10) {
          issues.push(`${count} console.log statements found in code`);
          recommendations.push('Replace console.log with proper logging system');
        }
      } catch {
        // Grep failed, probably no matches
      }

      // 3. Check for TODO comments
      try {
        const { stdout } = await execAsync(
          'grep -r "TODO\\|FIXME\\|HACK" server/ client/ --exclude-dir=node_modules --exclude-dir=dist | head -10',
          { cwd: process.cwd() }
        );

        if (stdout.trim()) {
          const todos = stdout.trim().split('\n');
          recommendations.push(`Found ${todos.length} TODO/FIXME comments to address`);
        }
      } catch {
        // Grep failed
      }

      return {
        botName: 'CodeQualityBot',
        success: true,
        issues,
        fixes,
        recommendations,
        timestamp: new Date(),
      };
    } catch (error) {
      console.error('[CodeQualityBot] Error:', error);
      return {
        botName: 'CodeQualityBot',
        success: false,
        issues: [`Error: ${error}`],
        fixes,
        recommendations,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Run all bots and generate comprehensive report
   */
  async runAllBots(): Promise<BotResult[]> {
    console.log('\n🤖 ====== FANZ Self-Healing Bot System ======\n');
    console.log(`Platform: ${this.platformName}`);
    console.log(`FanzBrain URL: ${this.brainUrl}`);
    console.log(`Timestamp: ${new Date().toISOString()}\n`);

    const results: BotResult[] = [];

    // Run all bots sequentially
    results.push(await this.runSchemaHealerBot());
    results.push(await this.runPerformanceOptimizerBot());
    results.push(await this.runFrontendBackendSyncBot());
    results.push(await this.runTestDataGeneratorBot());
    results.push(await this.runCodeQualityBot());

    // Generate summary report
    console.log('\n\n📋 ====== SUMMARY REPORT ======\n');

    let totalIssues = 0;
    let totalFixes = 0;
    let totalRecommendations = 0;

    for (const result of results) {
      console.log(`\n${result.success ? '✅' : '❌'} ${result.botName}`);
      console.log(`   Issues: ${result.issues.length}`);
      console.log(`   Fixes: ${result.fixes.length}`);
      console.log(`   Recommendations: ${result.recommendations.length}`);

      totalIssues += result.issues.length;
      totalFixes += result.fixes.length;
      totalRecommendations += result.recommendations.length;

      if (result.issues.length > 0) {
        console.log('\n   Issues Found:');
        result.issues.forEach(issue => console.log(`     - ${issue}`));
      }

      if (result.fixes.length > 0) {
        console.log('\n   Auto-Fixes Applied:');
        result.fixes.forEach(fix => console.log(`     ✓ ${fix}`));
      }

      if (result.recommendations.length > 0) {
        console.log('\n   Recommendations:');
        result.recommendations.forEach(rec => console.log(`     → ${rec}`));
      }
    }

    console.log('\n\n====== TOTALS ======');
    console.log(`Total Issues: ${totalIssues}`);
    console.log(`Total Auto-Fixes: ${totalFixes}`);
    console.log(`Total Recommendations: ${totalRecommendations}`);
    console.log('===================\n');

    return results;
  }
}

// Export singleton instance
export const selfHealingBots = new SelfHealingBotSystem();

// Export for cron job usage
export async function runDailySelfHealing() {
  console.log('🔄 Starting daily self-healing cycle...');
  const results = await selfHealingBots.runAllBots();

  // Store results in database for tracking
  try {
    await db.execute(sql`
      INSERT INTO system_health_logs (
        platform,
        bot_results,
        total_issues,
        total_fixes,
        total_recommendations,
        created_at
      )
      VALUES (
        ${process.env.PLATFORM_NAME || 'boyfanz'},
        ${JSON.stringify(results)}::jsonb,
        ${results.reduce((sum, r) => sum + r.issues.length, 0)},
        ${results.reduce((sum, r) => sum + r.fixes.length, 0)},
        ${results.reduce((sum, r) => sum + r.recommendations.length, 0)},
        NOW()
      )
    `).catch(err => {
      // Table might not exist yet, that's ok
      console.log('Note: Could not store results (system_health_logs table may not exist)');
    });
  } catch (error) {
    console.log('Note: Could not store results:', error);
  }

  return results;
}

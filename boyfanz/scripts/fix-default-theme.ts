// Fix default theme with proper color values
import { db } from '../server/db';
import { sql } from 'drizzle-orm';

async function fixDefaultTheme() {
  console.log('🎨 Fixing default theme...');

  try {
    // Get current default theme
    const currentTheme = await db.execute(sql`
      SELECT * FROM theme_settings WHERE is_active = true
    `);

    console.log('Current theme:', currentTheme.rows[0]);

    // Update with proper default colors
    await db.execute(sql`
      UPDATE theme_settings
      SET
        colors = ${JSON.stringify({
          primary: '#3b82f6',
          secondary: '#8b5cf6',
          accent: '#ec4899',
          background: '#0f172a',
          foreground: '#f8fafc',
          card: '#1e293b',
          cardForeground: '#f8fafc',
          popover: '#1e293b',
          popoverForeground: '#f8fafc',
          muted: '#334155',
          mutedForeground: '#94a3b8',
          destructive: '#ef4444',
          destructiveForeground: '#fef2f2',
          border: '#334155',
          input: '#1e293b',
          ring: '#3b82f6',
          success: '#10b981',
          warning: '#f59e0b',
          info: '#06b6d4',
        })}::jsonb,
        typography = ${JSON.stringify({
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: {
            xs: '0.75rem',
            sm: '0.875rem',
            base: '1rem',
            lg: '1.125rem',
            xl: '1.25rem',
            '2xl': '1.5rem',
            '3xl': '1.875rem',
            '4xl': '2.25rem',
          },
          fontWeight: {
            normal: '400',
            medium: '500',
            semibold: '600',
            bold: '700',
          },
        })}::jsonb,
        effects = ${JSON.stringify({
          borderRadius: {
            sm: '0.25rem',
            md: '0.375rem',
            lg: '0.5rem',
            xl: '0.75rem',
            '2xl': '1rem',
            full: '9999px',
          },
          shadow: {
            sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
            md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
            xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
          },
        })}::jsonb,
        updated_at = NOW()
      WHERE is_active = true
    `);

    console.log('✓ Updated default theme with proper values');

    // Verify the update
    const updatedTheme = await db.execute(sql`
      SELECT * FROM theme_settings WHERE is_active = true
    `);

    console.log('\n✓ Theme now has:');
    console.log(`   Colors: ${Object.keys(updatedTheme.rows[0].colors || {}).length} properties`);
    console.log(`   Typography: ${Object.keys(updatedTheme.rows[0].typography || {}).length} properties`);
    console.log(`   Effects: ${Object.keys(updatedTheme.rows[0].effects || {}).length} properties`);

    console.log('\n✅ Default theme fixed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to fix theme:', error);
    process.exit(1);
  }
}

fixDefaultTheme();

import { useState } from 'react'
import { Palette, Save, RotateCcw } from 'lucide-react'
import { useDataStore } from '../../context/DataStore'

const PRESETS = {
  'dswd-default': { colorPrimary: '#0047AB', colorSecondary: '#C8102E', colorAccent: '#FFD700', colorBackground: '#FFFFFF', colorText: '#1a1a1a', label: 'DSWD Default' },
  'dark-pro': { colorPrimary: '#6366f1', colorSecondary: '#ec4899', colorAccent: '#f59e0b', colorBackground: '#111827', colorText: '#f9fafb', label: 'Dark Pro' },
  'forest-green': { colorPrimary: '#166534', colorSecondary: '#065f46', colorAccent: '#fbbf24', colorBackground: '#f0fdf4', colorText: '#14532d', label: 'Forest Green' },
  'ocean-blue': { colorPrimary: '#0369a1', colorSecondary: '#0e7490', colorAccent: '#f97316', colorBackground: '#f0f9ff', colorText: '#0c4a6e', label: 'Ocean Blue' },
}

const FONT_SIZES = [14, 15, 16, 17, 18, 20]
const RADII = [0, 4, 6, 8, 12, 16, 24]

export default function AdminTheme() {
  const { themeSettings, updateThemeSettings } = useDataStore()
  const [local, setLocal] = useState(themeSettings || PRESETS['dswd-default'])
  const [saved, setSaved] = useState(false)

  function apply(updates) {
    setLocal(prev => ({ ...prev, ...updates }))
  }

  function applyPreset(key) {
    const p = PRESETS[key]
    setLocal(prev => ({ ...prev, ...p, preset: key }))
  }

  function handleSave() {
    updateThemeSettings(local)
    // Apply CSS custom properties live
    const root = document.documentElement
    root.style.setProperty('--color-primary', local.colorPrimary)
    root.style.setProperty('--color-secondary', local.colorSecondary)
    root.style.setProperty('--color-accent', local.colorAccent)
    root.style.setProperty('--color-bg', local.colorBackground)
    root.style.setProperty('--color-text', local.colorText)
    root.style.setProperty('--font-size-base', local.fontSizeBase + 'px')
    root.style.setProperty('--border-radius', local.borderRadius + 'px')
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  function handleReset() {
    const defaults = PRESETS['dswd-default']
    setLocal({ ...defaults, preset: 'dswd-default', fontSizeBase: 16, borderRadius: 8 })
  }

  const ColorSwatch = ({ label, field }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.875rem' }}>
      <input type="color" value={local[field] || '#000000'} onChange={e => apply({ [field]: e.target.value })}
        style={{ width: 44, height: 36, border: '1px solid #d1d5db', borderRadius: 6, cursor: 'pointer', padding: 2 }} />
      <div>
        <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{label}</div>
        <div style={{ fontSize: '0.75rem', color: '#6b7280', fontFamily: 'monospace' }}>{local[field]}</div>
      </div>
    </div>
  )

  return (
    <main id="main-content" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Palette size={22} /> Theme Customizer
        </h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={handleReset} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', border: '1px solid #d1d5db', borderRadius: 8, background: '#fff', cursor: 'pointer', fontSize: '0.875rem' }}>
            <RotateCcw size={14} /> Reset
          </button>
          <button onClick={handleSave} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1.1rem', background: 'var(--color-primary,#0047AB)', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}>
            <Save size={14} /> {saved ? '✓ Saved!' : 'Apply & Save'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
        {/* Presets */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '1.25rem' }}>
          <h2 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1rem' }}>🎨 Presets</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {Object.entries(PRESETS).map(([key, preset]) => (
              <button key={key} onClick={() => applyPreset(key)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem 0.875rem', border: `2px solid ${local.preset === key ? 'var(--color-primary,#0047AB)' : '#e5e7eb'}`, borderRadius: 8, background: local.preset === key ? '#eff6ff' : '#fff', cursor: 'pointer', textAlign: 'left' }}>
                <div style={{ display: 'flex', gap: 3 }}>
                  {[preset.colorPrimary, preset.colorSecondary, preset.colorAccent].map((c, i) => (
                    <div key={i} style={{ width: 14, height: 14, borderRadius: 3, background: c, border: '1px solid rgba(0,0,0,0.1)' }} />
                  ))}
                </div>
                <span style={{ fontSize: '0.875rem', fontWeight: local.preset === key ? 700 : 400 }}>{preset.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Colors */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '1.25rem' }}>
          <h2 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1rem' }}>🎨 Colors</h2>
          <ColorSwatch label="Primary" field="colorPrimary" />
          <ColorSwatch label="Secondary" field="colorSecondary" />
          <ColorSwatch label="Accent" field="colorAccent" />
          <ColorSwatch label="Background" field="colorBackground" />
          <ColorSwatch label="Text" field="colorText" />
        </div>

        {/* Typography & Shape */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '1.25rem' }}>
          <h2 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1rem' }}>🔡 Typography & Shape</h2>
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Base Font Size</div>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {FONT_SIZES.map(s => (
                <button key={s} onClick={() => apply({ fontSizeBase: s })}
                  style={{ padding: '0.35rem 0.75rem', border: `2px solid ${local.fontSizeBase === s ? 'var(--color-primary,#0047AB)' : '#e5e7eb'}`, borderRadius: 6, background: local.fontSizeBase === s ? '#eff6ff' : '#fff', cursor: 'pointer', fontSize: '0.8rem', fontWeight: local.fontSizeBase === s ? 700 : 400 }}>
                  {s}px
                </button>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Border Radius</div>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {RADII.map(r => (
                <button key={r} onClick={() => apply({ borderRadius: r })}
                  style={{ padding: '0.35rem 0.75rem', border: `2px solid ${local.borderRadius === r ? 'var(--color-primary,#0047AB)' : '#e5e7eb'}`, borderRadius: 6, background: local.borderRadius === r ? '#eff6ff' : '#fff', cursor: 'pointer', fontSize: '0.8rem', fontWeight: local.borderRadius === r ? 700 : 400 }}>
                  {r}px
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Live Preview */}
        <div style={{ background: local.colorBackground, border: '2px dashed #d1d5db', borderRadius: 12, padding: '1.25rem', gridColumn: 'span 1' }}>
          <h2 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1rem', color: local.colorText }}>👁 Live Preview</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button style={{ background: local.colorPrimary, color: '#fff', border: 'none', borderRadius: local.borderRadius, padding: '0.6rem 1.25rem', fontSize: local.fontSizeBase, fontWeight: 600, cursor: 'pointer' }}>Primary Button</button>
            <button style={{ background: local.colorSecondary, color: '#fff', border: 'none', borderRadius: local.borderRadius, padding: '0.6rem 1.25rem', fontSize: local.fontSizeBase, fontWeight: 600, cursor: 'pointer' }}>Secondary Button</button>
            <div style={{ background: local.colorAccent, borderRadius: local.borderRadius, padding: '0.4rem 0.75rem', fontSize: Math.max(12, local.fontSizeBase - 2), fontWeight: 700, textAlign: 'center', color: '#000' }}>Accent Badge</div>
            <p style={{ fontSize: local.fontSizeBase, color: local.colorText, margin: 0 }}>Sample text for readability check. DSWD IncluMarket — empowering PWD livelihoods.</p>
          </div>
        </div>
      </div>
    </main>
  )
}

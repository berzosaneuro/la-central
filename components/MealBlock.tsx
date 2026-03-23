'use client'

/**
 * components/MealBlock.tsx
 * ─────────────────────────────────────────────────────────────────
 * Bloque de comida desplegable con:
 *  - Vista colapsada: icono + label + resumen de macros
 *  - Vista expandida: lista de ingredientes editables (gramos)
 *  - Selector inline de alimentos con búsqueda
 *  - Opción "alimento personalizado" vía modal externo
 * ─────────────────────────────────────────────────────────────────
 */

import { useState, useRef, useEffect } from 'react'

/* ── Tipos públicos (importados en page.tsx) ──────────────────── */
export interface FoodOption {
  id:           string
  name:         string
  defaultGrams: number
  protein:      number   // g por 100g
  carbs:        number   // g por 100g
  fat:          number   // g por 100g
  kcal:         number   // kcal por 100g
  category:     'proteina' | 'carbo' | 'verdura' | 'grasa' | 'suplemento'
}

export interface FoodEntry {
  food:  FoodOption
  grams: number
}

export interface MacroTotals {
  protein: number
  carbs:   number
  fat:     number
  kcal:    number
}

/* ── Utilidad de cálculo (exportada para uso en page.tsx) ──────── */
export function calcMacros(entries: FoodEntry[]): MacroTotals {
  return entries.reduce(
    (acc, { food, grams }) => {
      const r = grams / 100
      return {
        protein: acc.protein + food.protein * r,
        carbs:   acc.carbs   + food.carbs   * r,
        fat:     acc.fat     + food.fat     * r,
        kcal:    acc.kcal    + food.kcal    * r,
      }
    },
    { protein: 0, carbs: 0, fat: 0, kcal: 0 }
  )
}

/* ── Props ─────────────────────────────────────────────────────── */
interface MealBlockProps {
  icon:          string
  label:         string
  timing?:       string
  entries:       FoodEntry[]
  foodLibrary:   FoodOption[]
  onUpdateGrams: (index: number, grams: number) => void
  onRemoveEntry: (index: number) => void
  onAddFood:     (food: FoodOption) => void
  onAddCustom:   () => void
  defaultOpen?:  boolean
}

const CATEGORY_COLORS: Record<FoodOption['category'], string> = {
  proteina:   '#00F0FF',
  carbo:      '#FFB800',
  verdura:    '#00FF88',
  grasa:      '#FF6B35',
  suplemento: '#CC88FF',
}

/* ── Componente ────────────────────────────────────────────────── */
export default function MealBlock({
  icon, label, timing, entries, foodLibrary,
  onUpdateGrams, onRemoveEntry, onAddFood, onAddCustom,
  defaultOpen = false,
}: MealBlockProps) {
  const [isOpen,      setIsOpen]      = useState(defaultOpen)
  const [showPicker,  setShowPicker]  = useState(false)
  const [search,      setSearch]      = useState('')
  const searchRef = useRef<HTMLInputElement>(null)

  const macros   = calcMacros(entries)
  const filtered = foodLibrary.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase())
  )

  /* Auto-focus búsqueda al abrir picker */
  useEffect(() => {
    if (showPicker) searchRef.current?.focus()
  }, [showPicker])

  const handleToggle = () => {
    setIsOpen(o => !o)
    if (isOpen) setShowPicker(false)
  }

  const handleAddFood = (food: FoodOption) => {
    onAddFood(food)
    setSearch('')
  }

  /* ── Render ─────────────────────────────────────────────────── */
  return (
    <div className="cyber-card meal-block">

      {/* ── Header (siempre visible) ── */}
      <div className="meal-block-header" onClick={handleToggle}>
        <div className="card-icon" style={{ margin: 0, fontSize: 20 }}>{icon}</div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="card-title" style={{ marginBottom: 2, fontSize: 13 }}>
            {label}
            {timing && (
              <span style={{ color: 'var(--metal-grey)', fontSize: 10, fontWeight: 400, marginLeft: 6, letterSpacing: 0.5 }}>
                {timing}
              </span>
            )}
          </div>

          {/* Resumen colapsado */}
          {!isOpen && (
            <div style={{ fontSize: 11, fontWeight: 600, color: entries.length ? 'var(--neon-blue)' : 'rgba(136,153,166,0.5)' }}>
              {entries.length === 0
                ? 'Vacío — toca para añadir alimentos'
                : `${Math.round(macros.kcal)} kcal · ${Math.round(macros.protein)}P / ${Math.round(macros.carbs)}C / ${Math.round(macros.fat)}F`
              }
            </div>
          )}
        </div>

        {/* Chevron */}
        <div style={{
          color:      'var(--neon-blue)',
          opacity:    0.6,
          fontSize:   13,
          flexShrink: 0,
          transition: 'transform 200ms ease',
          transform:  isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
        }}>▾</div>
      </div>

      {/* ── Cuerpo expandido ── */}
      {isOpen && (
        <div className="meal-block-body">

          {/* Lista de ingredientes */}
          {entries.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '18px 0', color: 'var(--metal-grey)', fontSize: 13 }}>
              Sin alimentos — usa el botón de abajo para añadir
            </div>
          ) : (
            <>
              {entries.map((entry, i) => (
                <div key={`${entry.food.id}-${i}`}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 0' }}>
                    {/* Indicador de categoría */}
                    <div style={{
                      width:        3,
                      height:       32,
                      borderRadius: 2,
                      background:   CATEGORY_COLORS[entry.food.category],
                      flexShrink:   0,
                    }} />

                    {/* Info alimento */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="text-chrome" style={{ fontSize: 13, marginBottom: 2 }}>
                        {entry.food.name}
                      </div>
                      <div className="text-small">
                        {Math.round(entry.food.protein * entry.grams / 100)}P ·{' '}
                        {Math.round(entry.food.carbs * entry.grams / 100)}C ·{' '}
                        {Math.round(entry.food.fat * entry.grams / 100)}F ·{' '}
                        <span style={{ color: 'var(--neon-blue)', fontWeight: 700 }}>
                          {Math.round(entry.food.kcal * entry.grams / 100)} kcal
                        </span>
                      </div>
                    </div>

                    {/* Input gramos */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
                      <input
                        type="number"
                        value={entry.grams}
                        min={1}
                        max={9999}
                        onChange={e => onUpdateGrams(i, Math.max(1, parseInt(e.target.value) || 1))}
                        className="cyber-input"
                        style={{ width: 56, textAlign: 'center', padding: '5px 4px', fontSize: 13, height: 32 }}
                        onClick={e => e.stopPropagation()}
                      />
                      <span style={{ fontSize: 11, color: 'var(--metal-grey)' }}>g</span>
                    </div>

                    {/* Eliminar */}
                    <button
                      onClick={e => { e.stopPropagation(); onRemoveEntry(i) }}
                      style={{
                        background: 'none', border: 'none', padding: '4px 2px',
                        color: 'var(--danger)', cursor: 'pointer', opacity: 0.65,
                        fontSize: 14, lineHeight: 1, flexShrink: 0,
                        transition: 'opacity 150ms',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                      onMouseLeave={e => (e.currentTarget.style.opacity = '0.65')}
                    >✕</button>
                  </div>

                  {i < entries.length - 1 && <div className="divider" style={{ margin: 0 }} />}
                </div>
              ))}

              {/* Total de la comida */}
              <div style={{
                display:        'flex',
                justifyContent: 'space-between',
                alignItems:     'center',
                padding:        '10px 0 4px',
                borderTop:      '1px solid rgba(255,255,255,0.06)',
                marginTop:      4,
              }}>
                <span className="text-small" style={{ color: 'var(--metal-grey)' }}>
                  {Math.round(macros.protein)}P · {Math.round(macros.carbs)}C · {Math.round(macros.fat)}F
                </span>
                <span style={{ color: 'var(--neon-blue)', fontWeight: 700, fontSize: 14 }}>
                  {Math.round(macros.kcal)} kcal
                </span>
              </div>
            </>
          )}

          {/* Botón añadir / cerrar selector */}
          <div
            onClick={() => setShowPicker(p => !p)}
            className="meal-add-btn"
            style={{ color: showPicker ? 'var(--metal-grey)' : 'var(--neon-blue)' }}
          >
            {showPicker ? '▲ CERRAR' : '＋ AÑADIR ALIMENTO'}
          </div>

          {/* ── Picker inline ── */}
          {showPicker && (
            <div className="food-picker">
              {/* Búsqueda */}
              <input
                ref={searchRef}
                className="cyber-input"
                placeholder="🔍  Buscar alimento..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ width: '100%', marginBottom: 6 }}
              />

              {/* Lista de alimentos */}
              <div className="food-picker-list">
                {filtered.length === 0 ? (
                  <div className="text-small" style={{ textAlign: 'center', padding: '16px 0' }}>
                    No se encontró «{search}»
                  </div>
                ) : (
                  filtered.map(food => (
                    <div
                      key={food.id}
                      className="food-picker-row"
                      onClick={() => handleAddFood(food)}
                    >
                      {/* Dot de categoría */}
                      <div style={{
                        width: 6, height: 6, borderRadius: '50%',
                        background: CATEGORY_COLORS[food.category],
                        flexShrink: 0, marginRight: 4,
                      }} />

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="text-chrome" style={{ fontSize: 13 }}>{food.name}</div>
                        <div className="text-small">
                          {food.defaultGrams}g · {food.protein}P/{food.carbs}C/{food.fat}F por 100g
                        </div>
                      </div>
                      <span style={{ color: 'var(--success)', fontSize: 18, fontWeight: 700, flexShrink: 0 }}>＋</span>
                    </div>
                  ))
                )}
              </div>

              {/* Personalizado */}
              <div
                onClick={() => { setShowPicker(false); onAddCustom() }}
                style={{
                  textAlign:     'center',
                  padding:       '10px 0 2px',
                  cursor:        'pointer',
                  color:         'var(--metal-grey)',
                  fontSize:      11,
                  letterSpacing: 1.5,
                  fontWeight:    600,
                  borderTop:     '1px solid rgba(255,255,255,0.06)',
                  marginTop:     4,
                  transition:    'color 150ms',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--chrome)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--metal-grey)')}
              >
                ⚙ CREAR ALIMENTO PERSONALIZADO
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

'use client'

/**
 * app/creador/page.tsx — TITAN OS v3.0
 * ─────────────────────────────────────────────────────────────────
 * Herramienta real de planificación nutricional + entrenamiento.
 *
 * DIETA:
 *  • 3 variantes de día (A/B/C) independientes entre sí
 *  • 5 comidas principales + 3 bloques peri-entreno por variante
 *  • Macros calculados dinámicamente al editar gramos
 *  • Selector de alimentos con búsqueda + alimentos personalizados
 *
 * ENTRENO: idéntico al original (sin cambios)
 * ─────────────────────────────────────────────────────────────────
 */

import { useState, useMemo } from 'react'
import { useModal, useToast } from '@/lib/context'
import MealBlock, { FoodOption, FoodEntry, calcMacros } from '@/components/MealBlock'

type CreatorTab = 'diet' | 'train'

/* ══════════════════════════════════════════════════════════════
   BIBLIOTECA DE ALIMENTOS
   Valores: macros por 100g · kcal por 100g
══════════════════════════════════════════════════════════════ */
const FOOD_LIBRARY: FoodOption[] = [
  // ── Proteínas ────────────────────────────────────────────────
  { id: 'pollo',       name: 'Pechuga de Pollo',      defaultGrams: 150, protein: 31,   carbs: 0,    fat: 3.6,  kcal: 165,  category: 'proteina' },
  { id: 'ternera',     name: 'Ternera Magra',          defaultGrams: 150, protein: 26,   carbs: 0,    fat: 5,    kcal: 152,  category: 'proteina' },
  { id: 'salmon',      name: 'Salmón',                 defaultGrams: 150, protein: 25,   carbs: 0,    fat: 13,   kcal: 221,  category: 'proteina' },
  { id: 'merluza',     name: 'Merluza',                defaultGrams: 150, protein: 16,   carbs: 0,    fat: 2.2,  kcal: 86,   category: 'proteina' },
  { id: 'atun',        name: 'Atún al Natural',        defaultGrams: 100, protein: 26,   carbs: 0,    fat: 1,    kcal: 116,  category: 'proteina' },
  { id: 'huevo',       name: 'Huevo Entero',           defaultGrams: 120, protein: 13,   carbs: 1.1,  fat: 10,   kcal: 155,  category: 'proteina' },
  { id: 'clara',       name: 'Clara de Huevo',         defaultGrams: 150, protein: 11,   carbs: 1.7,  fat: 0.2,  kcal: 52,   category: 'proteina' },
  { id: 'iso',         name: 'Proteína ISO',           defaultGrams: 30,  protein: 80,   carbs: 5,    fat: 2,    kcal: 360,  category: 'proteina' },
  { id: 'pavo',        name: 'Pechuga de Pavo',        defaultGrams: 150, protein: 29,   carbs: 0,    fat: 2,    kcal: 135,  category: 'proteina' },

  // ── Carbohidratos ─────────────────────────────────────────────
  { id: 'arroz',       name: 'Arroz Blanco',           defaultGrams: 100, protein: 2.7,  carbs: 79,   fat: 0.3,  kcal: 330,  category: 'carbo'    },
  { id: 'arroz-bas',   name: 'Arroz Basmati',          defaultGrams: 100, protein: 3.5,  carbs: 77,   fat: 0.5,  kcal: 325,  category: 'carbo'    },
  { id: 'patata',      name: 'Patata Cocida',          defaultGrams: 200, protein: 2,    carbs: 17,   fat: 0.1,  kcal: 77,   category: 'carbo'    },
  { id: 'batata',      name: 'Batata',                 defaultGrams: 150, protein: 1.6,  carbs: 20,   fat: 0.1,  kcal: 86,   category: 'carbo'    },
  { id: 'avena',       name: 'Avena',                  defaultGrams: 80,  protein: 13,   carbs: 66,   fat: 7,    kcal: 379,  category: 'carbo'    },
  { id: 'crema-arroz', name: 'Crema de Arroz',         defaultGrams: 80,  protein: 7,    carbs: 82,   fat: 1,    kcal: 365,  category: 'carbo'    },
  { id: 'pan-int',     name: 'Pan Integral',           defaultGrams: 60,  protein: 9,    carbs: 41,   fat: 3,    kcal: 224,  category: 'carbo'    },
  { id: 'maltod',      name: 'Maltodextrina',          defaultGrams: 30,  protein: 0,    carbs: 95,   fat: 0,    kcal: 380,  category: 'carbo'    },

  // ── Verduras ──────────────────────────────────────────────────
  { id: 'verduras',    name: 'Verduras Mixtas',        defaultGrams: 200, protein: 2,    carbs: 7,    fat: 0.3,  kcal: 40,   category: 'verdura'  },
  { id: 'brocoli',     name: 'Brócoli',                defaultGrams: 150, protein: 2.8,  carbs: 7,    fat: 0.4,  kcal: 34,   category: 'verdura'  },
  { id: 'espinacas',   name: 'Espinacas',              defaultGrams: 100, protein: 2.9,  carbs: 3.6,  fat: 0.4,  kcal: 23,   category: 'verdura'  },
  { id: 'ensalada',    name: 'Lechuga / Ensalada',     defaultGrams: 100, protein: 1.4,  carbs: 2.9,  fat: 0.2,  kcal: 17,   category: 'verdura'  },
  { id: 'tomate',      name: 'Tomate',                 defaultGrams: 150, protein: 0.9,  carbs: 3.9,  fat: 0.2,  kcal: 18,   category: 'verdura'  },

  // ── Grasas ────────────────────────────────────────────────────
  { id: 'aove',        name: 'Aceite de Oliva (AOVE)', defaultGrams: 15,  protein: 0,    carbs: 0,    fat: 100,  kcal: 884,  category: 'grasa'    },
  { id: 'aguacate',    name: 'Aguacate',               defaultGrams: 80,  protein: 2,    carbs: 9,    fat: 15,   kcal: 160,  category: 'grasa'    },
  { id: 'frutos-secos',name: 'Frutos Secos Mixtos',   defaultGrams: 30,  protein: 18,   carbs: 22,   fat: 50,   kcal: 607,  category: 'grasa'    },

  // ── Suplementos ───────────────────────────────────────────────
  { id: 'ciclod',      name: 'Ciclodextrina',          defaultGrams: 30,  protein: 0,    carbs: 100,  fat: 0,    kcal: 400,  category: 'suplemento'},
  { id: 'eaas',        name: "EAA's Esenciales",       defaultGrams: 15,  protein: 80,   carbs: 0,    fat: 0,    kcal: 320,  category: 'suplemento'},
  { id: 'creatina',    name: 'Creatina Monohidrato',   defaultGrams: 5,   protein: 0,    carbs: 0,    fat: 0,    kcal: 0,    category: 'suplemento'},
  { id: 'beta-al',     name: 'Beta-Alanina',           defaultGrams: 3,   protein: 0,    carbs: 0,    fat: 0,    kcal: 0,    category: 'suplemento'},
  { id: 'cafeina',     name: 'Cafeína',                defaultGrams: 1,   protein: 0,    carbs: 0,    fat: 0,    kcal: 0,    category: 'suplemento'},
]

/* ══════════════════════════════════════════════════════════════
   ESTRUCTURA DE SLOTS (iconos, labels, timings)
══════════════════════════════════════════════════════════════ */
interface MealSlot {
  id:      string
  icon:    string
  label:   string
  timing?: string
  entries: FoodEntry[]
}

const MEAL_TEMPLATES: Omit<MealSlot, 'entries'>[] = [
  { id: 'meal-1', icon: '🌅', label: 'COMIDA 1',      timing: 'Despertar'     },
  { id: 'meal-2', icon: '🍽️', label: 'COMIDA 2',      timing: 'Media mañana'  },
  { id: 'meal-3', icon: '🥩', label: 'COMIDA 3',      timing: 'Mediodía'      },
  { id: 'meal-4', icon: '🌆', label: 'COMIDA 4',      timing: 'Tarde'         },
  { id: 'meal-5', icon: '🌙', label: 'COMIDA 5',      timing: 'Noche'         },
  { id: 'pre',    icon: '⚡', label: 'PRE-ENTRENO',   timing: '30–60 min antes'},
  { id: 'intra',  icon: '💧', label: 'INTRA-ENTRENO', timing: 'Durante'       },
  { id: 'post',   icon: '🔄', label: 'POST-ENTRENO',  timing: '0–30 min después'},
]

/* Función auxiliar para obtener alimento por id */
const food = (id: string): FoodOption => FOOD_LIBRARY.find(f => f.id === id)!

/* ── Datos iniciales por variante ────────────────────────────── */
function makeVariantMeals(variant: 'A' | 'B' | 'C'): MealSlot[] {
  const base: Record<'A'|'B'|'C', Record<string, FoodEntry[]>> = {
    A: {
      'meal-1': [{ food: food('crema-arroz'), grams: 80 }, { food: food('iso'), grams: 30 }],
      'meal-2': [{ food: food('arroz-bas'), grams: 100 }, { food: food('pollo'), grams: 150 }, { food: food('verduras'), grams: 150 }],
      'meal-3': [{ food: food('patata'), grams: 200 }, { food: food('ternera'), grams: 150 }, { food: food('brocoli'), grams: 150 }],
      'meal-4': [{ food: food('arroz'), grams: 80 },  { food: food('salmon'), grams: 150 }],
      'meal-5': [{ food: food('avena'), grams: 80 },  { food: food('huevo'), grams: 120 }],
      'pre':    [{ food: food('crema-arroz'), grams: 40 }, { food: food('iso'), grams: 30 }],
      'intra':  [{ food: food('ciclod'), grams: 30 }, { food: food('eaas'), grams: 15 }],
      'post':   [{ food: food('iso'), grams: 40 },    { food: food('creatina'), grams: 5 }],
    },
    B: {
      'meal-1': [{ food: food('avena'), grams: 80 },  { food: food('clara'), grams: 150 }],
      'meal-2': [{ food: food('batata'), grams: 150 }, { food: food('ternera'), grams: 150 }, { food: food('espinacas'), grams: 100 }],
      'meal-3': [{ food: food('arroz-bas'), grams: 100 }, { food: food('merluza'), grams: 200 }, { food: food('verduras'), grams: 150 }],
      'meal-4': [{ food: food('patata'), grams: 200 }, { food: food('pollo'), grams: 150 }],
      'meal-5': [{ food: food('crema-arroz'), grams: 60 }, { food: food('huevo'), grams: 120 }],
      'pre':    [{ food: food('avena'), grams: 40 },   { food: food('iso'), grams: 30 }],
      'intra':  [{ food: food('ciclod'), grams: 30 },  { food: food('eaas'), grams: 15 }],
      'post':   [{ food: food('iso'), grams: 40 },     { food: food('creatina'), grams: 5 }],
    },
    C: {
      'meal-1': [{ food: food('crema-arroz'), grams: 120 }, { food: food('iso'), grams: 30 }],
      'meal-2': [{ food: food('arroz-bas'), grams: 150 }, { food: food('pollo'), grams: 150 }, { food: food('verduras'), grams: 100 }],
      'meal-3': [{ food: food('batata'), grams: 200 }, { food: food('ternera'), grams: 150 }, { food: food('brocoli'), grams: 100 }],
      'meal-4': [{ food: food('arroz'), grams: 150 },  { food: food('salmon'), grams: 150 }],
      'meal-5': [{ food: food('avena'), grams: 100 },  { food: food('huevo'), grams: 120 }],
      'pre':    [{ food: food('crema-arroz'), grams: 60 }, { food: food('iso'), grams: 30 }],
      'intra':  [{ food: food('ciclod'), grams: 50 }, { food: food('eaas'), grams: 15 }, { food: food('maltod'), grams: 30 }],
      'post':   [{ food: food('iso'), grams: 40 },    { food: food('creatina'), grams: 5 }],
    },
  }

  return MEAL_TEMPLATES.map(tpl => ({
    ...tpl,
    entries: base[variant][tpl.id] ?? [],
  }))
}

interface DietVariant {
  name:  string
  meals: MealSlot[]
}

/* ══════════════════════════════════════════════════════════════
   PÁGINA PRINCIPAL
══════════════════════════════════════════════════════════════ */
export default function CreadorPage() {
  const { showModal } = useModal()
  const { showToast } = useToast()

  const [tab,                setTab]                = useState<CreatorTab>('diet')
  const [activeVariant,      setActiveVariant]      = useState(0)
  const [activeTrainVariant, setActiveTrainVariant] = useState(0)

  /* Estado de variantes de dieta — cada una tiene sus propias comidas */
  const [dietVariants, setDietVariants] = useState<DietVariant[]>([
    { name: 'DÍA A (Base)', meals: makeVariantMeals('A') },
    { name: 'DÍA B (Swap)', meals: makeVariantMeals('B') },
    { name: 'DÍA C (Alto)', meals: makeVariantMeals('C') },
  ])

  const TRAIN_VARIANTS = ['EMPUJE A', 'TIRÓN A', 'PIERNA A']

  /* ── Acceso a las comidas de la variante activa ────────────── */
  const currentMeals = dietVariants[activeVariant]?.meals ?? []

  /* ── Mutación inmutable de comidas ─────────────────────────── */
  const mutateMeals = (fn: (meals: MealSlot[]) => MealSlot[]) => {
    setDietVariants(prev =>
      prev.map((v, i) =>
        i === activeVariant ? { ...v, meals: fn(v.meals) } : v
      )
    )
  }

  const mutateMeal = (mealId: string, fn: (m: MealSlot) => MealSlot) =>
    mutateMeals(meals => meals.map(m => m.id === mealId ? fn(m) : m))

  /* ── Handlers de alimentos ─────────────────────────────────── */
  const handleUpdateGrams = (mealId: string, index: number, grams: number) =>
    mutateMeal(mealId, m => ({
      ...m,
      entries: m.entries.map((e, i) => i === index ? { ...e, grams } : e),
    }))

  const handleRemoveEntry = (mealId: string, index: number) =>
    mutateMeal(mealId, m => ({
      ...m,
      entries: m.entries.filter((_, i) => i !== index),
    }))

  const handleAddFood = (mealId: string, food: FoodOption) =>
    mutateMeal(mealId, m => ({
      ...m,
      entries: [...m.entries, { food, grams: food.defaultGrams }],
    }))

  /* ── Alimento personalizado (modal) ────────────────────────── */
  const handleAddCustom = (mealId: string) => {
    let customName = '', customGrams = 100, customP = 0, customC = 0, customF = 0

    showModal({
      title: '⚙ ALIMENTO PERSONALIZADO',
      body: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="input-group">
            <label className="input-label">NOMBRE</label>
            <input className="cyber-input" placeholder="Ej: Arroz de konjac" onChange={e => { customName = e.target.value }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div className="input-group">
              <label className="input-label">GRAMOS (porción)</label>
              <input type="number" className="cyber-input" defaultValue={100} onChange={e => { customGrams = Number(e.target.value) }} />
            </div>
            <div className="input-group">
              <label className="input-label">KCAL / 100g</label>
              <input type="number" className="cyber-input" placeholder="0" onChange={e => { customF = Number(e.target.value) }} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <div className="input-group">
              <label className="input-label">PROTEÍNA</label>
              <input type="number" className="cyber-input" placeholder="g/100g" onChange={e => { customP = Number(e.target.value) }} />
            </div>
            <div className="input-group">
              <label className="input-label">CARBS</label>
              <input type="number" className="cyber-input" placeholder="g/100g" onChange={e => { customC = Number(e.target.value) }} />
            </div>
            <div className="input-group">
              <label className="input-label">GRASA</label>
              <input type="number" className="cyber-input" placeholder="g/100g" onChange={e => { customF = Number(e.target.value) }} />
            </div>
          </div>
        </div>
      ),
      confirmText: 'AÑADIR AL PLAN',
      onConfirm: () => {
        if (!customName.trim()) {
          showToast('⚠ Escribe un nombre para el alimento')
          return
        }
        const custom: FoodOption = {
          id:           `custom-${Date.now()}`,
          name:         customName.trim(),
          defaultGrams: customGrams,
          protein:      customP,
          carbs:        customC,
          fat:          customF,
          kcal:         customP * 4 + customC * 4 + customF * 9,
          category:     'proteina',
        }
        handleAddFood(mealId, custom)
        showToast(`✅ "${custom.name}" añadido al plan`)
      },
    })
  }

  /* ── Crear nueva variante ───────────────────────────────────── */
  const createNewVariant = () => {
    let variantName = ''
    showModal({
      title: 'CREAR NUEVA VARIANTE',
      body: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="input-group">
            <label className="input-label">NOMBRE DE LA VARIANTE</label>
            <input className="cyber-input" placeholder="Ej: DÍA D (Bajo)" onChange={e => { variantName = e.target.value }} />
          </div>
          <div className="input-group">
            <label className="input-label">BASADA EN</label>
            <select className="cyber-input" style={{ cursor: 'pointer' }}>
              <option>DÍA A (Base) — copiar estructura</option>
              <option>DÍA B (Swap)</option>
              <option>DÍA C (Alto)</option>
              <option>En blanco</option>
            </select>
          </div>
        </div>
      ),
      confirmText: 'CREAR',
      onConfirm: () => {
        const name = variantName.trim() || `DÍA ${String.fromCharCode(68 + dietVariants.length)}`
        setDietVariants(prev => [
          ...prev,
          { name, meals: makeVariantMeals('A') },
        ])
        setActiveVariant(dietVariants.length)
        showToast(`✅ Variante «${name}» creada`)
      },
    })
  }

  /* ── Totales dinámicos ─────────────────────────────────────── */
  const totals = useMemo(() => {
    return currentMeals.reduce(
      (acc, meal) => {
        const m = calcMacros(meal.entries)
        return {
          protein: acc.protein + m.protein,
          carbs:   acc.carbs   + m.carbs,
          fat:     acc.fat     + m.fat,
          kcal:    acc.kcal    + m.kcal,
        }
      },
      { protein: 0, carbs: 0, fat: 0, kcal: 0 }
    )
  }, [currentMeals])

  /* ── Barras de macros (%) ──────────────────────────────────── */
  const totalMacroG = totals.protein + totals.carbs + totals.fat || 1
  const pctP = (totals.protein / totalMacroG) * 100
  const pctC = (totals.carbs   / totalMacroG) * 100
  const pctF = (totals.fat     / totalMacroG) * 100

  /* ── Modales de entrenamiento (sin cambios del original) ───── */
  const addExercise = () =>
    showModal({
      title: 'Añadir Ejercicio',
      body: (
        <>
          <div className="input-group">
            <label className="input-label">EJERCICIO</label>
            <input className="cyber-input" placeholder="Ej: Press Banca" />
          </div>
          <div className="input-group">
            <label className="input-label">SERIES x REPS</label>
            <input className="cyber-input" placeholder="Ej: 3 x 8-10" />
          </div>
          <div className="input-group">
            <label className="input-label">CARGA (kg)</label>
            <input type="number" className="cyber-input" placeholder="80" />
          </div>
        </>
      ),
      confirmText: 'AÑADIR EJERCICIO',
      onConfirm: () => showToast('✅ Ejercicio añadido al plan'),
    })

  const sendToClient = () =>
    showModal({
      title: 'Enviar Plan al Cliente',
      body: (
        <>
          <div className="input-group">
            <label className="input-label">SELECCIONAR CLIENTE</label>
            <select className="cyber-input">
              <option>Laura Pro</option>
              <option>Javi M.</option>
              <option>María S.</option>
              <option>Raúl C.</option>
            </select>
          </div>
          <div className="input-group">
            <label className="input-label">VARIANTE A ENVIAR</label>
            <select className="cyber-input">
              {dietVariants.map(v => <option key={v.name}>{v.name}</option>)}
            </select>
          </div>
          <div className="input-group">
            <label className="input-label">MENSAJE OPCIONAL</label>
            <textarea className="cyber-input" rows={3} placeholder="Añade un mensaje personalizado..." />
          </div>
        </>
      ),
      confirmText: 'ENVIAR AHORA',
      onConfirm: () => showToast('📤 Plan enviado correctamente'),
    })

  /* ── Comidas y extras (split para renderizar por secciones) ── */
  const mainMeals  = currentMeals.filter(m => m.id.startsWith('meal'))
  const extraMeals = currentMeals.filter(m => !m.id.startsWith('meal'))

  /* ══════════════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════════════ */
  return (
    <div className="screen-enter" style={{ paddingBottom: 160 }}>

      {/* ── TABS ── */}
      <div className="tab-header">
        <div className={`tab${tab === 'diet'  ? ' active' : ''}`} onClick={() => setTab('diet')}>
          DIETA 🍎
        </div>
        <div className={`tab${tab === 'train' ? ' active' : ''}`} onClick={() => setTab('train')}>
          ENTRENO 🏋️
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          PESTAÑA DIETA
      ══════════════════════════════════════════════════════════ */}
      {tab === 'diet' && (
        <>
          {/* Variant tabs */}
          <div className="variant-tabs">
            {dietVariants.map((v, i) => (
              <div
                key={v.name}
                className={`variant-tab${activeVariant === i ? ' active' : ''}`}
                onClick={() => setActiveVariant(i)}
              >
                {v.name}
              </div>
            ))}
            <div className="variant-tab" onClick={createNewVariant}>+ CREAR</div>
          </div>

          {/* ── 5 COMIDAS PRINCIPALES ── */}
          {mainMeals.map(meal => (
            <MealBlock
              key={meal.id}
              icon={meal.icon}
              label={meal.label}
              timing={meal.timing}
              entries={meal.entries}
              foodLibrary={FOOD_LIBRARY}
              onUpdateGrams={(i, g) => handleUpdateGrams(meal.id, i, g)}
              onRemoveEntry={(i)    => handleRemoveEntry(meal.id, i)}
              onAddFood={(f)        => handleAddFood(meal.id, f)}
              onAddCustom={()       => handleAddCustom(meal.id)}
            />
          ))}

          {/* ── SECCIÓN PERI-ENTRENO ── */}
          <div className="extras-section-title">⚡ PERI-ENTRENO</div>

          {extraMeals.map(meal => (
            <MealBlock
              key={meal.id}
              icon={meal.icon}
              label={meal.label}
              timing={meal.timing}
              entries={meal.entries}
              foodLibrary={FOOD_LIBRARY}
              onUpdateGrams={(i, g) => handleUpdateGrams(meal.id, i, g)}
              onRemoveEntry={(i)    => handleRemoveEntry(meal.id, i)}
              onAddFood={(f)        => handleAddFood(meal.id, f)}
              onAddCustom={()       => handleAddCustom(meal.id)}
            />
          ))}

          {/* ── TOTALES DINÁMICOS ── */}
          <div className="cyber-card" style={{ marginTop: 8 }}>
            <div className="card-header">
              <div className="card-icon">🎯</div>
              <div className="card-title">TOTALES DIARIOS — {dietVariants[activeVariant]?.name}</div>
            </div>

            {/* Kcal destacado */}
            <div className="row" style={{ marginBottom: 16 }}>
              <span className="text-metal">Calorías Totales</span>
              <span className="text-neon" style={{ fontSize: 22, fontWeight: 900 }}>
                {Math.round(totals.kcal).toLocaleString()} kcal
              </span>
            </div>

            {/* Barra proteína */}
            <div className="macro-bar">
              <span className="macro-bar-label" style={{ color: '#00F0FF' }}>P</span>
              <div className="macro-bar-track">
                <div className="macro-bar-fill" style={{ width: `${pctP}%`, background: '#00F0FF' }} />
              </div>
              <span className="macro-bar-value">
                {Math.round(totals.protein)}g <span style={{ color: 'var(--metal-grey)', fontSize: 10 }}>({Math.round(pctP)}%)</span>
              </span>
            </div>

            {/* Barra carbos */}
            <div className="macro-bar">
              <span className="macro-bar-label" style={{ color: '#FFB800' }}>C</span>
              <div className="macro-bar-track">
                <div className="macro-bar-fill" style={{ width: `${pctC}%`, background: '#FFB800' }} />
              </div>
              <span className="macro-bar-value">
                {Math.round(totals.carbs)}g <span style={{ color: 'var(--metal-grey)', fontSize: 10 }}>({Math.round(pctC)}%)</span>
              </span>
            </div>

            {/* Barra grasa */}
            <div className="macro-bar">
              <span className="macro-bar-label" style={{ color: '#FF6B35' }}>F</span>
              <div className="macro-bar-track">
                <div className="macro-bar-fill" style={{ width: `${pctF}%`, background: '#FF6B35' }} />
              </div>
              <span className="macro-bar-value">
                {Math.round(totals.fat)}g <span style={{ color: 'var(--metal-grey)', fontSize: 10 }}>({Math.round(pctF)}%)</span>
              </span>
            </div>
          </div>
        </>
      )}

      {/* ══════════════════════════════════════════════════════════
          PESTAÑA ENTRENO (sin cambios)
      ══════════════════════════════════════════════════════════ */}
      {tab === 'train' && (
        <>
          <div className="variant-tabs">
            {TRAIN_VARIANTS.map((v, i) => (
              <div
                key={v}
                className={`variant-tab${activeTrainVariant === i ? ' active' : ''}`}
                onClick={() => setActiveTrainVariant(i)}
              >
                {v}
              </div>
            ))}
            <div className="variant-tab" onClick={() => showToast('⚙ Crear variante de entreno')}>
              + CREAR
            </div>
          </div>

          <div className="cyber-card">
            <div className="card-header">
              <div className="card-icon">💪</div>
              <div className="card-title">EMPUJE A (Pecho / Hombro)</div>
              <div className="card-action tooltip" data-tooltip="Añadir ejercicio" onClick={addExercise}>+</div>
            </div>
            {[
              { name: 'Press Inclinado Multipower', sets: '2 Top Set × 6-8 reps • RIR 2', kg: '100kg' },
              { name: 'Press Militar con Barra',    sets: '3 × 8-10 reps • RIR 1-2',      kg: '60kg'  },
              { name: 'Aperturas en Contractora',   sets: '3 × 12-15 reps • RIR 1',        kg: '45kg'  },
            ].map((ex, i, arr) => (
              <div key={i}>
                <div className="row">
                  <div>
                    <div className="text-chrome">{ex.name}</div>
                    <div className="text-small">{ex.sets}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 20, cursor: 'pointer' }} className="tooltip" data-tooltip="Ver vídeo">🎥</span>
                    <span className="text-neon editable">{ex.kg}</span>
                  </div>
                </div>
                {i < arr.length - 1 && <div className="divider" />}
              </div>
            ))}
          </div>

          <div className="cyber-card">
            <div className="card-header">
              <div className="card-icon">📝</div>
              <div className="card-title">NOTAS DE EJECUCIÓN</div>
            </div>
            <div className="text-small" style={{ lineHeight: 1.8 }}>
              • Priorizar técnica sobre carga en press inclinado<br />
              • Mantener core activo durante press militar<br />
              • Controlar la fase excéntrica en aperturas (3 segundos)<br />
              • Descanso entre series: 2-3 min en básicos · 90s en accesorios
            </div>
          </div>

          <div className="text-small" style={{ textAlign: 'center', padding: 20, color: 'var(--metal-grey)' }}>
            📹 Enlaces de vídeo incluidos para demostración técnica
          </div>
        </>
      )}

      {/* ── BARRA INFERIOR (sin cambios) ── */}
      <div className="save-bar">
        <div
          className="cyber-button secondary"
          style={{ flex: 1, margin: 0 }}
          onClick={() => showToast('💾 Borrador guardado correctamente')}
        >
          <span className="button-text">💾 GUARDAR</span>
        </div>
        <div
          className="cyber-button"
          style={{ flex: 2, margin: 0 }}
          onClick={sendToClient}
        >
          <span className="button-text">📤 ENVIAR AL CLIENTE</span>
        </div>
      </div>
    </div>
  )
}

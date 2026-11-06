
import { useState } from 'react'
import {
  Search, Calculator, GraduationCap, Target, Sigma,
  CalendarDays, BookOpen, ArrowUpRight, ArrowLeft,
  Plus, Trash2, Check
} from 'lucide-react'

type Item = {
  id: number
  name: string
  earned: string
  possible: string
}

type Category = {
  id: number
  name: string
  weight: string
  dropLowest: boolean
  items: Item[]
}

const tools = [
  { name: 'Grade Calculator', icon: Calculator, color: 'bg-blue-500/15 text-blue-400' },
  { name: 'GPA Calculator', icon: GraduationCap, color: 'bg-purple-500/15 text-purple-400' },
  { name: 'Final Exam Calculator', icon: Target, color: 'bg-emerald-500/15 text-emerald-400' },
  { name: 'Formula Calculator', icon: Sigma, color: 'bg-orange-500/15 text-orange-400' },
  { name: 'Study & Exam Planner', icon: CalendarDays, color: 'bg-pink-500/15 text-pink-400' },
  { name: 'Citation Machine', icon: BookOpen, color: 'bg-indigo-500/15 text-indigo-400' },
]

const categories = [
  { title: 'Academic Performance', names: tools.slice(0, 3) },
  { title: 'Study & Planning', names: tools.slice(3, 5) },
  { title: 'Writing & Research', names: tools.slice(5, 6) },
]

const grades: Record<string, number> = {
  'A+': 4.0, A: 4.0, 'A-': 3.7,
  'B+': 3.3, B: 3.0, 'B-': 2.7,
  'C+': 2.3, C: 2.0, 'C-': 1.7,
  'D+': 1.3, D: 1.0, F: 0,
}

const inputClass =
  'w-full rounded-lg border border-white/10 bg-[#0b1020] px-3 py-3 text-sm text-white outline-none focus:border-blue-400/50'

const cardClass =
  'rounded-2xl border border-white/10 bg-[#141c30] p-5'

function Header({ back }: { back: () => void }) {
  return (
    <button onClick={back} className="mb-9 flex items-center gap-2 text-sm text-slate-400 hover:text-white">
      <ArrowLeft size={17} /> Back to tools
    </button>
  )
}

function Result({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-[#0b1020] p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-blue-400">{value}</p>
    </div>
  )
}

function PageTitle({ title, description, icon: Icon }: {
  title: string
  description: string
  icon: typeof Calculator
}) {
  return (
    <div className="mb-8">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/15 text-blue-400">
        <Icon size={25} />
      </div>
      <h1 className="text-3xl font-bold">{title}</h1>
      <p className="mt-2 text-sm text-slate-400">{description}</p>
    </div>
  )
}

// 1. GRADE CALCULATOR

function GradeCalculator() {
  const [cats, setCats] = useState<Category[]>([
    { id: 1, name: 'Assignments', weight: '30', dropLowest: false, items: [] },
    { id: 2, name: 'Midterms', weight: '30', dropLowest: false, items: [] },
    { id: 3, name: 'Quizzes', weight: '10', dropLowest: false, items: [] },
    { id: 4, name: 'Final Exam', weight: '30', dropLowest: false, items: [] },
  ])
  const [target, setTarget] = useState('80')

  function updateCat(id: number, field: string, value: string | boolean) {
    setCats(old => old.map(c => c.id === id ? { ...c, [field]: value } : c))
  }

  function addCat() {
    setCats(old => [...old, {
      id: Date.now(), name: '', weight: '', dropLowest: false, items: [],
    }])
  }

  function addItem(id: number) {
    setCats(old => old.map(c => c.id === id ? {
      ...c,
      items: [...c.items, {
        id: Date.now(), name: '', earned: '', possible: '',
      }],
    } : c))
  }

  function updateItem(catId: number, itemId: number, field: string, value: string) {
    setCats(old => old.map(c => c.id === catId ? {
      ...c,
      items: c.items.map(i => i.id === itemId ? { ...i, [field]: value } : i),
    } : c))
  }

  function removeItem(catId: number, itemId: number) {
    setCats(old => old.map(c => c.id === catId ? {
      ...c, items: c.items.filter(i => i.id !== itemId),
    } : c))
  }

  const stats = cats.map(c => {
    const valid = c.items.filter(i =>
      i.earned.trim() !== '' && i.possible.trim() !== '' &&
      Number(i.possible) > 0 && Number(i.earned) >= 0 &&
      Number(i.earned) <= Number(i.possible)
    )

    const sorted = [...valid].sort((a, b) =>
      Number(a.earned) / Number(a.possible) -
      Number(b.earned) / Number(b.possible)
    )

    const used = c.dropLowest && sorted.length > 1 ? sorted.slice(1) : sorted
    const earned = used.reduce((s, i) => s + Number(i.earned), 0)
    const possible = used.reduce((s, i) => s + Number(i.possible), 0)

    return {
      id: c.id,
      grade: possible > 0 ? earned / possible * 100 : null,
      weight: Number(c.weight),
      valid: c.items.some(i =>
        i.earned.trim() !== '' && i.possible.trim() !== '' &&
        (Number(i.earned) < 0 || Number(i.possible) <= 0 ||
          Number(i.earned) > Number(i.possible))
      ),
    }
  })

  const invalid = stats.some(s => s.valid) ||
    cats.some(c => Number(c.weight) < 0 || Number(c.weight) > 100)

  const completed = stats.filter(s => s.grade !== null)
  const gradedWeight = completed.reduce((s, c) => s + c.weight, 0)
  const totalWeight = cats.reduce((s, c) => s + (Number(c.weight) || 0), 0)
  const contribution = completed.reduce(
    (s, c) => s + (c.grade! * c.weight / 100), 0
  )
  const current = gradedWeight > 0 ? contribution / gradedWeight * 100 : null
  const remaining = 100 - gradedWeight
  const needed = remaining > 0
    ? (Number(target) - contribution) / (remaining / 100)
    : null

  return (
    <>
      <PageTitle title="Grade Calculator" description="Track assignments, calculate weighted grades and plan your final mark." icon={Calculator} />

      <section className={cardClass}>
        <h2 className="mb-5 text-lg font-semibold">Grade categories</h2>

        {cats.map(c => (
          <div key={c.id} className="mb-5 rounded-xl border border-white/10 bg-[#0b1020] p-4">
            <div className="mb-3 grid grid-cols-[1fr_90px_35px] gap-2">
              <input className={inputClass} placeholder="Category name" value={c.name} onChange={e => updateCat(c.id, 'name', e.target.value)} />
              <input className={inputClass} type="number" min="0" max="100" placeholder="Weight %" value={c.weight} onChange={e => updateCat(c.id, 'weight', e.target.value)} />
              <button title="Remove category" onClick={() => setCats(old => old.filter(x => x.id !== c.id))} className="text-slate-500 hover:text-red-400"><Trash2 size={17} /></button>
            </div>

            <div className="mb-2 grid grid-cols-[1fr_65px_65px_28px] gap-2 text-xs text-slate-500">
              <span>Assignment</span><span>Earned</span><span>Total</span><span />
            </div>

            {c.items.map(i => (
              <div key={i.id} className="mb-2 grid grid-cols-[1fr_65px_65px_28px] items-center gap-2">
                <input className={inputClass} placeholder="Name" value={i.name} onChange={e => updateItem(c.id, i.id, 'name', e.target.value)} />
                <input className={inputClass} type="number" min="0" placeholder="85" value={i.earned} onChange={e => updateItem(c.id, i.id, 'earned', e.target.value)} />
                <input className={inputClass} type="number" min="0" placeholder="100" value={i.possible} onChange={e => updateItem(c.id, i.id, 'possible', e.target.value)} />
                <button title="Remove assignment" onClick={() => removeItem(c.id, i.id)} className="text-slate-500 hover:text-red-400"><Trash2 size={15} /></button>
              </div>
            ))}

            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <button onClick={() => addItem(c.id)} className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300"><Plus size={15} /> Add assignment</button>
              <label className="flex items-center gap-2 text-xs text-slate-400">
                <input type="checkbox" checked={c.dropLowest} onChange={e => updateCat(c.id, 'dropLowest', e.target.checked)} />
                Drop lowest
              </label>
            </div>

            <p className="mt-3 text-xs text-slate-500">
              Category average: {stats.find(s => s.id === c.id)?.grade?.toFixed(2) ?? '--'}%
            </p>
          </div>
        ))}

        <button onClick={addCat} className="flex items-center gap-2 text-sm font-medium text-blue-400"><Plus size={17} /> Add category</button>
        <p className="mt-4 text-xs text-slate-500">Enter points earned and points possible for each assignment. Category weights should total 100%.</p>
      </section>

      <section className={`${cardClass} mt-5`}>
        <h2 className="mb-4 text-lg font-semibold">Your results</h2>
        {invalid && <p className="mb-4 text-sm text-red-400">Check your grades, points and weights. Grades cannot exceed possible points and weights must be between 0 and 100.</p>}
        {totalWeight > 100 && <p className="mb-4 text-sm text-red-400">Your category weights add up to more than 100%.</p>}
        <div className="grid grid-cols-2 gap-3">
          <Result label="Current grade" value={invalid || totalWeight > 100 || current === null ? '--' : `${current.toFixed(2)}%`} />
          <Result label="Course points earned" value={invalid || totalWeight > 100 ? '--' : `${contribution.toFixed(2)}%`} />
          <Result label="Graded course weight" value={`${gradedWeight.toFixed(1)}%`} />
          <Result label="Remaining weight" value={`${remaining.toFixed(1)}%`} />
        </div>
        <div className="mt-6 border-t border-white/10 pt-5">
          <h3 className="mb-3 font-semibold">Final grade projection</h3>
          <label className="mb-2 block text-sm text-slate-400">Target final grade (%)</label>
          <input className={inputClass} type="number" min="0" max="100" value={target} onChange={e => setTarget(e.target.value)} />
          <p className="mt-4 text-sm text-slate-400">Required average on remaining work:</p>
          <p className="mt-1 text-3xl font-bold text-emerald-400">
            {invalid || totalWeight > 100 || !target.trim() || Number(target) < 0 || Number(target) > 100
              ? '--'
              : remaining <= 0
                ? 'No weight remaining'
                : needed! <= 0 ? '0.00%'
                  : needed! > 100 ? 'Over 100%'
                    : `${needed!.toFixed(2)}%`}
          </p>
        </div>
      </section>
    </>
  )
}

// 2. GPA CALCULATOR

function GPACalculator() {
  const [courses, setCourses] = useState([
    { id: 1, name: 'Course 1', grade: 'A', credits: '1' },
    { id: 2, name: 'Course 2', grade: 'B+', credits: '1' },
  ])

  const points = courses.reduce((s, c) => s + grades[c.grade] * Number(c.credits || 0), 0)
  const credits = courses.reduce((s, c) => s + Number(c.credits || 0), 0)
  const gpa = credits > 0 ? points / credits : null

  return (
    <>
      <PageTitle title="GPA Calculator" description="Calculate your grade point average across multiple courses." icon={GraduationCap} />
      <section className={cardClass}>
        <h2 className="mb-5 text-lg font-semibold">Your courses</h2>
        {courses.map(c => (
          <div key={c.id} className="mb-3 grid grid-cols-[1fr_75px_75px_28px] gap-2">
            <input className={inputClass} value={c.name} onChange={e => setCourses(old => old.map(x => x.id === c.id ? { ...x, name: e.target.value } : x))} />
            <select className={inputClass} value={c.grade} onChange={e => setCourses(old => old.map(x => x.id === c.id ? { ...x, grade: e.target.value } : x))}>
              {Object.keys(grades).map(g => <option key={g}>{g}</option>)}
            </select>
            <input className={inputClass} type="number" min="0" step="0.5" placeholder="Credits" value={c.credits} onChange={e => setCourses(old => old.map(x => x.id === c.id ? { ...x, credits: e.target.value } : x))} />
            <button onClick={() => setCourses(old => old.filter(x => x.id !== c.id))} className="text-slate-500 hover:text-red-400"><Trash2 size={16} /></button>
          </div>
        ))}
        <button onClick={() => setCourses(old => [...old, { id: Date.now(), name: `Course ${old.length + 1}`, grade: 'A', credits: '1' }])} className="mt-3 flex items-center gap-2 text-sm text-blue-400"><Plus size={17} /> Add course</button>
      </section>
      <section className={`${cardClass} mt-5`}>
        <Result label="Your GPA" value={gpa === null ? '--' : gpa.toFixed(2)} />
        <p className="mt-4 text-sm text-slate-400">Total credits: {credits}</p>
        <p className="mt-3 text-xs text-slate-500">Uses a standard 4.0 scale. GPA scales vary by institution, so check your university's grading policy.</p>
      </section>
    </>
  )
}

// 3. FINAL EXAM CALCULATOR

function FinalExamCalculator() {
  const [current, setCurrent] = useState('75')
  const [completed, setCompleted] = useState('70')
  const [target, setTarget] = useState('80')

  const c = Number(current)
  const w = Number(completed)
  const t = Number(target)
  const remaining = 100 - w
  const needed = remaining > 0 ? (t - c * w / 100) / (remaining / 100) : null
  const valid = current !== '' && completed !== '' && target !== '' &&
    c >= 0 && c <= 100 && w >= 0 && w < 100 && t >= 0 && t <= 100

  return (
    <>
      <PageTitle title="Final Exam Calculator" description="Find out exactly what you need on your final exam." icon={Target} />
      <section className={cardClass}>
        <label className="mb-2 block text-sm text-slate-400">Current grade (%)</label>
        <input className={`${inputClass} mb-5`} type="number" value={current} onChange={e => setCurrent(e.target.value)} placeholder="75" />
        <label className="mb-2 block text-sm text-slate-400">Percentage of course completed (%)</label>
        <input className={`${inputClass} mb-5`} type="number" value={completed} onChange={e => setCompleted(e.target.value)} placeholder="70" />
        <label className="mb-2 block text-sm text-slate-400">Desired final grade (%)</label>
        <input className={inputClass} type="number" value={target} onChange={e => setTarget(e.target.value)} placeholder="80" />
      </section>
      <section className={`${cardClass} mt-5`}>
        <p className="text-sm text-slate-400">Required final exam grade</p>
        <p className="mt-2 text-4xl font-bold text-emerald-400">
          {!valid || needed === null ? '--' : needed <= 0 ? '0.00%' : needed > 100 ? 'Over 100%' : `${needed.toFixed(2)}%`}
        </p>
        <p className="mt-4 text-sm text-slate-400">Your final exam is worth {valid ? remaining : '--'}% of your course grade.</p>
      </section>
    </>
  )
}

// 4. FORMULA CALCULATOR

function FormulaCalculator() {
  const formulas = [
    { name: 'Speed', formula: 'Distance ÷ Time', a: 'Distance', b: 'Time', unit: 'm/s', calc: (a: number, b: number) => a / b },
    { name: 'Density', formula: 'Mass ÷ Volume', a: 'Mass', b: 'Volume', unit: 'kg/m³', calc: (a: number, b: number) => a / b },
    { name: 'Force', formula: 'Mass × Acceleration', a: 'Mass', b: 'Acceleration', unit: 'N', calc: (a: number, b: number) => a * b },
    { name: 'Ohm’s Law', formula: 'Voltage ÷ Resistance', a: 'Voltage', b: 'Resistance', unit: 'A', calc: (a: number, b: number) => a / b },
    { name: 'Kinetic Energy', formula: '½ × Mass × Velocity²', a: 'Mass', b: 'Velocity', unit: 'J', calc: (a: number, b: number) => 0.5 * a * b * b },
    { name: 'Work', formula: 'Force × Distance', a: 'Force', b: 'Distance', unit: 'J', calc: (a: number, b: number) => a * b },
  ]

  const [selected, setSelected] = useState('Speed')
  const [a, setA] = useState('100')
  const [b, setB] = useState('10')

  const formula = formulas.find(f => f.name === selected)!
  const result = Number(b) !== 0 || !['Speed', 'Density', 'Ohm’s Law'].includes(selected)
    ? formula.calc(Number(a), Number(b)) : null
  const valid = a !== '' && b !== '' && Number.isFinite(result) && result !== null

  return (
    <>
      <PageTitle title="Formula Calculator" description="Calculate common math, physics and engineering formulas." icon={Sigma} />
      <section className={cardClass}>
        <label className="mb-2 block text-sm text-slate-400">Choose a formula</label>
        <select className={`${inputClass} mb-5`} value={selected} onChange={e => setSelected(e.target.value)}>
          {formulas.map(f => <option key={f.name}>{f.name}</option>)}
        </select>
        <div className="mb-5 rounded-xl bg-[#0b1020] p-4">
          <p className="text-xs text-slate-500">Formula</p>
          <p className="mt-2 text-lg font-semibold text-blue-400">{formula.formula}</p>
        </div>
        <label className="mb-2 block text-sm text-slate-400">{formula.a}</label>
        <input className={`${inputClass} mb-5`} type="number" value={a} onChange={e => setA(e.target.value)} />
        <label className="mb-2 block text-sm text-slate-400">{formula.b}</label>
        <input className={inputClass} type="number" value={b} onChange={e => setB(e.target.value)} />
      </section>
      <section className={`${cardClass} mt-5`}>
        <Result label="Calculated result" value={valid ? `${result!.toFixed(4)} ${formula.unit}` : '--'} />
      </section>
    </>
  )
}

// 5. STUDY & EXAM PLANNER

function StudyPlanner() {
  const [tasks, setTasks] = useState<{ id: number; name: string; date: string; done: boolean }[]>([])
  const [name, setName] = useState('')
  const [date, setDate] = useState('')

  function addTask() {
    if (!name.trim()) return
    setTasks(old => [...old, { id: Date.now(), name: name.trim(), date, done: false }])
    setName('')
    setDate('')
  }

  const sorted = [...tasks].sort((a, b) => a.date.localeCompare(b.date))
  const completed = tasks.filter(t => t.done).length

  return (
    <>
      <PageTitle title="Study & Exam Planner" description="Organize your assignments, exams and deadlines." icon={CalendarDays} />
      <section className={cardClass}>
        <h2 className="mb-4 font-semibold">Add a task</h2>
        <input className={`${inputClass} mb-3`} placeholder="Assignment or exam name" value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTask()} />
        <label className="mb-2 block text-sm text-slate-400">Due date</label>
        <input className={`${inputClass} mb-4`} type="date" value={date} onChange={e => setDate(e.target.value)} />
        <button onClick={addTask} className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 text-sm font-semibold hover:bg-blue-500"><Plus size={17} /> Add task</button>
      </section>
      <section className={`${cardClass} mt-5`}>
        <div className="mb-4 flex justify-between">
          <h2 className="font-semibold">Your schedule</h2>
          <span className="text-xs text-slate-400">{completed}/{tasks.length} completed</span>
        </div>
        {sorted.length === 0 && <p className="py-8 text-center text-sm text-slate-500">No tasks yet. Add your first deadline above.</p>}
        {sorted.map(t => (
          <div key={t.id} className="mb-2 flex items-center gap-3 rounded-xl bg-[#0b1020] p-3">
            <button onClick={() => setTasks(old => old.map(x => x.id === t.id ? { ...x, done: !x.done } : x))} className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border ${t.done ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-600 text-transparent'}`}><Check size={15} /></button>
            <div className="min-w-0 flex-1">
              <p className={`truncate text-sm ${t.done ? 'text-slate-500 line-through' : 'text-white'}`}>{t.name}</p>
              <p className="mt-1 text-xs text-slate-500">{t.date || 'No due date'}</p>
            </div>
            <button onClick={() => setTasks(old => old.filter(x => x.id !== t.id))} className="text-slate-500 hover:text-red-400"><Trash2 size={16} /></button>
          </div>
        ))}
      </section>
    </>
  )
}

// 6. CITATION MACHINE

function CitationMachine() {
  const [style, setStyle] = useState('APA 7')
  const [type, setType] = useState('Website')
  const [author, setAuthor] = useState('')
  const [year, setYear] = useState('')
  const [title, setTitle] = useState('')
  const [publisher, setPublisher] = useState('')
  const [url, setUrl] = useState('')
  const [accessDate, setAccessDate] = useState('')

  const citation = (() => {
    const a = author.trim() || 'Unknown Author'
    const y = year.trim() || 'n.d.'
    const t = title.trim() || 'Untitled'
    const p = publisher.trim()
    if (style === 'APA 7') {
      if (type === 'Book') return `${a}. (${y}). ${t}. ${p}.`
      if (type === 'Journal Article') return `${a}. (${y}). ${t}. ${p}.`
      return `${a}. (${y}). ${t}. ${p ? `${p}. ` : ''}${url}`
    }
    if (type === 'Book') return `${a}. ${t}. ${p}, ${y}.`
    if (type === 'Journal Article') return `${a}. "${t}." ${p}, ${y}.`
    return `${a}. "${t}." ${p ? `${p}, ` : ''}${accessDate ? `Accessed ${accessDate}, ` : ''}${url}.`
  })()

  return (
    <>
      <PageTitle title="Citation Machine" description="Generate basic APA 7 and MLA 9 citations for your sources." icon={BookOpen} />
      <section className={cardClass}>
        <label className="mb-2 block text-sm text-slate-400">Citation style</label>
        <select className={`${inputClass} mb-5`} value={style} onChange={e => setStyle(e.target.value)}>
          <option>APA 7</option><option>MLA 9</option>
        </select>
        <label className="mb-2 block text-sm text-slate-400">Source type</label>
        <select className={`${inputClass} mb-5`} value={type} onChange={e => setType(e.target.value)}>
          <option>Website</option><option>Book</option><option>Journal Article</option>
        </select>
        <label className="mb-2 block text-sm text-slate-400">Author</label>
        <input className={`${inputClass} mb-4`} placeholder="Last name, First initial" value={author} onChange={e => setAuthor(e.target.value)} />
        <label className="mb-2 block text-sm text-slate-400">Publication year</label>
        <input className={`${inputClass} mb-4`} placeholder="2026" value={year} onChange={e => setYear(e.target.value)} />
        <label className="mb-2 block text-sm text-slate-400">Title</label>
        <input className={`${inputClass} mb-4`} placeholder="Source title" value={title} onChange={e => setTitle(e.target.value)} />
        <label className="mb-2 block text-sm text-slate-400">{type === 'Book' ? 'Publisher' : 'Website / Journal name'}</label>
        <input className={`${inputClass} mb-4`} placeholder="Publisher or website" value={publisher} onChange={e => setPublisher(e.target.value)} />
        <label className="mb-2 block text-sm text-slate-400">URL</label>
        <input className={`${inputClass} mb-4`} placeholder="https://example.com" value={url} onChange={e => setUrl(e.target.value)} />
        {style === 'MLA 9' && type === 'Website' && <>
          <label className="mb-2 block text-sm text-slate-400">Access date</label>
          <input className={inputClass} type="date" value={accessDate} onChange={e => setAccessDate(e.target.value)} />
        </>}
      </section>
      <section className={`${cardClass} mt-5`}>
        <h2 className="mb-3 font-semibold">Generated citation</h2>
        <div className="rounded-xl bg-[#0b1020] p-4 text-sm leading-7 text-slate-200">{citation}</div>
        <button onClick={() => navigator.clipboard.writeText(citation)} className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold hover:bg-blue-500">Copy citation</button>
        <p className="mt-4 text-xs text-slate-500">Basic citation formatting. Always verify source details and formatting against your instructor's requirements.</p>
      </section>
    </>
  )
}

function App() {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState('')

  const filtered = categories.map(c => ({
    ...c,
    names: c.names.filter(t => t.name.toLowerCase().includes(search.toLowerCase())),
  })).filter(c => c.names.length > 0)

  const pages: Record<string, () => React.ReactNode> = {
    'Grade Calculator': () => <GradeCalculator />,
    'GPA Calculator': () => <GPACalculator />,
    'Final Exam Calculator': () => <FinalExamCalculator />,
    'Formula Calculator': () => <FormulaCalculator />,
    'Study & Exam Planner': () => <StudyPlanner />,
    'Citation Machine': () => <CitationMachine />,
  }

  if (selected && pages[selected]) {
    const Page = pages[selected]
    return (
      <div className="min-h-screen bg-[#0b1020] text-white">
        <main className="mx-auto w-full max-w-3xl px-6 py-10">
          <Header back={() => setSelected('')} />
          <Page />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0b1020] text-white">
      <main className="mx-auto flex w-full max-w-3xl flex-col items-center px-6 pb-16 pt-16">
        <h1 className="mb-12 text-3xl font-bold tracking-tight">
          <span className="text-blue-400">Uni</span>Tools
        </h1>

        <div className="mb-9 text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Student tools, simplified.</h2>
          <p className="mt-3 text-sm text-slate-400">Everything students need. One place.</p>
        </div>

        <div className="relative mb-10 w-full max-w-xl">
          <Search size={19} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <input className={`${inputClass} py-3.5 pl-12`} placeholder="Search tools..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <div className="w-full max-w-xl space-y-9">
          {filtered.map(c => (
            <section key={c.title}>
              <h3 className="mb-4 text-sm font-semibold tracking-wide text-slate-400">{c.title}</h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {c.names.map(tool => {
                  const Icon = tool.icon
                  return (
                    <button key={tool.name} onClick={() => setSelected(tool.name)} className="group flex items-center justify-between rounded-xl border border-white/[0.08] bg-[#141c30] p-4 text-left transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-[#19243b]">
                      <div className="flex items-center gap-3">
                        <div className={`rounded-lg p-2.5 ${tool.color}`}><Icon size={21} /></div>
                        <span className="text-sm font-medium text-slate-200">{tool.name}</span>
                      </div>
                      <ArrowUpRight size={17} className="text-slate-500 transition group-hover:text-white" />
                    </button>
                  )
                })}
              </div>
            </section>
          ))}
          {filtered.length === 0 && <p className="py-8 text-center text-sm text-slate-500">No tools found.</p>}
        </div>

        <footer className="mt-16 text-xs text-slate-600">© 2026 UniTools</footer>
      </main>
    </div>
  )
}

export default App

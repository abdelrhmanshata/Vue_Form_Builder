import type { Directive } from 'vue'

type Mode = 'width' | 'height' | 'both'
type Base = 'parent' | 'window'
type SnapType = 'fractions' | 'grid'

interface SnapOptions {
    mode?: Mode                 // افتراضي 'width'
    snapType?: SnapType          // 'fractions' | 'grid'
    steps?: Array<number | string> // fractions فقط
    grid?: number               // grid columns, افتراضي 12
    base?: Base                 // parent | window
    minPx?: number
    maxPx?: number
    handleThickness?: number
}

// -------- Helpers ----------
const parseStep = (s: number | string): number => {
    if (typeof s === 'number') return Math.max(0, Math.min(1, s))
    const parts = String(s).split('/').map(Number)
    if (parts.length === 2 && parts[0] > 0 && parts[1] > 0) {
        return Math.max(0, Math.min(1, parts[0] / parts[1]))
    }
    const n = Number(s)
    return isFinite(n) ? Math.max(0, Math.min(1, n)) : 1
}

const normalizeSteps = (steps?: Array<number | string>) =>
    (steps?.length ? steps : ['1/4', '1/3', '1/2', '2/3', '3/4', '1'])
        .map(parseStep)
        .filter((v, i, a) => a.indexOf(v) === i)
        .sort((a, b) => a - b)

// -------- Main Directive ----------
export const vResizableSnap: Directive<HTMLElement, SnapOptions> = {
    mounted(el, binding) {
        const opts = binding.value || {}
        const mode: Mode = opts.mode ?? 'width'
        const snapType: SnapType = opts.snapType ?? 'fractions'
        const steps = snapType === 'fractions' ? normalizeSteps(opts.steps) : []
        const grid = opts.grid ?? 12
        const base: Base = opts.base ?? 'parent'
        const minPx = opts.minPx ?? 0
        const maxPx = opts.maxPx ?? Number.POSITIVE_INFINITY
        const handleThickness = opts.handleThickness ?? 10

        // تأكيد تموضع
        const pos = getComputedStyle(el).position
        if (!['relative', 'absolute', 'fixed'].includes(pos)) el.style.position = 'relative'
        el.style.boxSizing = 'border-box'

        // تثبيت قيم ابتدائية
        const rect = el.getBoundingClientRect()
        if ((mode === 'width' || mode === 'both') && !el.style.width) el.style.width = `${rect.width}px`
        if ((mode === 'height' || mode === 'both') && !el.style.height) el.style.height = `${rect.height}px`

        // -------- Handle Creation --------
        const handles: HTMLElement[] = []
        const makeHandle = (cursor: string, styles: Partial<CSSStyleDeclaration>) => {
            const h = document.createElement('div')
            Object.assign(h.style, {
                position: 'absolute',
                zIndex: '10',
                touchAction: 'none',
                background: 'transparent',
                cursor,
                ...styles,
            } as CSSStyleDeclaration)
            el.appendChild(h)
            handles.push(h)
            return h
        }

        if (mode === 'width' || mode === 'both') {
            makeHandle('ew-resize', {
                top: '0', right: '0', width: `${handleThickness}px`, height: '100%',
            })
        }
        if (mode === 'height' || mode === 'both') {
            makeHandle('ns-resize', {
                left: '0', bottom: '0', height: `${handleThickness}px`, width: '100%',
            })
        }

        // -------- Utils --------
        const getBaseSize = () => {
            if (base === 'window') return {
                w: window.innerWidth,
                h: window.innerHeight,
            }
            const p = el.parentElement?.getBoundingClientRect()
            return {
                w: p?.width ?? window.innerWidth,
                h: p?.height ?? window.innerHeight,
            }
        }

        const snapValue = (target: number, total: number): number => {
            if (snapType === 'grid') {
                const col = total / grid
                return Math.round(target / col) * col
            } else {
                const allowed = steps.filter(f => {
                    const px = f * total
                    return px >= minPx && px <= maxPx
                })
                const pool = allowed.length ? allowed : steps
                let best = pool[0]
                let bestDiff = Math.abs(pool[0] * total - target)
                for (let i = 1; i < pool.length; i++) {
                    const diff = Math.abs(pool[i] * total - target)
                    if (diff < bestDiff) { bestDiff = diff; best = pool[i] }
                }
                return best * total
            }
        }

        // -------- Events --------
        let startX = 0, startY = 0, startW = 0, startH = 0

        const onPointerMove = (e: PointerEvent) => {
            const { w: baseW, h: baseH } = getBaseSize()
            const dx = e.clientX - startX
            const dy = e.clientY - startY

            if (mode === 'width' || mode === 'both') {
                const target = Math.min(Math.max(startW + dx, minPx), maxPx)
                const snapped = snapValue(target, baseW)
                el.style.width = snapped + 'px'
            }
            if (mode === 'height' || mode === 'both') {
                const target = Math.min(Math.max(startH + dy, minPx), maxPx)
                const snapped = snapValue(target, baseH)
                el.style.height = snapped + 'px'
            }
        }

        const stop = () => {
            document.removeEventListener('pointermove', onPointerMove)
            document.removeEventListener('pointerup', stop)
            document.body.style.userSelect = ''
            document.body.style.cursor = ''
        }

        const start = (e: PointerEvent) => {
            e.preventDefault()
            const r = el.getBoundingClientRect()
            startX = e.clientX
            startY = e.clientY
            startW = r.width
            startH = r.height
            document.addEventListener('pointermove', onPointerMove)
            document.addEventListener('pointerup', stop)
            document.body.style.userSelect = 'none'
            document.body.style.cursor =
                mode === 'width' ? 'ew-resize'
                    : mode === 'height' ? 'ns-resize'
                        : 'nwse-resize'
        }

        handles.forEach(h => h.addEventListener('pointerdown', start))

        // cleanup
        const cleanup = () => { stop(); handles.forEach(h => h.remove()) }
            ; (el as any).__snapCleanup = cleanup
    },

    beforeUnmount(el) {
        ; (el as any).__snapCleanup?.()
        delete (el as any).__snapCleanup
    },
}

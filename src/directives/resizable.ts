import type { Directive } from 'vue'

type Handle = 'right' | 'bottom' | 'corner'
interface ResizeOptions {
    minWidth?: number
    maxWidth?: number
    minHeight?: number
    maxHeight?: number
    handles?: Handle[]
    direction?: 'width' | 'height' | 'both' // 👈 الإضافة الجديدة
}

type Cleanup = () => void
const registry = new WeakMap<HTMLElement, { cleanup: Cleanup }>()

export const vResizable: Directive<HTMLElement, ResizeOptions> = {
    mounted(el, binding) {
        const opts = binding.value || {}
        const minW = opts.minWidth ?? 100
        const maxW = opts.maxWidth ?? 1000
        const minH = opts.minHeight ?? 80
        const maxH = opts.maxHeight ?? 800
        const handles: Handle[] = opts.handles ?? ['right', 'bottom', 'corner']
        const direction = opts.direction ?? 'both' // 👈 الافتراضي: الاتنين

        // لو العنصر ملوش position، خلّيه relative
        const computedPos = getComputedStyle(el).position
        if (!['relative', 'absolute', 'fixed'].includes(computedPos)) {
            el.style.position = 'relative'
        }
        el.style.boxSizing = 'border-box'

        // ثبّت أبعاد ابتدائية
        const rect = el.getBoundingClientRect()
        if (!el.style.width) el.style.width = `${rect.width}px`
        if (!el.style.height) el.style.height = `${rect.height}px`

        // Helpers
        const clamp = (n: number, a: number, b: number) => Math.min(Math.max(n, a), b)
        const applyStyles = (node: HTMLElement, styles: Partial<CSSStyleDeclaration>) => {
            Object.assign(node.style, styles)
        }

        let active: Handle | null = null
        let startX = 0, startY = 0, startW = 0, startH = 0

        const onPointerMove = (e: PointerEvent) => {
            if (!active) return
            const dx = e.clientX - startX
            const dy = e.clientY - startY

            // 👇 نراعي الـ direction
            if ((direction === 'width' || direction === 'both') && (active === 'right' || active === 'corner')) {
                const w = clamp(startW + dx, minW, maxW)
                el.style.width = `${w}px`
            }
            if ((direction === 'height' || direction === 'both') && (active === 'bottom' || active === 'corner')) {
                const h = clamp(startH + dy, minH, maxH)
                el.style.height = `${h}px`
            }
        }

        const onPointerUp = () => {
            active = null
            document.removeEventListener('pointermove', onPointerMove)
            document.removeEventListener('pointerup', onPointerUp)
            document.body.style.userSelect = ''
            document.body.style.cursor = ''
        }

        const start = (dir: Handle, e: PointerEvent) => {
            e.preventDefault()
            const r = el.getBoundingClientRect()
            active = dir
            startX = e.clientX
            startY = e.clientY
            startW = r.width
            startH = r.height

            document.addEventListener('pointermove', onPointerMove)
            document.addEventListener('pointerup', onPointerUp)

            document.body.style.userSelect = 'none'
            document.body.style.cursor =
                dir === 'right' ? 'ew-resize' : dir === 'bottom' ? 'ns-resize' : 'nwse-resize'
        }

        const makeHandle = (dir: Handle, styles: Partial<CSSStyleDeclaration>) => {
            const h = document.createElement('div')
            h.className = '__vresizer'
            applyStyles(h, {
                position: 'absolute',
                background: 'rgba(2,136,209,0.95)',
                zIndex: '10',
                touchAction: 'none',
                ...styles,
            })
            h.addEventListener('pointerdown', (ev) => start(dir, ev))
            el.appendChild(h)
            return h
        }

        const created: HTMLElement[] = []

        // 👇 ما نضيفش الهاندلز الغير لازمة حسب direction
        if (direction !== 'height' && handles.includes('right')) {
            created.push(
                makeHandle('right', {
                    width: '10px',
                    height: '100%',
                    right: '0',
                    top: '0',
                    cursor: 'ew-resize',
                }),
            )
        }
        if (direction !== 'width' && handles.includes('bottom')) {
            created.push(
                makeHandle('bottom', {
                    width: '100%',
                    height: '10px',
                    left: '0',
                    bottom: '0',
                    cursor: 'ns-resize',
                }),
            )
        }
        if (direction === 'both' && handles.includes('corner')) {
            created.push(
                makeHandle('corner', {
                    width: '14px',
                    height: '14px',
                    right: '0',
                    bottom: '0',
                    cursor: 'nwse-resize',
                }),
            )
        }

        const cleanup = () => {
            document.removeEventListener('pointermove', onPointerMove)
            document.removeEventListener('pointerup', onPointerUp)
            created.forEach((h) => h.remove())
            document.body.style.userSelect = ''
            document.body.style.cursor = ''
        }
        registry.set(el, { cleanup })
    },

    beforeUnmount(el) {
        const data = registry.get(el)
        if (data) {
            data.cleanup()
            registry.delete(el)
        }
    },
}

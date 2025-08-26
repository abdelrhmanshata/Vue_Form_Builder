import type { DirectiveBinding } from 'vue'

type ResizeOptions = {
    direction?: 'x' | 'y' | 'both'
    snap?: number | number[] // grid (12) أو fractions
    min?: number
    max?: number
}

function getSnapped(value: number, parent: number, snap?: number | number[]): number {
    if (!snap) return value

    // Snap على grid 12
    if (typeof snap === 'number') {
        const colWidth = parent / snap
        return Math.round(value / colWidth) * colWidth
    }

    // Snap على fractions
    if (Array.isArray(snap)) {
        const fractions = snap.map(f => (f <= 1 ? parent * f : f))
        let closest = fractions[0]
        let minDiff = Math.abs(value - closest)
        for (const f of fractions) {
            const diff = Math.abs(value - f)
            if (diff < minDiff) {
                closest = f
                minDiff = diff
            }
        }
        return closest
    }

    return value
}

const resizable = {
    mounted(el: HTMLElement, binding: DirectiveBinding<ResizeOptions>) {
        const opts: ResizeOptions = {
            direction: binding.value?.direction || 'x',
            snap: binding.value?.snap,
            min: binding.value?.min || 50,
            max: binding.value?.max || Infinity,
        }

        const handle = document.createElement('div')
        handle.style.position = 'absolute'
        handle.style.right = '0'
        handle.style.bottom = '0'
        handle.style.width = '10px'
        handle.style.height = '10px'
        handle.style.cursor = opts.direction === 'y'
            ? 'ns-resize'
            : opts.direction === 'x'
                ? 'ew-resize'
                : 'nwse-resize'
        handle.style.background = '#888'
        handle.style.borderRadius = '50%'
        el.style.position = 'relative'
        el.appendChild(handle)

        let startX = 0
        let startY = 0
        let startW = 0
        let startH = 0

        const mouseMove = (e: MouseEvent) => {
            const parentWidth = el.parentElement?.clientWidth || window.innerWidth
            const parentHeight = el.parentElement?.clientHeight || window.innerHeight

            let newW = startW
            let newH = startH

            if (opts.direction === 'x' || opts.direction === 'both') {
                newW = startW + (e.clientX - startX)
                newW = Math.min(Math.max(newW, opts.min!), opts.max!)
                newW = getSnapped(newW, parentWidth, opts.snap)
                el.style.width = newW + 'px'
            }

            if (opts.direction === 'y' || opts.direction === 'both') {
                newH = startH + (e.clientY - startY)
                newH = Math.min(Math.max(newH, opts.min!), opts.max!)
                newH = getSnapped(newH, parentHeight, opts.snap)
                el.style.height = newH + 'px'
            }
        }

        const mouseUp = () => {
            document.removeEventListener('mousemove', mouseMove)
            document.removeEventListener('mouseup', mouseUp)
        }

        handle.addEventListener('mousedown', (e: MouseEvent) => {
            startX = e.clientX
            startY = e.clientY
            startW = el.offsetWidth
            startH = el.offsetHeight
            document.addEventListener('mousemove', mouseMove)
            document.addEventListener('mouseup', mouseUp)
        })
    },
}

export default resizable

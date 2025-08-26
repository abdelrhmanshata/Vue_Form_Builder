import { ref, onMounted, onUnmounted } from 'vue'

type SnapMode = number[] | '12'

export function useResizable(
    elRef: any,
    options: {
        snap?: SnapMode
        defaultWidth?: number
        minWidth?: number
        maxWidth?: number
        onResize?: (width: number) => void
    } = {}
) {
    const width = ref(options.defaultWidth ?? 200)
    let isResizing = false
    let startX = 0
    let startWidth = 0

    const mouseMove = (e: MouseEvent) => {
        if (!isResizing) return
        const dx = e.clientX - startX
        let newWidth = startWidth + dx

        if (options.minWidth) newWidth = Math.max(options.minWidth, newWidth)
        if (options.maxWidth) newWidth = Math.min(options.maxWidth, newWidth)

        // Snap logic
        if (options.snap) {
            if (options.snap === '12' && elRef.value?.parentElement) {
                const parentWidth = elRef.value.parentElement.offsetWidth
                const colWidth = parentWidth / 12
                const nearestCol = Math.round(newWidth / colWidth)
                newWidth = nearestCol * colWidth
            } else if (Array.isArray(options.snap)) {
                if (elRef.value?.parentElement) {
                    const parentWidth = elRef.value.parentElement.offsetWidth
                    const snapWidths = options.snap.map(f => f * parentWidth)
                    newWidth =
                        snapWidths.reduce((prev, curr) =>
                            Math.abs(curr - newWidth) < Math.abs(prev - newWidth) ? curr : prev
                        )
                }
            }
        }

        width.value = newWidth
        if (options.onResize) options.onResize(newWidth)
    }

    const mouseUp = () => {
        isResizing = false
        document.removeEventListener('mousemove', mouseMove)
        document.removeEventListener('mouseup', mouseUp)
    }

    const mouseDown = (e: MouseEvent) => {
        isResizing = true
        startX = e.clientX
        startWidth = width.value
        document.addEventListener('mousemove', mouseMove)
        document.addEventListener('mouseup', mouseUp)
    }

    onMounted(() => {
        if (elRef.value) {
            const handle = document.createElement('div')
            handle.style.width = '6px'
            handle.style.cursor = 'col-resize'
            handle.style.position = 'absolute'
            handle.style.top = '0'
            handle.style.right = '0'
            handle.style.bottom = '0'
            handle.style.background = 'rgba(0,0,0,0.1)'
            handle.addEventListener('mousedown', mouseDown)
            elRef.value.style.position = 'relative'
            elRef.value.appendChild(handle)
        }
    })

    onUnmounted(() => {
        document.removeEventListener('mousemove', mouseMove)
        document.removeEventListener('mouseup', mouseUp)
    })

    return { width }
}

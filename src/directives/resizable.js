export default {
  mounted(el, binding) {
    const options = {
      snap: binding.value?.snap || null, // [1/4, 1/3, 1/2 ...] or 12 (for columns)
      axis: binding.value?.axis || 'both', // "width" | "height" | "both"
      minWidth: binding.value?.minWidth || 50,
      minHeight: binding.value?.minHeight || 50,
    };

    // Create resize handle
    const handle = document.createElement('div');
    handle.style.width = '12px';
    handle.style.height = '12px';
    handle.style.position = 'absolute';
    handle.style.right = '0';
    handle.style.bottom = '0';
    handle.style.cursor = 'se-resize';
    handle.style.background = '#333';
    handle.style.borderRadius = '50%';
    el.style.position = 'relative';
    el.appendChild(handle);

    let startX, startY, startWidth, startHeight;

    const mouseDown = (e) => {
      startX = e.clientX;
      startY = e.clientY;
      startWidth = parseInt(window.getComputedStyle(el).width, 10);
      startHeight = parseInt(window.getComputedStyle(el).height, 10);

      document.addEventListener('mousemove', mouseMove);
      document.addEventListener('mouseup', mouseUp);
    };

    const mouseMove = (e) => {
      let newWidth = startWidth + (e.clientX - startX);
      let newHeight = startHeight + (e.clientY - startY);

      // snap logic
      if (options.snap) {
        if (typeof options.snap === 'number') {
          // grid system (like 12 cols)
          const parentWidth = el.parentElement.offsetWidth;
          const colWidth = parentWidth / options.snap;
          newWidth = Math.round(newWidth / colWidth) * colWidth;
        } else if (Array.isArray(options.snap)) {
          // fractions
          const parentWidth = el.parentElement.offsetWidth;
          const widths = options.snap.map(frac => parentWidth * frac);
          newWidth = widths.reduce((prev, curr) =>
            Math.abs(curr - newWidth) < Math.abs(prev - newWidth) ? curr : prev
          );
        }
      }

      // Apply axis restrictions
      if (options.axis === 'width' || options.axis === 'both') {
        if (newWidth > options.minWidth) el.style.width = newWidth + 'px';
      }
      if (options.axis === 'height' || options.axis === 'both') {
        if (newHeight > options.minHeight) el.style.height = newHeight + 'px';
      }
    };

    const mouseUp = () => {
      document.removeEventListener('mousemove', mouseMove);
      document.removeEventListener('mouseup', mouseUp);
    };

    handle.addEventListener('mousedown', mouseDown);
  },
};

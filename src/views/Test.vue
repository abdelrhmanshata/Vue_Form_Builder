<template>
  <div class="p-6">
    <!-- Snap على Grid 12 -->
    <div
      v-resizable-snap="{ mode: 'width', snapType: 'grid', grid: 12 }"
      class="bg-blue-300 text-white p-4"
    >
      <!-- style="min-width: 100px; width: 100px; height: 100px" -->
      Grid (12 columns)
    </div>

    <!-- Snap على Fractions -->
    <div
      v-resizable-snap="{
        mode: 'width',
        snapType: 'fractions',
        steps: [1, '3/4', '2/3', '1/2', '1/3', '1/4'],
      }"
      class="bg-green-400 text-white p-4 mt-6"
      style="min-width: 100px; width: 100px; height: 100px"
    >
      Fractions
    </div>

    <!-- Snap على الاثنين -->
    <div
      v-resizable-snap="{ mode: 'both', snapType: 'grid', grid: 12 }"
      class="bg-purple-400 text-white p-4 mt-6"
      style="min-width: 100px; width: 100px; height: 100px"
    >
      Resize both (grid)
    </div>
  </div>
</template>

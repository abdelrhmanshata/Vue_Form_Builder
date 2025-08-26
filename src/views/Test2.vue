<template>
  <div class="p-8">
    <h2 class="mb-4 font-bold">Resizable with Snap</h2>

    <!-- Snap على Grid 12 -->
    <div
      v-resizable="{ direction: 'x', snap: 12, min: 100 }"
      class="bg-blue-300 p-4 text-white"
      style="width: 100px; height: 100px"
    >
      Snap Grid 12
    </div>

    <!-- Snap على Fractions -->
    <div
      v-resizable="{ direction: 'x', snap: [1, 0.75, 0.66, 0.5, 0.33, 0.25], min: 100 }"
      class="bg-green-400 p-4 text-white mt-6"
      style="width: 100px; height: 100px"
    >
      Snap Fractions
    </div>
  </div>
</template>

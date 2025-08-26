<template>
  <v-card
    class="task-card mb-3"
    :class="{ 'dragging': isDragging }"
    elevation="2"
    draggable="true"
    @dragstart="onDragStart"
    @dragend="onDragEnd"
    @click="$emit('edit', task)"
  >
    <v-card-title class="d-flex align-center justify-space-between py-3">
      <span class="text-subtitle-1 font-weight-bold text-truncate mr-2">
        {{ task.title }}
      </span>
      <v-chip
        :color="getPriorityColor(task.priority)"
        :prepend-icon="getPriorityIcon(task.priority)"
        size="small"
        variant="flat"
        class="flex-shrink-0"
      >
        {{ task.priority }}
      </v-chip>
    </v-card-title>
    
    <v-card-text class="py-2">
      <p class="text-body-2 mb-3 task-description">
        {{ task.description }}
      </p>
      
      <div class="d-flex align-center justify-space-between">
        <v-chip size="small" variant="outlined" class="flex-shrink-0">
          <v-icon start size="16">mdi-calendar</v-icon>
          {{ formatDate(task.createdAt) }}
        </v-chip>
        
        <div class="d-flex">
          <v-btn
            icon="mdi-pencil"
            size="small"
            variant="text"
            color="primary"
            @click.stop="$emit('edit', task)"
          />
          <v-btn
            icon="mdi-delete"
            size="small"
            variant="text"
            color="error"
            @click.stop="$emit('delete', task.id)"
          />
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { Task } from '../../types';

interface Props {
  task: Task;
  getPriorityColor: (priority: Task['priority']) => string;
  getPriorityIcon: (priority: Task['priority']) => string;
}

const props = defineProps<Props>();

defineEmits<{
  delete: [taskId: string];
  edit: [task: Task];
}>();

const isDragging = ref(false);

const onDragStart = (event: DragEvent) => {
  if (event.dataTransfer) {
    event.dataTransfer.setData('text/plain', JSON.stringify({
      id: props.task.id,
      status: props.task.status
    }));
    event.dataTransfer.effectAllowed = 'move';
  }
  isDragging.value = true;
};

const onDragEnd = () => {
  isDragging.value = false;
};

const formatDate = (date: Date) => {
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) return 'Today';
  if (diffDays === 2) return 'Yesterday';
  if (diffDays <= 7) return `${diffDays} days ago`;
  
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
};
</script>

<style scoped>
.task-description {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
  max-height: 2.8em;
}

.task-card {
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.task-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
}

.task-card.dragging {
  opacity: 0.8;
  transform: rotate(2deg) scale(1.02);
  z-index: 1000;
}
</style>
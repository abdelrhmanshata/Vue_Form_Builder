<template>
  <v-col cols="12" md="4" class="px-2">
    <div 
      :class="[columnClass, { 'drag-over': isDragOver }]"
      @dragover.prevent="onDragOver"
      @dragleave="onDragLeave"
      @drop="onDrop"
    >
      <div class="column-header pa-4 d-flex align-center">
        <v-icon :icon="column.icon" class="mr-2" size="24" />
        <h3 class="text-h6 font-weight-bold mb-0 flex-grow-1">
          {{ column.title }}
        </h3>
        <v-chip 
          :color="column.color" 
          size="small" 
          variant="outlined"
          class="text-white border-white ml-2"
        >
          {{ taskCount }}
        </v-chip>
      </div>
      
      <div class="task-list" :style="{ minHeight: minListHeight }">
        <transition-group name="task" tag="div" appear>
          <TaskCard
            v-for="task in tasks"
            :key="task.id"
            :task="task"
            :get-priority-color="getPriorityColor"
            :get-priority-icon="getPriorityIcon"
            @delete="$emit('delete-task', $event)"
            @edit="$emit('edit-task', $event)"
          />
        </transition-group>
        
        <div v-if="tasks.length === 0" class="empty-state">
          <div class="text-center">
            <v-icon :icon="column.icon" size="48" color="grey-lighten-2" />
            <p class="mt-2 text-grey-lighten-1">{{ emptyMessage }}</p>
          </div>
        </div>
      </div>
    </div>
  </v-col>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import TaskCard from './TaskCard.vue';
import type { Task, Column } from '../types';

interface Props {
  column: Column;
  tasks: Task[];
  getPriorityColor: (priority: Task['priority']) => string;
  getPriorityIcon: (priority: Task['priority']) => string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'move-task': [taskId: string, newStatus: Task['status']];
  'delete-task': [taskId: string];
  'edit-task': [task: Task];
}>();

const isDragOver = ref(false);

const columnClass = computed(() => `${props.column.status}-column`);
const taskCount = computed(() => props.tasks.length);
const minListHeight = computed(() => `${Math.max(300, props.tasks.length * 120)}px`);

const emptyMessage = computed(() => {
  const messages = {
    todo: 'No tasks to do',
    progress: 'Nothing in progress',
    done: 'No completed tasks'
  };
  return messages[props.column.status] || 'No tasks';
});

const onDragOver = (event: DragEvent) => {
  event.preventDefault();
  isDragOver.value = true;
};

const onDragLeave = (event: DragEvent) => {
  // Only hide drag over state if leaving the column entirely
  if (!event.currentTarget?.contains(event.relatedTarget as Node)) {
    isDragOver.value = false;
  }
};

const onDrop = (event: DragEvent) => {
  event.preventDefault();
  isDragOver.value = false;
  
  if (event.dataTransfer) {
    try {
      const jsonData = event.dataTransfer.getData('text/plain');
      if (!jsonData) return;
      
      const data = JSON.parse(jsonData);
      if (data?.id && data?.status && data.status !== props.column.status) {
        emit('move-task', data.id, props.column.status);
      }
    } catch (error) {
      console.warn('Failed to parse drag data:', error);
    }
  }
};
</script>

<style scoped>
.task-enter-active,
.task-leave-active {
  transition: all 0.3s ease;
}

.task-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}

.task-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

.task-move {
  transition: transform 0.3s ease;
}
</style>
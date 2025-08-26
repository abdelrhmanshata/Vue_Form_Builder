<template>
  <v-dialog v-model="dialog" max-width="600px" persistent>
    <template v-slot:activator="{ props: activatorProps }">
      <v-fab
        icon="mdi-plus"
        location="bottom end"
        app
        color="primary"
        size="large"
        v-bind="activatorProps"
      />
    </template>
    
    <v-card>
      <v-card-title class="text-h5 pa-6 d-flex align-center">
        <v-icon :icon="isEditing ? 'mdi-pencil' : 'mdi-plus-circle'" class="mr-2" />
        {{ isEditing ? 'Edit Task' : 'Add New Task' }}
      </v-card-title>
      
      <v-card-text class="px-6">
        <v-form ref="form" v-model="valid" @submit.prevent="submitTask">
          <v-text-field
            v-model="taskData.title"
            label="Task Title"
            :rules="titleRules"
            variant="outlined"
            prepend-inner-icon="mdi-format-title"
            class="mb-4"
            counter="100"
            maxlength="100"
          />
          
          <v-textarea
            v-model="taskData.description"
            label="Description"
            :rules="descriptionRules"
            variant="outlined"
            prepend-inner-icon="mdi-text"
            rows="3"
            class="mb-4"
            counter="500"
            maxlength="500"
          />
          
          <v-row>
            <v-col cols="6">
              <v-select
                v-model="taskData.status"
                :items="statusOptions"
                label="Status"
                variant="outlined"
                prepend-inner-icon="mdi-flag"
              />
            </v-col>
            <v-col cols="6">
              <v-select
                v-model="taskData.priority"
                :items="priorityOptions"
                label="Priority"
                variant="outlined"
                prepend-inner-icon="mdi-priority-high"
              />
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
      
      <v-card-actions class="px-6 pb-6">
        <v-spacer />
        <v-btn
          color="grey"
          variant="text"
          @click="closeDialog"
        >
          Cancel
        </v-btn>
        <v-btn
          :color="isEditing ? 'success' : 'primary'"
          variant="flat"
          :disabled="!valid"
          @click="submitTask"
        >
          <v-icon start>{{ isEditing ? 'mdi-check' : 'mdi-plus' }}</v-icon>
          {{ isEditing ? 'Update Task' : 'Add Task' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick } from 'vue';
import type { Task } from '../../types';

interface Props {
  editingTask?: Task | null;
}

const props = withDefaults(defineProps<Props>(), {
  editingTask: null
});

const emit = defineEmits<{
  'add-task': [task: Omit<Task, 'id' | 'createdAt'>];
  'update-task': [taskId: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>];
  'close-edit': [];
}>();

const dialog = ref(false);
const valid = ref(false);
const form = ref();

const isEditing = computed(() => !!props.editingTask);

const taskData = reactive({
  title: '',
  description: '',
  status: 'todo' as Task['status'],
  priority: 'medium' as Task['priority'],
});

const titleRules = [
  (v: string) => !!v || 'Title is required',
  (v: string) => v.length <= 100 || 'Title must be less than 100 characters'
];

const descriptionRules = [
  (v: string) => !!v || 'Description is required',
  (v: string) => v.length <= 500 || 'Description must be less than 500 characters'
];

const statusOptions = [
  { title: 'To Do', value: 'todo' },
  { title: 'In Progress', value: 'progress' },
  { title: 'Done', value: 'done' },
];

const priorityOptions = [
  { title: 'Low', value: 'low' },
  { title: 'Medium', value: 'medium' },
  { title: 'High', value: 'high' },
];

// Watch for editing task changes
watch(() => props.editingTask, (newTask) => {
  if (newTask) {
    Object.assign(taskData, {
      title: newTask.title,
      description: newTask.description,
      status: newTask.status,
      priority: newTask.priority,
    });
    dialog.value = true;
  }
}, { immediate: true });

const submitTask = async () => {
  if (!valid.value) return;
  
  if (isEditing.value && props.editingTask) {
    emit('update-task', props.editingTask.id, { ...taskData });
  } else {
    emit('add-task', { ...taskData });
  }
  
  closeDialog();
};

const closeDialog = () => {
  dialog.value = false;
  if (isEditing.value) {
    emit('close-edit');
  }
  
  // Reset form after dialog closes
  nextTick(() => {
    form.value?.reset();
    Object.assign(taskData, {
      title: '',
      description: '',
      status: 'todo',
      priority: 'medium',
    });
  });
};
</script>
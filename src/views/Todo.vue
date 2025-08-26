<template>
  <v-app>
    <v-app-bar color="primary" prominent>
      <v-app-bar-title>
        <v-icon icon="mdi-view-dashboard" class="mr-2" />
        Task Board
      </v-app-bar-title>

      <v-spacer />

      <div class="d-flex align-center ga-2">
        <v-chip
          prepend-icon="mdi-chart-line"
          color="info"
          variant="outlined"
          class="text-white border-white"
        >
          {{ taskStats.completionRate }}% Complete
        </v-chip>

        <v-chip
          prepend-icon="mdi-check-circle"
          color="success"
          variant="outlined"
          class="text-white border-white"
        >
          {{ taskStats.done }} / {{ taskStats.total }}
        </v-chip>

        <v-menu>
          <template v-slot:activator="{ props: menuProps }">
            <v-btn icon="mdi-dots-vertical" v-bind="menuProps" />
          </template>
          <v-list>
            <v-list-item @click="clearCompleted">
              <v-list-item-title>
                <v-icon start>mdi-delete-sweep</v-icon>
                Clear Completed
              </v-list-item-title>
            </v-list-item>
            <v-list-item @click="toggleTheme">
              <v-list-item-title>
                <v-icon start>mdi-theme-light-dark</v-icon>
                Toggle Theme
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>
    </v-app-bar>

    <v-main>
      <v-container fluid class="pa-4">
        <v-row class="mb-4">
          <v-col>
            <h1 class="text-h4 font-weight-bold text-white text-center mb-2">
              Project Task Management
            </h1>
            <p class="text-center text-white opacity-80">
              Drag and drop tasks between columns to update their status
            </p>
          </v-col>
        </v-row>

        <v-row>
          <TaskColumn
            v-for="column in columns"
            :key="column.id"
            :column="column"
            :tasks="getTasksByStatus(column.status)"
            :get-priority-color="getPriorityColor"
            :get-priority-icon="getPriorityIcon"
            @move-task="handleMoveTask"
            @delete-task="handleDeleteTask"
            @edit-task="handleEditTask"
          />
        </v-row>
      </v-container>
    </v-main>

    <TaskDialog
      :editing-task="editingTask"
      @add-task="handleAddTask"
      @update-task="handleUpdateTask"
      @close-edit="editingTask = null"
    />

    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="3000"
      location="bottom right"
    >
      {{ snackbar.text }}
      <template v-slot:actions>
        <v-btn color="white" variant="text" @click="snackbar.show = false"> Close </v-btn>
      </template>
    </v-snackbar>
  </v-app>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { useTheme } from "vuetify";
import TaskColumn from "../components/Todo/TaskColumn.vue";
import TaskDialog from "../components/Todo/TaskDialog.vue";
import { useTasks } from "../composables/useTasks";
import type { Task, Column } from "../types";

const theme = useTheme();
const {
  todoTasks,
  progressTasks,
  doneTasks,
  taskStats,
  addTask,
  updateTaskStatus,
  updateTask,
  deleteTask,
  clearCompletedTasks,
  getPriorityColor,
  getPriorityIcon,
} = useTasks();

const editingTask = ref<Task | null>(null);

const snackbar = reactive({
  show: false,
  text: "",
  color: "success",
});

const columns: Column[] = [
  {
    id: "todo",
    title: "To Do",
    status: "todo",
    color: "primary",
    icon: "mdi-clipboard-text",
  },
  {
    id: "progress",
    title: "In Progress",
    status: "progress",
    color: "warning",
    icon: "mdi-clock",
  },
  {
    id: "done",
    title: "Done",
    status: "done",
    color: "success",
    icon: "mdi-check-circle",
  },
];

const getTasksByStatus = (status: Task["status"]) => {
  switch (status) {
    case "todo":
      return todoTasks.value;
    case "progress":
      return progressTasks.value;
    case "done":
      return doneTasks.value;
    default:
      return [];
  }
};

const handleAddTask = (task: Omit<Task, "id" | "createdAt">) => {
  addTask(task);
  showSnackbar("Task added successfully", "success");
};

const handleUpdateTask = (
  taskId: string,
  updates: Partial<Omit<Task, "id" | "createdAt">>
) => {
  updateTask(taskId, updates);
  editingTask.value = null;
  showSnackbar("Task updated successfully", "success");
};

const handleMoveTask = (taskId: string, newStatus: Task["status"]) => {
  updateTaskStatus(taskId, newStatus);
  showSnackbar(`Task moved to ${newStatus}`, "info");
};

const handleDeleteTask = (taskId: string) => {
  deleteTask(taskId);
  showSnackbar("Task deleted successfully", "success");
};

const handleEditTask = (task: Task) => {
  editingTask.value = task;
};

const clearCompleted = () => {
  const completedCount = doneTasks.value.length;
  if (completedCount > 0) {
    clearCompletedTasks();
    showSnackbar(`${completedCount} completed tasks cleared`, "success");
  } else {
    showSnackbar("No completed tasks to clear", "info");
  }
};

const showSnackbar = (text: string, color: string) => {
  snackbar.text = text;
  snackbar.color = color;
  snackbar.show = true;
};

const toggleTheme = () => {
  theme.global.name.value = theme.global.current.value.dark ? "light" : "dark";
  showSnackbar(`Switched to ${theme.global.name.value} theme`, "info");
};
</script>

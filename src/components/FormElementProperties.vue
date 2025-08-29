<template>
  <v-card class="form-element-properties" elevation="2">
    <v-card-title class="d-flex align-center">
      <v-icon icon="mdi-cog" class="mr-2" />
      Element Properties
      <v-chip v-if="element" color="primary" size="small" class="ml-2">
        {{ elementTypeLabel }}
      </v-chip>
    </v-card-title>

    <v-card-text>
      <div v-if="element" class="properties-form">
        {{ element }}
        <!-- Basic Properties Section -->
        <v-expansion-panels
          variant="accordion"
          class="mb-3"
          v-model="expandedPanels"
          multiple
        >
          <v-expansion-panel value="basic">
            <v-expansion-panel-title class="gap-2">
              <v-icon icon="mdi-tune" class="mr-2" />
              Basic Properties
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <v-text-field
                v-model="element.label"
                label="Label"
                variant="outlined"
                density="compact"
                clearable
                @update:model-value="updateProperty('label', $event)"
              />

              <v-text-field
                v-if="hasPlaceholder"
                v-model="element.placeholder"
                label="Placeholder"
                variant="outlined"
                density="compact"
                clearable
                @update:model-value="updateProperty('placeholder', $event)"
              />

              <v-select
                v-model="element.width"
                :items="widthOptions"
                label="Width"
                variant="outlined"
                density="compact"
                @update:model-value="updateProperty('width', $event)"
              />

              <div class="d-flex flex-wrap gap-3">
                <v-switch
                  v-model="element.newRow"
                  label="Start New Row"
                  color="primary"
                  density="compact"
                  @update:model-value="updateProperty('newRow', $event)"
                />

                <v-switch
                  v-model="element.required"
                  label="Required"
                  color="red"
                  density="compact"
                  @update:model-value="updateProperty('required', $event)"
                />
                <!-- Multiple Selection for select elements -->
                <v-switch
                  v-if="['select', 'auto_select'].includes(element.type)"
                  v-model="element.multiple"
                  label="Multiple Selection"
                  color="primary"
                  density="compact"
                  @update:model-value="updateProperty('multiple', $event)"
                />

                <!-- Inline for select elements -->
                <v-switch
                  v-if="['radio', 'checkbox'].includes(element.type)"
                  v-model="element.inline"
                  label="Inline Selection"
                  color="primary"
                  density="compact"
                  @update:model-value="updateProperty('inline', $event)"
                />
              </div>
            </v-expansion-panel-text>
          </v-expansion-panel>

          <!-- Options Section -->
          <v-expansion-panel value="options" v-if="hasOptions">
            <v-expansion-panel-title>
              <v-icon icon="mdi-format-list-bulleted" class="mr-2" />
              Options
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <div>
                <v-row
                  v-for="(option, index) in localOptions"
                  :key="index"
                  class="option-item align-center rounded-lg my-1 px-1"
                >
                  <v-col cols="11" class="pa-0">
                    <v-text-field
                      v-model="localOptions[index]"
                      :label="`Option ${index + 1}`"
                      variant="outlined"
                      density="compact"
                      hide-details
                    />
                  </v-col>

                  <v-col cols="1" class="d-flex">
                    <v-btn
                      icon
                      size="small"
                      color="error"
                      variant="text"
                      @click="removeOption(index)"
                      :disabled="localOptions.length <= 1"
                    >
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                  </v-col>
                </v-row>

                <v-btn
                  prepend-icon="mdi-plus"
                  variant="tonal"
                  size="small"
                  class="mt-2"
                  color="primary"
                  @click="addOption"
                >
                  Add Option
                </v-btn>
              </div>
            </v-expansion-panel-text>
          </v-expansion-panel>

          <!-- Type-Image Properties -->
          <v-expansion-panel value="typeImage" v-if="hasTypeSpecific">
            <v-expansion-panel-title>
              <v-icon :icon="typeSpecific.icon" class="mr-2" />
              {{ typeSpecific.title }}
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <!-- Upload Image Properties -->
              <div v-if="element.type === 'upload_image'">
                <!-- Multiple Selection for select elements -->
                <v-switch
                  v-model="element.multiple"
                  label="Upload Multiple Image"
                  color="primary"
                  density="compact"
                  @update:model-value="updateProperty('multiple', $event)"
                />
                <v-text-field
                  v-if="element.multiple"
                  v-model.number="element.maxFiles"
                  label="Maximum Images"
                  type="number"
                  min="2"
                  max="10"
                  color="primary"
                  icon-color="primary"
                  variant="outlined"
                  density="compact"
                  clearable
                  @update:model-value="updateProperty('maxFiles', $event)"
                />
              </div>

              <div v-if="element.type === 'upload_file'">
                <!-- Multiple Selection for select elements -->
                <v-switch
                  v-model="element.multiple"
                  label="Upload Multiple Files"
                  color="primary"
                  density="compact"
                  @update:model-value="updateProperty('multiple', $event)"
                />
                <v-text-field
                  v-if="element.multiple"
                  v-model.number="element.maxFiles"
                  label="Maximum Files"
                  type="number"
                  min="2"
                  max="10"
                  color="primary"
                  icon-color="primary"
                  variant="outlined"
                  density="compact"
                  clearable
                  @update:model-value="updateProperty('maxFiles', $event)"
                />
              </div>

              <!-- Image Properties -->
              <div v-if="element.type === 'image'">
                <div class="d-flex">
                  <v-checkbox label="Width" v-model="checkWImage" />
                  <v-slider
                    :disabled="!checkWImage"
                    v-model="element.w_image"
                    prepend-icon="mdi-minus"
                    append-icon="mdi-plus"
                    color="primary"
                    max="1000"
                    min="100"
                    step="10"
                    thumb-label="always"
                    @update:model-value="updateProperty('w_image', $event)"
                  />
                </div>

                <div class="d-flex">
                  <v-checkbox label="Height" v-model="checkHImage" />
                  <v-slider
                    :disabled="!checkHImage"
                    v-model="element.h_image"
                    prepend-icon="mdi-minus"
                    append-icon="mdi-plus"
                    color="primary"
                    max="1000"
                    min="100"
                    step="10"
                    thumb-label="always"
                    @update:model-value="updateProperty('h_image', $event)"
                  />
                </div>

                <!--  -->
                <v-file-input
                  v-model="element.file"
                  label="Image"
                  placeholder="Select Image"
                  prepend-icon=""
                  prepend-inner-icon="mdi-image-plus"
                  accept="image/*"
                  color="primary"
                  icon-color="primary"
                  variant="outlined"
                  density="compact"
                  show-size
                  clearable
                  chips
                >
                </v-file-input>

                <v-text-field
                  v-model="element.url"
                  label="Image URL"
                  placeholder="https://example.com/image.jpg"
                  color="primary"
                  density="compact"
                  variant="outlined"
                  icon-color="primary"
                  prepend-inner-icon="mdi-link"
                  clearable
                />

                <v-text-field
                  v-model="element.alt"
                  label="Alt Text"
                  placeholder="Description of the image"
                  prepend-inner-icon="mdi-text-recognition"
                  color="primary"
                  icon-color="primary"
                  density="compact"
                  variant="outlined"
                  clearable
                />
              </div>
            </v-expansion-panel-text>
          </v-expansion-panel>

          <!-- Validation Section -->
          <v-expansion-panel value="validation" v-if="hasValidation">
            <v-expansion-panel-title>
              <v-icon icon="mdi-shield-check" class="mr-2" />
              Validation Rules
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <div class="validation-rules">
                <!-- Text validation -->
                <template v-if="['text', 'textarea'].includes(element.type)">
                  <v-text-field
                    v-model.number="element.validation.minLength"
                    label="Minimum Length"
                    type="number"
                    min="0"
                    variant="outlined"
                    density="compact"
                    clearable
                  />
                  <v-text-field
                    v-model.number="element.validation.maxLength"
                    label="Maximum Length"
                    type="number"
                    :min="element?.validation?.minLength ?? 1"
                    variant="outlined"
                    density="compact"
                    clearable
                  />
                </template>

                <!-- Number validation -->
                <template v-if="element.type === 'number'">
                  <v-text-field
                    v-model.number="element.validation.min"
                    label="Minimum Value"
                    type="number"
                    variant="outlined"
                    density="compact"
                    clearable
                  />

                  <v-text-field
                    v-model.number="element.validation.max"
                    label="Maximum Value"
                    type="number"
                    :min="element?.validation?.min ?? 0"
                    variant="outlined"
                    density="compact"
                    clearable
                  />
                </template>

                <!-- Date Properties -->
                <template v-if="['date', 'date_picker'].includes(element.type)">
                  <v-switch
                    v-if="element.type === 'date_picker'"
                    v-model="element.multiple"
                    color="primary"
                    density="compact"
                  >
                    <template #label>
                      <v-icon
                        start
                        class="mx-1"
                        :color="element.multiple ? 'green' : 'grey'"
                        icon="mdi-calendar-multiselect"
                      />
                      Multiple Selection
                    </template>
                  </v-switch>

                  <v-text-field
                    v-model="element.validation.minDate"
                    label="Min Date"
                    type="date"
                    prepend-inner-icon="mdi-calendar-start-outline"
                    color="primary"
                    icon-color="primary"
                    variant="outlined"
                    density="compact"
                  />
                  <v-text-field
                    v-model="element.validation.maxDate"
                    label="Max Date"
                    type="date"
                    prepend-inner-icon="mdi-calendar-end-outline"
                    color="primary"
                    icon-color="primary"
                    variant="outlined"
                    density="compact"
                  />
                </template>
              </div>
            </v-expansion-panel-text>
          </v-expansion-panel>

          <!-- Dependencies Section -->
          <v-expansion-panel value="dependencies">
            <v-expansion-panel-title>
              <v-icon icon="mdi-link" class="mr-2" />
              Dependencies
              <v-chip
                v-if="element.dependencies?.length"
                size="x-small"
                color="primary"
                class="ml-2"
              >
                {{ element.dependencies.length }}
              </v-chip>
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <div
                v-if="element.dependencies && element.dependencies.length > 0"
                class="dependencies-list"
              >
                <div
                  v-for="(dependency, index) in element.dependencies"
                  :key="index"
                  class="dependency-item mb-4 pa-3 rounded border"
                >
                  <div class="d-flex justify-space-between align-start mb-2">
                    <h4 class="text-caption font-weight-medium">
                      Dependency {{ index + 1 }}
                    </h4>
                    <v-btn
                      icon="mdi-delete"
                      size="x-small"
                      color="error"
                      variant="text"
                      @click="removeDependency(index)"
                    />
                  </div>

                  <v-select
                    :model-value="dependency.elementId"
                    :items="availableDependencies"
                    label="Depends On"
                    variant="outlined"
                    density="compact"
                    class="mb-2"
                    @update:model-value="updateDependency(index, 'elementId', $event)"
                    :hint="getElementTypeHint(dependency.elementId)"
                    persistent-hint
                  />

                  <v-select
                    :model-value="dependency.condition"
                    :items="conditionOptions"
                    label="Condition"
                    variant="outlined"
                    density="compact"
                    class="mb-2"
                    @update:model-value="updateDependency(index, 'condition', $event)"
                  />

                  <v-text-field
                    :model-value="dependency.value"
                    label="Value"
                    variant="outlined"
                    density="compact"
                    class="mb-2"
                    @update:model-value="updateDependency(index, 'value', $event)"
                    :hint="getValueHint(dependency.condition)"
                    persistent-hint
                  />

                  <v-select
                    :model-value="dependency.action"
                    :items="actionOptions"
                    label="Action"
                    variant="outlined"
                    density="compact"
                    class="mb-2"
                    @update:model-value="updateDependency(index, 'action', $event)"
                  />
                </div>
              </div>

              <v-btn
                prepend-icon="mdi-plus"
                variant="outlined"
                size="small"
                @click="addDependency"
                :disabled="availableDependencies.length === 0"
                class="mt-2"
              >
                Add Dependency
                <template v-slot:append>
                  <v-tooltip v-if="availableDependencies.length === 0" location="top">
                    <template v-slot:activator="{ props }">
                      <v-icon v-bind="props" icon="mdi-information" size="small" />
                    </template>
                    <span>No other elements available for dependency</span>
                  </v-tooltip>
                </template>
              </v-btn>

              <div
                v-if="availableDependencies.length === 0"
                class="text-caption text-grey mt-2"
              >
                Add more elements to create dependencies.
              </div>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>

        <!-- Quick Actions -->
        <div class="quick-actions mt-4">
          <v-alert v-if="hasChanges" type="info" density="compact" class="mb-3">
            Changes are applied automatically
          </v-alert>

          <div class="d-flex justify-space-between">
            <v-btn
              color="error"
              variant="outlined"
              prepend-icon="mdi-delete"
              @click="$emit('delete-element')"
              size="small"
            >
              Delete
            </v-btn>
            <v-btn
              color="primary"
              variant="outlined"
              prepend-icon="mdi-content-duplicate"
              @click="$emit('duplicate-element')"
              size="small"
            >
              Duplicate
            </v-btn>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state text-center py-8">
        <v-icon icon="mdi-cursor-pointer" size="64" color="grey-lighten-2" class="mb-4" />
        <h3 class="text-h6 mb-2 text-grey-darken-1">No Element Selected</h3>
        <p class="text-body-2 text-grey-darken-1">
          Click on a form element to edit its properties
        </p>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type { FormElement, FormElementDependency } from "@/types/form";

interface Props {
  element: FormElement | null;
  availableElements?: FormElement[];
}

const props = withDefaults(defineProps<Props>(), {
  availableElements: () => [],
});

const emit = defineEmits<{
  "update-element": [elementId: string, updates: Partial<FormElement>];
  "delete-element": [];
  "duplicate-element": [];
}>();

const expandedPanels = ref(["basic"]);
const hasChanges = ref(false);

const localOptions = ref<string[]>([...(props.element?.options ?? [])]);
const checkWImage = ref(false);
const checkHImage = ref(false);

const elementTypeLabel = computed(() => {
  if (!props.element) return "";
  const typeMap: Record<string, string> = {
    text: "Text Input",
    number: "Number Input",
    textarea: "Text Area",
    date: "Date Picker",
    select: "Select Dropdown",
    radio: "Radio Buttons",
    checkbox: "Checkboxes",
    image: "Image Upload",
    file: "File Upload",
  };
  return typeMap[props.element.type] || props.element.type;
});

const widthOptions = [
  { title: "Full Width (100%)", value: "full" },
  { title: "Two Thirds (66%)", value: "two-thirds" },
  { title: "Half Width (50%)", value: "half" },
  { title: "One Third (33%)", value: "third" },
  { title: "Quarter Width (25%)", value: "quarter" },
];

const conditionOptions = [
  { title: "Equals", value: "equals" },
  { title: "Not Equals", value: "notEquals" },
  { title: "Contains", value: "contains" },
  { title: "Greater Than", value: "greaterThan" },
  { title: "Less Than", value: "lessThan" },
];

const actionOptions = [
  { title: "Show Element", value: "show" },
  { title: "Hide Element", value: "hide" },
  { title: "Enable Element", value: "enable" },
  { title: "Disable Element", value: "disable" },
  { title: "Update Options", value: "updateOptions" },
];

const hasPlaceholder = computed(() => {
  if (!props.element) return false;
  return ["text", "email", "number", "textarea"].includes(props.element.type);
});

const hasOptions = computed(() => {
  if (!props.element) return false;
  return ["select", "auto_select", "radio", "checkbox"].includes(props.element.type);
});

const hasValidation = computed(() => {
  if (!props.element) return false;
  return ["text", "number", "textarea", "date", "date_picker"].includes(
    props.element.type
  );
});

const hasTypeSpecific = computed(() => {
  if (!props.element) return false;
  return ["image", "upload_image", "upload_file"].includes(props.element.type);
});

const typeSpecific = computed(() => {
  if (!props.element) return { title: "Properties", icon: "mdi-cog" };

  switch (props.element.type) {
    case "image":
      return { title: "Image Properties", icon: "mdi-image" };
    case "upload_image":
      return { title: "Upload Image Properties", icon: "mdi-image-plus" };
    case "upload_file":
      return { title: "Upload File Properties", icon: "mdi-file-upload" };
    default:
      return { title: "Properties", icon: "mdi-cog" };
  }
});

const availableDependencies = computed(() => {
  return props.availableElements
    .filter((el) => el.id !== props.element?.id)
    .map((el) => ({
      title: `${el.label} (${el.type})`,
      value: el.id,
    }));
});

const updateProperty = (key: keyof FormElement, value: any) => {
  if (!props.element) return;
  hasChanges.value = true;
  emit("update-element", props.element.id, { [key]: value });
};

const updateValidation = (key: string, value: any) => {
  if (!props.element) return;
  hasChanges.value = true;
  const validation = { ...props.element.validation, [key]: value };
  // Remove undefined values
  Object.keys(validation).forEach((k) => {
    if (validation[k as keyof typeof validation] === undefined) {
      delete validation[k as keyof typeof validation];
    }
  });
  emit("update-element", props.element.id, { validation });
};

//

const addOption = () => {
  localOptions.value.push(`Option ${localOptions.value.length + 1}`);
};

const removeOption = (index: number) => {
  if (localOptions.value.length > 1) {
    localOptions.value.splice(index, 1);
  }
};
//
const addDependency = () => {
  if (!props.element || availableDependencies.value.length === 0) return;
  hasChanges.value = true;
  const newDependency: FormElementDependency = {
    elementId: availableDependencies.value[0]?.value || "",
    condition: "equals",
    value: "",
    action: "show",
  };
  const currentDependencies = props.element.dependencies || [];
  const newDependencies = [...currentDependencies, newDependency];
  emit("update-element", props.element.id, { dependencies: newDependencies });
};

const updateDependency = (
  index: number,
  key: keyof FormElementDependency,
  value: any
) => {
  if (!props.element?.dependencies) return;
  hasChanges.value = true;
  const newDependencies = [...props.element.dependencies];
  newDependencies[index] = { ...newDependencies[index], [key]: value };
  emit("update-element", props.element.id, { dependencies: newDependencies });
};

const removeDependency = (index: number) => {
  if (!props.element?.dependencies) return;
  hasChanges.value = true;
  const newDependencies = props.element.dependencies.filter((_, i) => i !== index);
  emit("update-element", props.element.id, { dependencies: newDependencies });
};

const getElementTypeHint = (elementId: string) => {
  const element = props.availableElements.find((el) => el.id === elementId);
  return element ? `Type: ${element.type}` : "";
};

const getValueHint = (condition: string) => {
  const hints: Record<string, string> = {
    equals: "Value must exactly match",
    notEquals: "Value must not match",
    contains: "Value must contain this text",
    greaterThan: "Value must be greater than this number",
    lessThan: "Value must be less than this number",
  };
  return hints[condition] || "Enter comparison value";
};

// watches

//
watch(
  () => props.element?.options,
  (newVal) => {
    if (newVal) localOptions.value = [...newVal];
  },
  { deep: true }
);

watch(checkWImage, (newVal) => {
  if (!props.element) return;
  emit("update-element", props.element.id, {
    w_image: newVal ? props.element?.w_image : "auto",
  });
});

watch(checkHImage, (newVal) => {
  if (!props.element) return;
  emit("update-element", props.element.id, {
    h_image: newVal ? props.element?.h_image : "auto",
  });
});

// Emit Options
watch(
  localOptions,
  (newVal) => {
    if (props.element) {
      emit("update-element", props.element.id, { options: [...newVal] });
    }
  },
  { deep: true }
);

// Reset changes flag when element changes
watch(
  () => props.element,
  () => {
    hasChanges.value = false;
    expandedPanels.value = ["basic"];
  }
);
</script>

<style scoped>
.form-element-properties {
  height: fit-content;
  position: sticky;
  top: 20px;
  max-height: 100vh;
  overflow-y: auto;
}

.properties-form {
  max-width: 100%;
}

.empty-state {
  min-height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.dependencies-list {
  max-height: 300px;
  overflow-y: auto;
}

.dependency-item {
  background-color: #fafafa;
  border: 1px solid #e0e0e0;
}

.option-item {
  transition: all 0.2s ease;
  border: 1px solid #e0e0e0;
  background-color: #fff;
}

.option-item:hover {
  background-color: #f9fafb;
  border-color: #d1d5db;
  transform: scale(1.01);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}
.quick-actions {
  border-top: 1px solid #e0e0e0;
  padding-top: 16px;
}

:deep(.v-expansion-panel-text__wrapper) {
  padding: 16px;
}

.gap-3 {
  gap: 12px;
}
</style>

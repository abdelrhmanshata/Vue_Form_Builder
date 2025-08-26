import { ref, computed, readonly } from 'vue';
// Add to existing imports
import { formElementTemplates } from '@/components/Elements/FormElement'
import type { FormElement, FormConfig, FormElementTemplate, FormHistory, FormAction, FormSettings } from '@/types/form';


// Re-export formElementTemplates
export { formElementTemplates };


// Functions
const STORAGE_KEY = 'vue-form-builder-forms';
const loadForms = (): FormConfig[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.map((form: any) => ({
        ...form,
        createdAt: new Date(form.createdAt),
        updatedAt: new Date(form.updatedAt)
      }));
    }
  } catch (error) {
    console.warn('Failed to load forms from localStorage:', error);
  }
  return [];
};

// Save forms to localStorage
const saveForms = (forms: FormConfig[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(forms));
  } catch (error) {
    console.warn('Failed to save forms to localStorage:', error);
  }
};

export function useFormBuilder() {
  const forms = ref<FormConfig[]>(loadForms());
  const currentForm = ref<FormConfig | null>(null);
  const selectedElement = ref<FormElement | null>(null);

  const currentFormElements = computed(() =>
    currentForm.value?.elements.sort((a, b) => a.position - b.position) || []
  );

  const createNewForm = () => {
    const newForm: FormConfig = {
      id: `form-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: 'Untitled Form',
      description: 'Form description',
      elements: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    forms.value.push(newForm);
    currentForm.value = newForm;
    saveForms(forms.value);
    return newForm;
  };

  const loadForm = (formId: string) => {
    const form = forms.value.find(f => f.id === formId);
    if (form) {
      currentForm.value = form;
    }
  };

  const updateFormConfig = (updates: Partial<Pick<FormConfig, 'title' | 'description'>>) => {
    if (currentForm.value) {
      Object.assign(currentForm.value, updates, { updatedAt: new Date() });
      saveForms(forms.value);
    }
  };

  // const addElement = (template: FormElementTemplate, position?: number) => {
  //   if (!currentForm.value) return;

  //   const newElement: FormElement = {
  //     id: `element-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  //     type: template.type,
  //     position: position ?? currentForm.value.elements.length,
  //     ...template.defaultProps
  //   } as FormElement;

  //   // Adjust positions of existing elements if inserting in middle
  //   if (position !== undefined) {
  //     currentForm.value.elements.forEach(el => {
  //       if (el.position >= position) {
  //         el.position++;
  //       }
  //     });
  //   }

  //   currentForm.value.elements.push(newElement);
  //   currentForm.value.updatedAt = new Date();
  //   saveForms(forms.value);
  //   return newElement;
  // };

  const updateElement = (elementId: string, updates: Partial<FormElement>) => {
    if (!currentForm.value) return;

    const elementIndex = currentForm.value.elements.findIndex(el => el.id === elementId);
    if (elementIndex !== -1) {
      currentForm.value.elements[elementIndex] = {
        ...currentForm.value.elements[elementIndex],
        ...updates
      };
      currentForm.value.updatedAt = new Date();
      saveForms(forms.value);
    }
  };

  const removeElement = (elementId: string) => {
    if (!currentForm.value) return;

    const element = currentForm.value.elements.find(el => el.id === elementId);
    if (!element) return;

    // Remove element and adjust positions
    currentForm.value.elements = currentForm.value.elements.filter(el => el.id !== elementId);
    currentForm.value.elements.forEach(el => {
      if (el.position > element.position) {
        el.position--;
      }
    });

    currentForm.value.updatedAt = new Date();
    saveForms(forms.value);
  };

  const moveElement = (elementId: string, newPosition: number) => {
    if (!currentForm.value) return;

    const element = currentForm.value.elements.find(el => el.id === elementId);
    if (!element) return;

    const oldPosition = element.position;

    // Adjust positions of other elements
    currentForm.value.elements.forEach(el => {
      if (el.id === elementId) {
        el.position = newPosition;
      } else if (oldPosition < newPosition && el.position > oldPosition && el.position <= newPosition) {
        el.position--;
      } else if (oldPosition > newPosition && el.position >= newPosition && el.position < oldPosition) {
        el.position++;
      }
    });

    currentForm.value.updatedAt = new Date();
    saveForms(forms.value);
  };

  const duplicateElement = (elementId: string) => {
    if (!currentForm.value) return;

    const element = currentForm.value.elements.find(el => el.id === elementId);
    if (!element) return;

    const duplicatedElement: FormElement = {
      ...element,
      id: `element-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      label: `${element.label} (Copy)`,
      position: element.position + 1
    };

    // Adjust positions of elements after the duplicated one
    currentForm.value.elements.forEach(el => {
      if (el.position > element.position) {
        el.position++;
      }
    });

    currentForm.value.elements.push(duplicatedElement);
    currentForm.value.updatedAt = new Date();
    saveForms(forms.value);
    return duplicatedElement;
  };

  const deleteForm = (formId: string) => {
    forms.value = forms.value.filter(form => form.id !== formId);
    if (currentForm.value?.id === formId) {
      currentForm.value = null;
    }
    saveForms(forms.value);
  };

  const exportFormConfig = () => {
    if (!currentForm.value) return null;
    return JSON.stringify(currentForm.value, null, 2);
  };

  // not need 
  const generateFormHTML = () => {
    if (!currentForm.value) return '';

    const elements = currentFormElements.value.map(element => {
      switch (element.type) {
        case 'text':
        case 'email':
        case 'password':
        case 'number':
        case 'date':
          return `<div class="form-group">
            <label for="${element.id}">${element.label}${element.required ? ' *' : ''}</label>
            <input type="${element.type}" id="${element.id}" name="${element.id}" ${element.placeholder ? `placeholder="${element.placeholder}"` : ''} ${element.required ? 'required' : ''} />
          </div>`;

        case 'textarea':
          return `<div class="form-group">
            <label for="${element.id}">${element.label}${element.required ? ' *' : ''}</label>
            <textarea id="${element.id}" name="${element.id}" ${element.placeholder ? `placeholder="${element.placeholder}"` : ''} ${element.required ? 'required' : ''}></textarea>
          </div>`;

        case 'select':
        case 'multiselect':
          const multipleAttr = element.type === 'multiselect' ? 'multiple' : '';
          return `<div class="form-group">
            <label for="${element.id}">${element.label}${element.required ? ' *' : ''}</label>
            <select id="${element.id}" name="${element.id}" ${multipleAttr} ${element.required ? 'required' : ''}>
              ${element.options?.map(option => `<option value="${option}">${option}</option>`).join('') || ''}
            </select>
          </div>`;

        case 'radio':
          return `<div class="form-group">
            <fieldset>
              <legend>${element.label}${element.required ? ' *' : ''}</legend>
              ${element.options?.map((option, index) =>
            `<label><input type="radio" name="${element.id}" value="${option}" ${element.required && index === 0 ? 'required' : ''} /> ${option}</label>`
          ).join('') || ''}
            </fieldset>
          </div>`;

        case 'checkbox':
          return `<div class="form-group">
            <fieldset>
              <legend>${element.label}</legend>
              ${element.options?.map(option =>
            `<label><input type="checkbox" name="${element.id}[]" value="${option}" /> ${option}</label>`
          ).join('') || ''}
            </fieldset>
          </div>`;

        case 'image':
        case 'file':
          return `<div class="form-group">
            <label for="${element.id}">${element.label}${element.required ? ' *' : ''}</label>
            <input type="file" id="${element.id}" name="${element.id}" ${element.required ? 'required' : ''} accept="${element.type === 'image' ? 'image/*' : '*/*'}" />
          </div>`;

        default:
          return '';
      }
    }).join('\n');

    return `<form>
      <h2>${currentForm.value.title}</h2>
      <p>${currentForm.value.description}</p>
      ${elements}
      <button type="submit">Submit</button>
    </form>`;
  };


  // Add to the function
  const formHistory = ref<FormHistory>({
    actions: [],
    currentIndex: -1
  });

  const formSettings = ref<FormSettings>({
    autoSave: true,
    saveInterval: 2000,
    gridSnap: true,
    showGrid: false,
    theme: 'light'
  });

  // Add history tracking to all actions
  const addToHistory = (action: Omit<FormAction, 'timestamp'>) => {
    const historyAction: FormAction = {
      ...action,
      timestamp: new Date()
    };

    // Remove future actions if we're not at the end
    if (formHistory.value.currentIndex < formHistory.value.actions.length - 1) {
      formHistory.value.actions = formHistory.value.actions.slice(0, formHistory.value.currentIndex + 1);
    }

    formHistory.value.actions.push(historyAction);
    formHistory.value.currentIndex = formHistory.value.actions.length - 1;
  };

  // Modify existing functions to include history
  const addElement = (template: FormElementTemplate, position?: number) => {
    if (!currentForm.value) return;

    const newElement: FormElement = {
      id: `element-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: template.type,
      position: position ?? currentForm.value.elements.length,
      ...template.defaultProps
    } as FormElement;

    // Adjust positions
    if (position !== undefined) {
      currentForm.value.elements.forEach(el => {
        if (el.position >= position) {
          el.position++;
        }
      });
    }

    currentForm.value.elements.push(newElement);
    currentForm.value.updatedAt = new Date();

    addToHistory({
      type: 'add',
      elementId: newElement.id,
      data: { element: newElement, position }
    });

    saveForms(forms.value);
    return newElement;
  };

  // Add undo/redo functionality
  const undo = () => {
    if (formHistory.value.currentIndex >= 0) {
      const action = formHistory.value.actions[formHistory.value.currentIndex];
      console.log('Undo action:', action);
      // تنفيذ منطق التراجع هنا
      formHistory.value.currentIndex--;
    }
  };

  const redo = () => {
    if (formHistory.value.currentIndex < formHistory.value.actions.length - 1) {
      formHistory.value.currentIndex++;
      const action = formHistory.value.actions[formHistory.value.currentIndex];
      console.log('Redo action:', action);
      // تنفيذ منطق الإعادة هنا
    }
  };

  const canUndo = computed(() => formHistory.value.currentIndex >= 0);
  const canRedo = computed(() => formHistory.value.currentIndex < formHistory.value.actions.length - 1);

  return {
    // State
    forms: readonly(forms),
    currentForm: readonly(currentForm),
    currentFormElements,
    selectedElement,

    // Actions
    createNewForm,
    loadForm,
    updateFormConfig,
    addElement,
    updateElement,
    removeElement,
    moveElement,
    duplicateElement,
    deleteForm,
    exportFormConfig,
    generateFormHTML,
    // New History
    undo,
    redo,
    canUndo,
    canRedo,
    formHistory: readonly(formHistory),
    formSettings: readonly(formSettings)
  };
}

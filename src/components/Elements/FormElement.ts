import type { FormElementTemplate } from "@/types/form";

// Form element templates - Updated with new elements
export const formElementTemplates: FormElementTemplate[] = [
    // Filed Inputs
    {
        type: 'text',
        label: 'Text Input',
        icon: 'mdi-form-textbox',
        defaultProps: {
            label: 'Text Field',
            placeholder: 'Enter text...',
            required: false,
            width: 'full',
            newRow: false
        }
    },
    {
        type: 'textarea',
        label: 'Text Area',
        icon: 'mdi-text',
        defaultProps: {
            label: 'Message',
            placeholder: 'Enter your message...',
            required: false,
            width: 'full',
            newRow: false
        }
    },
    {
        type: 'number',
        label: 'Number Input',
        icon: 'mdi-numeric',
        defaultProps: {
            label: 'Number',
            placeholder: 'Enter number...',
            required: false,
            width: 'full',
            newRow: false,
        }
    },
    {
        type: 'email',
        label: 'Email Input',
        icon: 'mdi-email',
        defaultProps: {
            label: 'Email Address',
            placeholder: 'Enter email...',
            required: false,
            width: 'full',
            newRow: false
        }
    },
    // Date Inputs
    {
        type: 'date',
        label: 'Date Input',
        icon: 'mdi-calendar-edit',
        defaultProps: {
            label: 'Date',
            required: false,
            width: 'full',
            newRow: false
        }
    },
    {
        type: 'date_picker',
        label: 'Date Picker',
        icon: 'mdi-calendar-month',
        defaultProps: {
            label: 'Date',
            required: false,
            width: 'full',
            newRow: false
        }
    },
    // Select Inputs
    {
        type: 'select',
        label: 'Select Dropdown',
        icon: 'mdi-menu-down',
        defaultProps: {
            label: 'Select Option',
            required: false,
            width: 'full',
            newRow: false,
            options: ['Option 1', 'Option 2', 'Option 3']
        }
    },
    {
        type: 'multiselect',
        label: 'Multi Select',
        icon: 'mdi-menu-down',
        defaultProps: {
            label: 'Select Options',
            required: false,
            width: 'full',
            newRow: false,
            multiple: true,
            options: ['Option 1', 'Option 2', 'Option 3']
        }
    },
    {
        type: 'radio',
        label: 'Radio Button',
        icon: 'mdi-radiobox-marked',
        defaultProps: {
            label: 'Radio Options',
            required: false,
            width: 'full',
            newRow: false,
            options: ['Option 1', 'Option 2', 'Option 3']
        }
    },
    {
        type: 'checkbox',
        label: 'Checkbox',
        icon: 'mdi-checkbox-marked',
        defaultProps: {
            label: 'Checkbox Option',
            required: false,
            width: 'full',
            newRow: false,
            options: ['Option 1', 'Option 2']
        }
    },
    {
        type: 'image',
        label: 'Image Upload',
        icon: 'mdi-image',
        defaultProps: {
            label: 'Upload Image',
            required: false,
            width: 'full',
            newRow: false
        }
    },
    {
        type: 'file',
        label: 'File Upload',
        icon: 'mdi-file-upload',
        defaultProps: {
            label: 'Upload File',
            required: false,
            width: 'full',
            newRow: false
        }
    }
];

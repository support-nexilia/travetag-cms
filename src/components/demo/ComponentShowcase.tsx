import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DataCard } from '@/components/DataCard';
import { Modal, ConfirmModal } from '@/components/Modal';
import { StatusBadge } from '@/components/StatusBadge';
import { TextInput } from '@/components/form/TextInput';
import { TextAreaInput } from '@/components/form/TextAreaInput';
import { AutocompleteInput } from '@/components/form/AutocompleteInput';
import { DateInput } from '@/components/form/DateInput';
import { SelectInput } from '@/components/form/SelectInput';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

export default function ComponentShowcase() {
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [textValue, setTextValue] = useState('');
  const [textAreaValue, setTextAreaValue] = useState('');
  const [autocompleteValue, setAutocompleteValue] = useState('');
  const [dateValue, setDateValue] = useState('');
  const [selectValue, setSelectValue] = useState('');

  const mockOptions = [
    { id: '1', name: 'Travel' },
    { id: '2', name: 'Food' },
    { id: '3', name: 'Technology' },
    { id: '4', name: 'Lifestyle' },
  ];

  const statusOptions = [
    { value: 'published', label: 'Published' },
    { value: 'draft', label: 'Draft' },
    { value: 'planned', label: 'Planned' },
  ];

  return (
    <div className="space-y-8">
      {/* Buttons */}
      <DataCard title="Buttons" description="Button variants and sizes">
        <div className="flex flex-wrap gap-4">
          <Button>Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button size="sm">Small</Button>
          <Button size="lg">Large</Button>
        </div>
      </DataCard>

      {/* Status Badges */}
      <DataCard title="Status Badges" description="Content status indicators">
        <div className="flex flex-wrap gap-4">
          <StatusBadge status="published" />
          <StatusBadge status="draft" />
          <StatusBadge status="planned" />
          <StatusBadge status="deleted" />
          <StatusBadge status="revision" />
        </div>
      </DataCard>

      {/* Regular Badges */}
      <DataCard title="Badges" description="Generic badge variants">
        <div className="flex flex-wrap gap-4">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge variant="outline">Outline</Badge>
        </div>
      </DataCard>

      {/* Alerts */}
      <DataCard title="Alerts" description="Alert messages">
        <div className="space-y-4">
          <Alert>
            <AlertTitle>Info</AlertTitle>
            <AlertDescription>This is an informational alert message.</AlertDescription>
          </Alert>
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>This is an error alert message.</AlertDescription>
          </Alert>
        </div>
      </DataCard>

      {/* Form Inputs */}
      <DataCard title="Form Inputs" description="Input components for forms">
        <div className="space-y-4">
          <TextInput
            label="Text Input"
            name="text"
            value={textValue}
            onChange={(e) => setTextValue(e.target.value)}
            placeholder="Enter text..."
            required
          />
          
          <TextAreaInput
            label="Text Area"
            name="textarea"
            value={textAreaValue}
            onChange={(e) => setTextAreaValue(e.target.value)}
            placeholder="Enter description..."
            rows={3}
          />

          <AutocompleteInput
            label="Autocomplete (Category/Tag)"
            name="autocomplete"
            value={autocompleteValue}
            onChange={setAutocompleteValue}
            options={mockOptions}
            placeholder="Type to search..."
          />

          <DateInput
            label="Date & Time"
            name="date"
            value={dateValue}
            onChange={(e) => setDateValue(e.target.value)}
          />

          <SelectInput
            label="Select Status"
            name="status"
            value={selectValue}
            onChange={setSelectValue}
            options={statusOptions}
            placeholder="Select a status..."
          />
        </div>
      </DataCard>

      {/* Modals */}
      <DataCard title="Modals" description="Dialog and confirmation modals">
        <div className="flex gap-4">
          <Button onClick={() => setModalOpen(true)}>Open Modal</Button>
          <Button variant="destructive" onClick={() => setConfirmOpen(true)}>
            Open Confirm Modal
          </Button>
        </div>

        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Example Modal"
          description="This is a modal dialog example"
          footer={
            <>
              <Button variant="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setModalOpen(false)}>Save</Button>
            </>
          }
        >
          <p className="text-sm text-gray-600">
            This is the content area of the modal. You can put any content here.
          </p>
        </Modal>

        <ConfirmModal
          isOpen={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          onConfirm={() => {
            alert('Confirmed!');
            setConfirmOpen(false);
          }}
          title="Confirm Action"
          message="Are you sure you want to perform this action?"
          variant="destructive"
          confirmText="Delete"
        />
      </DataCard>

      {/* Cards */}
      <DataCard
        title="Data Card Example"
        description="Cards with header, content, and footer"
        footer={
          <div className="flex gap-2">
            <Button variant="outline">Cancel</Button>
            <Button>Save</Button>
          </div>
        }
      >
        <p className="text-sm text-gray-600">
          This is a card component with a header, description, content area, and footer.
        </p>
      </DataCard>
    </div>
  );
}

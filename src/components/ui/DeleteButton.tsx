import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { ConfirmModal } from '@/components/Modal';

interface DeleteButtonProps {
  id: string;
  entityType: 'category' | 'tag' | 'post' | 'adv';
  entityName: string;
}

export function DeleteButton({ id, entityType, entityName }: DeleteButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const entityLabels = {
    category: 'categoria',
    tag: 'tag',
    post: 'post',
    adv: 'advertising',
  };

  const entityPaths = {
    category: 'categories',
    tag: 'tags',
    post: 'posts',
    adv: 'advs',
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/admin/api/${entityPaths[entityType]}/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        window.location.reload();
      } else {
        alert(`Errore durante l'eliminazione ${entityLabels[entityType]}`);
      }
    } catch (error) {
      console.error(error);
      alert(`Errore durante l'eliminazione ${entityLabels[entityType]}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
        disabled={isDeleting}
      >
        <Trash2 className="w-4 h-4" />
        Elimina
      </button>

      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleDelete}
        title={`Elimina ${entityLabels[entityType]}`}
        message={`Sei sicuro di voler eliminare "${entityName}"? Questa azione non può essere annullata.`}
        confirmText="Elimina"
        cancelText="Annulla"
      />
    </>
  );
}

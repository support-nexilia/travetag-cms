import React, { useEffect, useState } from 'react';
import { Modal } from '@/components/Modal';
import { Spinner } from '@/components/ui/spinner';
import { Toast } from '@/components/ui/Toast';

interface FormFeedbackProps {
  isLoading: boolean;
  success: { show: boolean; message: string } | null;
  error: { show: boolean; message: string } | null;
}

export function FormFeedback({ isLoading: initialLoading, success: initialSuccess, error: initialError }: FormFeedbackProps) {
  const [isLoading, setIsLoading] = useState(initialLoading);
  const [success, setSuccess] = useState(initialSuccess);
  const [error, setError] = useState(initialError);

  useEffect(() => {
    const handleFeedback = (event: CustomEvent) => {
      const { isLoading, success, error } = event.detail;
      setIsLoading(isLoading);
      setSuccess(success);
      setError(error);
    };

    window.addEventListener('formFeedback' as any, handleFeedback as any);
    
    return () => {
      window.removeEventListener('formFeedback' as any, handleFeedback as any);
    };
  }, []);

  return (
    <>
      {/* Loading Modal */}
      {isLoading && (
        <Modal
          isOpen={isLoading}
          onClose={() => {}}
          title="Salvataggio in corso..."
          size="sm"
        >
          <div className="flex flex-col items-center justify-center py-6">
            <Spinner size="lg" />
            <p className="mt-4 text-gray-600">Attendere prego...</p>
          </div>
        </Modal>
      )}

      {/* Success Toast */}
      {success?.show && (
        <Toast
          message={success.message}
          type="success"
          onClose={() => setSuccess(null)}
          duration={4000}
        />
      )}

      {/* Error Toast */}
      {error?.show && (
        <Toast
          message={error.message}
          type="error"
          onClose={() => setError(null)}
          duration={5000}
        />
      )}
    </>
  );
}

export default FormFeedback;

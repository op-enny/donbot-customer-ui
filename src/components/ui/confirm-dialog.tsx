'use client';

import * as React from 'react';
import { createContext, useContext, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
}

interface ConfirmDialogContextType {
  confirm: (options: ConfirmDialogOptions) => Promise<boolean>;
}

const ConfirmDialogContext = createContext<ConfirmDialogContextType | null>(null);

export function useConfirmDialog() {
  const context = useContext(ConfirmDialogContext);
  if (!context) {
    throw new Error('useConfirmDialog must be used within a ConfirmDialogProvider');
  }
  return context;
}

interface ConfirmDialogProviderProps {
  children: React.ReactNode;
}

export function ConfirmDialogProvider({ children }: ConfirmDialogProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmDialogOptions | null>(null);
  const [resolvePromise, setResolvePromise] = useState<((value: boolean) => void) | null>(null);

  const confirm = useCallback((opts: ConfirmDialogOptions): Promise<boolean> => {
    setOptions(opts);
    setIsOpen(true);
    return new Promise<boolean>((resolve) => {
      setResolvePromise(() => resolve);
    });
  }, []);

  const handleConfirm = useCallback(() => {
    setIsOpen(false);
    resolvePromise?.(true);
    setResolvePromise(null);
    setOptions(null);
  }, [resolvePromise]);

  const handleCancel = useCallback(() => {
    setIsOpen(false);
    resolvePromise?.(false);
    setResolvePromise(null);
    setOptions(null);
  }, [resolvePromise]);

  // Handle escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleCancel();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleCancel]);

  return (
    <ConfirmDialogContext.Provider value={{ confirm }}>
      {children}
      {isOpen && options && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-dialog-title"
          aria-describedby="confirm-dialog-description"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleCancel}
            aria-hidden="true"
          />

          {/* Dialog */}
          <div
            className={cn(
              'relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4',
              'animate-in fade-in-0 zoom-in-95 duration-200'
            )}
          >
            <div className="flex items-start gap-4">
              {options.variant === 'destructive' && (
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
              )}
              <div className="flex-1">
                <h2
                  id="confirm-dialog-title"
                  className="text-lg font-semibold text-gray-900 mb-2"
                >
                  {options.title}
                </h2>
                <p
                  id="confirm-dialog-description"
                  className="text-sm text-gray-600"
                >
                  {options.message}
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6 justify-end">
              <Button
                variant="outline"
                onClick={handleCancel}
                className="px-4 py-2"
              >
                {options.cancelText || 'Cancel'}
              </Button>
              <Button
                variant={options.variant === 'destructive' ? 'destructive' : 'default'}
                onClick={handleConfirm}
                className={cn(
                  'px-4 py-2',
                  options.variant !== 'destructive' && 'bg-[#D32F2F] hover:bg-red-700'
                )}
              >
                {options.confirmText || 'Confirm'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </ConfirmDialogContext.Provider>
  );
}

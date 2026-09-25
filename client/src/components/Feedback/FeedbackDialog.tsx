import React, { useState, useRef, useCallback } from 'react';
import {
  OGDialog,
  OGDialogTemplate,
  Button,
  Spinner,
  useToastContext,
} from '@librechat/client';
import { useSubmitUserFeedbackMutation } from '~/data-provider';
import { useLocalize } from '~/hooks';
import type { UserFeedbackType } from 'librechat-data-provider';

interface FeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function FeedbackDialog({ open, onOpenChange }: FeedbackDialogProps) {
  const localize = useLocalize();
  const { showToast } = useToastContext();

  const [type, setType] = useState<UserFeedbackType>('feedback');
  const [message, setMessage] = useState('');
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const { mutate: submitFeedback, isLoading } = useSubmitUserFeedbackMutation({
    onSuccess: () => {
      showToast({ message: localize('com_ui_feedback_success'), status: 'success' });
      onOpenChange(false);
      resetForm();
    },
    onError: () => {
      showToast({ message: localize('com_ui_feedback_error'), status: 'error' });
    },
  });

  const resetForm = () => {
    setType('feedback');
    setMessage('');
    setScreenshot(null);
    setScreenshotPreview(null);
  };

  const handleFileChange = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setScreenshot(file);
    const reader = new FileReader();
    reader.onload = (e) => setScreenshotPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      handleFileChange(e.target.files[0]);
    }
  };

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLDivElement>) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of Array.from(items)) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) handleFileChange(file);
          break;
        }
      }
    },
    [],
  );

  const handleRemoveScreenshot = () => {
    setScreenshot(null);
    setScreenshotPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = () => {
    if (!message.trim()) {
      showToast({ message: localize('com_ui_field_required'), status: 'error' });
      return;
    }
    submitFeedback({
      type,
      message: message.trim(),
      screenshot: screenshot ?? undefined,
      pageUrl: window.location.href,
    });
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isLoading) {
      onOpenChange(isOpen);
      if (!isOpen) resetForm();
    }
  };

  const typeButton = (value: UserFeedbackType, label: string) => (
    <button
      type="button"
      onClick={() => setType(value)}
      className={`flex-1 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none ${
        type === value
          ? 'border-blue-500 bg-blue-500 text-white dark:border-blue-400 dark:bg-blue-600'
          : 'border-gray-300 bg-transparent text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
      }`}
    >
      {label}
    </button>
  );

  return (
    <OGDialog open={open} onOpenChange={handleOpenChange}>
      <OGDialogTemplate
        title={localize('com_ui_feedback_title')}
        className="w-11/12 max-w-md"
        main={
          <div
            ref={dialogRef}
            onPaste={handlePaste}
            className="flex flex-col gap-4"
          >
            {/* Type selector */}
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {localize('com_ui_feedback_type_label')}
              </span>
              <div className="flex gap-2">
                {typeButton('feedback', localize('com_ui_feedback_feedback'))}
                {typeButton('bug', localize('com_ui_feedback_bug'))}
              </div>
            </div>

            {/* Message */}
            <div className="flex flex-col gap-1.5">
              <textarea
                className="min-h-[100px] w-full resize-y rounded-lg border border-gray-300 bg-transparent p-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:text-white dark:placeholder-gray-500 dark:focus:border-blue-400"
                placeholder={localize('com_ui_feedback_message_placeholder')}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={isLoading}
              />
            </div>

            {/* Screenshot */}
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {localize('com_ui_feedback_screenshot')}
              </span>
              {screenshotPreview ? (
                <div className="relative w-full overflow-hidden rounded-lg border border-gray-300 dark:border-gray-600">
                  <img
                    src={screenshotPreview}
                    alt="Screenshot preview"
                    className="max-h-40 w-full object-contain"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveScreenshot}
                    aria-label={localize('com_ui_feedback_remove_screenshot')}
                    className="absolute right-1 top-1 rounded-full bg-gray-800/70 p-1 text-white hover:bg-gray-900/90"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-3.5">
                      <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                    </svg>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 bg-transparent p-3 text-sm text-gray-500 transition-colors hover:border-blue-400 hover:text-blue-500 dark:border-gray-600 dark:text-gray-400 dark:hover:border-blue-400 dark:hover:text-blue-400"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-4">
                    <path fillRule="evenodd" d="M1 5.25A2.25 2.25 0 013.25 3h13.5A2.25 2.25 0 0119 5.25v9.5A2.25 2.25 0 0116.75 17H3.25A2.25 2.25 0 011 14.75v-9.5zm1.5 5.81v3.69c0 .414.336.75.75.75h13.5a.75.75 0 00.75-.75v-2.69l-2.22-2.219a.75.75 0 00-1.06 0l-1.91 1.909.47.47a.75.75 0 11-1.06 1.06L6.53 9.091a.75.75 0 00-1.06 0l-2.97 2.97zM12 7a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd" />
                  </svg>
                  {localize('com_ui_feedback_screenshot_hint')}
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleInputChange}
              />
            </div>
          </div>
        }
        buttons={
          <Button
            variant="submit"
            onClick={handleSubmit}
            disabled={isLoading || !message.trim()}
            className="text-white"
          >
            {isLoading ? <Spinner className="size-4" /> : localize('com_ui_submit')}
          </Button>
        }
      />
    </OGDialog>
  );
}

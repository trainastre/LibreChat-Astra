import { useState } from 'react';
import FeedbackDialog from './FeedbackDialog';
import { useLocalize } from '~/hooks';

export default function FeedbackButton() {
  const [open, setOpen] = useState(false);
  const localize = useLocalize();

  return (
    <>
      <button
        type="button"
        aria-label={localize('com_ui_feedback_title')}
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-50 flex size-12 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition-all hover:scale-110 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-500 dark:hover:bg-blue-600"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="size-5"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M4.804 21.644A6.707 6.707 0 006 21.75a6.721 6.721 0 003.583-1.029c.774.182 1.584.279 2.417.279 5.322 0 9.75-3.97 9.75-9 0-5.03-4.428-9-9.75-9s-9.75 3.97-9.75 9c0 2.409 1.025 4.587 2.674 6.192.232.226.277.428.254.543a3.73 3.73 0 01-.814 1.686.75.75 0 00.44 1.223zM8.25 10.875a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25zM10.875 12a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zm4.875-1.125a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      <FeedbackDialog open={open} onOpenChange={setOpen} />
    </>
  );
}

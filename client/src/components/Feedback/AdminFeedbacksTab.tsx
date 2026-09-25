import React, { useState } from 'react';
import { OGDialog, OGDialogTemplate, Button, Spinner } from '@librechat/client';
import { useAdminFeedbacksQuery } from '~/data-provider';
import { useLocalize } from '~/hooks';
import type { AdminFeedbackItem } from 'librechat-data-provider';

const TYPE_COLORS: Record<string, string> = {
  bug: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  feedback: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
};

function FeedbackDetailDialog({
  item,
  open,
  onOpenChange,
}: {
  item: AdminFeedbackItem | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const localize = useLocalize();
  if (!item) return null;

  const screenshotUrl = item.screenshotData ?? null;

  return (
    <OGDialog open={open} onOpenChange={onOpenChange}>
      <OGDialogTemplate
        title={localize('com_nav_admin_feedback_detail')}
        className="w-11/12 max-w-2xl"
        main={
          <div className="flex flex-col gap-4 text-sm">
            <div className="flex items-center gap-3">
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide ${TYPE_COLORS[item.type ?? 'feedback'] ?? TYPE_COLORS.feedback}`}
              >
                {item.type}
              </span>
              <span className="text-text-tertiary">
                {item.createdAt ? new Date(item.createdAt).toLocaleString() : '—'}
              </span>
            </div>
            <div className="rounded-lg border border-border-light bg-surface-secondary p-3 text-text-primary whitespace-pre-wrap">
              {item.message}
            </div>
            {item.pageUrl && (
              <div className="truncate text-xs text-text-tertiary">
                <span className="font-medium text-text-secondary">URL: </span>
                {item.pageUrl}
              </div>
            )}
            {item.userId && (
              <div className="text-xs text-text-tertiary">
                <span className="font-medium text-text-secondary">
                  {localize('com_nav_admin_feedback_user')}:{' '}
                </span>
                {item.userId}
              </div>
            )}
            {screenshotUrl && (
              <div className="overflow-hidden rounded-lg border border-border-light">
                <img
                  src={screenshotUrl}
                  alt={localize('com_ui_feedback_screenshot')}
                  className="max-h-96 w-full object-contain"
                />
              </div>
            )}
          </div>
        }
        buttons={<></>}
      />
    </OGDialog>
  );
}

function FeedbackTable({
  items,
  onSelect,
}: {
  items: AdminFeedbackItem[];
  onSelect: (item: AdminFeedbackItem) => void;
}) {
  const localize = useLocalize();

  if (items.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-text-tertiary">
        {localize('com_nav_admin_feedback_empty')}
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border-light">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border-light bg-surface-secondary text-left text-xs font-semibold uppercase tracking-wide text-text-secondary">
            <th className="px-4 py-2.5">{localize('com_nav_admin_feedback_col_type')}</th>
            <th className="px-4 py-2.5">{localize('com_nav_admin_feedback_col_message')}</th>
            <th className="hidden px-4 py-2.5 md:table-cell">
              {localize('com_nav_admin_feedback_col_date')}
            </th>
            <th className="px-2 py-2.5 text-center">
              {localize('com_nav_admin_feedback_col_screenshot')}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border-light">
          {items.map((item) => (
            <tr
              key={item._id}
              onClick={() => onSelect(item)}
              className="cursor-pointer transition-colors hover:bg-surface-hover"
            >
              <td className="px-4 py-3">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold uppercase ${TYPE_COLORS[item.type ?? 'feedback'] ?? TYPE_COLORS.feedback}`}
                >
                  {item.type}
                </span>
              </td>
              <td className="max-w-xs px-4 py-3">
                <p className="truncate text-text-primary">{item.message}</p>
              </td>
              <td className="hidden px-4 py-3 text-text-tertiary md:table-cell">
                {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '—'}
              </td>
              <td className="px-2 py-3 text-center">
                {item.screenshotData ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="mx-auto size-4 text-blue-500"
                  >
                    <path
                      fillRule="evenodd"
                      d="M1 5.25A2.25 2.25 0 013.25 3h13.5A2.25 2.25 0 0119 5.25v9.5A2.25 2.25 0 0116.75 17H3.25A2.25 2.25 0 011 14.75v-9.5zm1.5 5.81v3.69c0 .414.336.75.75.75h13.5a.75.75 0 00.75-.75v-2.69l-2.22-2.219a.75.75 0 00-1.06 0l-1.91 1.909.47.47a.75.75 0 11-1.06 1.06L6.53 9.091a.75.75 0 00-1.06 0l-2.97 2.97zM12 7a1 1 0 11-2 0 1 1 0 012 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <span className="text-text-tertiary">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FullscreenFeedbackDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const localize = useLocalize();
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<AdminFeedbackItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const { data, isLoading } = useAdminFeedbacksQuery({ page, limit: 30 }, { enabled: open });

  const handleSelect = (item: AdminFeedbackItem) => {
    setSelected(item);
    setDetailOpen(true);
  };

  return (
    <>
      <OGDialog open={open} onOpenChange={onOpenChange}>
        <OGDialogTemplate
          title={localize('com_nav_setting_admin_feedback')}
          className="w-[95vw] max-w-5xl"
          main={
            <div className="flex flex-col gap-4">
              {isLoading ? (
                <div className="flex justify-center py-10">
                  <Spinner className="size-6" />
                </div>
              ) : (
                <>
                  <FeedbackTable items={data?.feedbacks ?? []} onSelect={handleSelect} />
                  {(data?.totalPages ?? 0) > 1 && (
                    <div className="flex items-center justify-between text-sm text-text-secondary">
                      <span>
                        {localize('com_nav_admin_feedback_page', {
                          page: String(data?.page ?? page),
                          total: String(data?.totalPages ?? 1),
                        })}
                      </span>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setPage((p) => Math.max(1, p - 1))}
                          disabled={page <= 1}
                          className="px-3 py-1 text-xs"
                        >
                          {localize('com_nav_admin_feedback_prev')}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setPage((p) => p + 1)}
                          disabled={page >= (data?.totalPages ?? 1)}
                          className="px-3 py-1 text-xs"
                        >
                          {localize('com_nav_admin_feedback_next')}
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          }
          buttons={<></>}
        />
      </OGDialog>
      <FeedbackDetailDialog
        item={selected}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </>
  );
}

export default function AdminFeedbacksTab() {
  const localize = useLocalize();
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<AdminFeedbackItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [fullscreenOpen, setFullscreenOpen] = useState(false);

  const { data, isLoading } = useAdminFeedbacksQuery({ page, limit: 10 });

  const handleSelect = (item: AdminFeedbackItem) => {
    setSelected(item);
    setDetailOpen(true);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-text-tertiary">
          {data ? `${data.total} ${localize('com_nav_admin_feedback_total')}` : ''}
        </p>
        <Button
          variant="outline"
          onClick={() => setFullscreenOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="size-3.5"
          >
            <path
              fillRule="evenodd"
              d="M3 4.25A2.25 2.25 0 015.25 2h5.5a.75.75 0 010 1.5h-5.5a.75.75 0 00-.75.75v11.5c0 .414.336.75.75.75h11.5a.75.75 0 00.75-.75v-5.5a.75.75 0 011.5 0v5.5A2.25 2.25 0 0116.75 18H5.25A2.25 2.25 0 013 15.75V4.25z"
              clipRule="evenodd"
            />
            <path
              fillRule="evenodd"
              d="M6.194 12.753a.75.75 0 001.06.053L16.5 4.44v2.81a.75.75 0 001.5 0v-4.5a.75.75 0 00-.75-.75h-4.5a.75.75 0 000 1.5h2.553l-9.056 8.194a.75.75 0 00-.053 1.06z"
              clipRule="evenodd"
            />
          </svg>
          {localize('com_nav_admin_feedback_expand')}
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-6">
          <Spinner className="size-5" />
        </div>
      ) : (
        <>
          <FeedbackTable items={data?.feedbacks ?? []} onSelect={handleSelect} />
          {(data?.totalPages ?? 0) > 1 && (
            <div className="flex items-center justify-between text-sm text-text-secondary">
              <span>
                {localize('com_nav_admin_feedback_page', {
                  page: String(data?.page ?? page),
                  total: String(data?.totalPages ?? 1),
                })}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-3 py-1 text-xs"
                >
                  {localize('com_nav_admin_feedback_prev')}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= (data?.totalPages ?? 1)}
                  className="px-3 py-1 text-xs"
                >
                  {localize('com_nav_admin_feedback_next')}
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <FeedbackDetailDialog item={selected} open={detailOpen} onOpenChange={setDetailOpen} />
      <FullscreenFeedbackDialog open={fullscreenOpen} onOpenChange={setFullscreenOpen} />
    </div>
  );
}

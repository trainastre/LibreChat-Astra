import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useRecoilState } from 'recoil';
import { showTutorialAtom } from '~/store';
import { useLocalize, TranslationKeys } from '~/hooks';
import { cn } from '~/utils';

const TUTORIAL_STORAGE_KEY = 'librechat-tutorial-seen';
const HIGHLIGHT_STYLE = '3px solid rgba(74,222,128,0.9)';

interface TutorialStep {
  titleKey: string;
  descriptionKey: string;
  selector?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const STEPS: TutorialStep[] = [
  { titleKey: 'com_tutorial_welcome_title', descriptionKey: 'com_tutorial_welcome_desc' },
  {
    titleKey: 'com_tutorial_sidebar_title',
    descriptionKey: 'com_tutorial_sidebar_desc',
    selector: '[data-testid="nav-panel-conversations"]',
    position: 'right',
  },
  {
    titleKey: 'com_tutorial_new_chat_title',
    descriptionKey: 'com_tutorial_new_chat_desc',
    selector: '[data-testid="new-chat-button"]',
    position: 'right',
  },
  {
    titleKey: 'com_tutorial_agent_title',
    descriptionKey: 'com_tutorial_agent_desc',
    selector: '[data-testid="model-selector-button"]',
    position: 'bottom',
  },
  {
    titleKey: 'com_tutorial_mcp_title',
    descriptionKey: 'com_tutorial_mcp_desc',
    selector: '[data-testid="nav-panel-mcp-builder"]',
    position: 'right',
  },
  { titleKey: 'com_tutorial_done_title', descriptionKey: 'com_tutorial_done_desc' },
];

const CARD_W = 340;
const CARD_H = 220;
const SPOTLIGHT_PAD = 8;

interface SpotlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

function computeSpotlight(selector: string): SpotlightRect | null {
  const el = document.querySelector<HTMLElement>(selector);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  if (r.width === 0 && r.height === 0) return null;
  return {
    top: r.top - SPOTLIGHT_PAD,
    left: r.left - SPOTLIGHT_PAD,
    width: r.width + SPOTLIGHT_PAD * 2,
    height: r.height + SPOTLIGHT_PAD * 2,
  };
}

function computeTooltipStyle(
  spot: SpotlightRect,
  position: TutorialStep['position'],
): React.CSSProperties {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const gap = 16;
  let top = 0;
  let left = 0;
  if (position === 'right') {
    top = spot.top + spot.height / 2 - CARD_H / 2;
    left = spot.left + spot.width + gap;
  } else if (position === 'left') {
    top = spot.top + spot.height / 2 - CARD_H / 2;
    left = spot.left - CARD_W - gap;
  } else if (position === 'bottom') {
    top = spot.top + spot.height + gap;
    left = spot.left + spot.width / 2 - CARD_W / 2;
  } else {
    top = spot.top - CARD_H - gap;
    left = spot.left + spot.width / 2 - CARD_W / 2;
  }
  top = Math.max(16, Math.min(top, vh - CARD_H - 16));
  left = Math.max(16, Math.min(left, vw - CARD_W - 16));
  return { top, left, width: CARD_W };
}

/** Apply a green CSS outline directly on the DOM element — works regardless of z-index context. */
function applyHighlight(selector: string): () => void {
  const el = document.querySelector<HTMLElement>(selector);
  if (!el) return () => undefined;
  const prev = { outline: el.style.outline, outlineOffset: el.style.outlineOffset };
  el.style.outline = HIGHLIGHT_STYLE;
  el.style.outlineOffset = '3px';
  return () => {
    el.style.outline = prev.outline;
    el.style.outlineOffset = prev.outlineOffset;
  };
}

export default function Tutorial() {
  const localize = useLocalize();
  const [showTutorial, setShowTutorial] = useRecoilState(showTutorialAtom);
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);
  const [spotlightRect, setSpotlightRect] = useState<SpotlightRect | null>(null);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});

  const currentStep = STEPS[step];

  const updateSpotlight = useCallback(() => {
    setSpotlightRect(null);
    if (!currentStep?.selector) {
      setTooltipStyle({});
      return;
    }
    requestAnimationFrame(() => {
      const el = document.querySelector<HTMLElement>(currentStep.selector!);
      el?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      requestAnimationFrame(() => {
        const spot = computeSpotlight(currentStep.selector!);
        setSpotlightRect(spot);
        if (spot) setTooltipStyle(computeTooltipStyle(spot, currentStep.position));
      });
    });
  }, [currentStep]);

  // Directly highlight the target DOM element (bypasses any z-index / inert context)
  useEffect(() => {
    if (!visible || !currentStep?.selector) return;
    let cancelOuter: number;
    let cancelInner: number;
    let cleanup: (() => void) | undefined;
    cancelOuter = requestAnimationFrame(() => {
      cancelInner = requestAnimationFrame(() => {
        cleanup = applyHighlight(currentStep.selector!);
      });
    });
    return () => {
      cancelAnimationFrame(cancelOuter);
      cancelAnimationFrame(cancelInner);
      cleanup?.();
    };
  }, [visible, step, currentStep]);

  useEffect(() => {
    if (!visible) return;
    updateSpotlight();
    window.addEventListener('resize', updateSpotlight);
    return () => window.removeEventListener('resize', updateSpotlight);
  }, [visible, step, updateSpotlight]);

  useEffect(() => {
    const seen = localStorage.getItem(TUTORIAL_STORAGE_KEY);
    if (!seen) {
      const timer = setTimeout(() => { setVisible(true); setStep(0); }, 800);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (showTutorial) {
      setVisible(true);
      setStep(0);
      setShowTutorial(false);
    }
  }, [showTutorial, setShowTutorial]);

  const dismiss = useCallback(() => {
    localStorage.setItem(TUTORIAL_STORAGE_KEY, '1');
    setVisible(false);
  }, []);

  const next = useCallback(() => {
    if (step < STEPS.length - 1) setStep((s) => s + 1);
    else dismiss();
  }, [step, dismiss]);

  const prev = useCallback(() => {
    if (step > 0) setStep((s) => s - 1);
  }, [step]);

  if (!visible) return null;

  const isLast = step === STEPS.length - 1;
  const hasSpotlight = !!currentStep?.selector && spotlightRect !== null;
  const isCenter = !hasSpotlight;

  // Portal at document.body escapes Headless UI `inert` applied to the app root
  return createPortal(
    <>
      {hasSpotlight && spotlightRect ? (
        <>
          <div
            className="pointer-events-auto fixed inset-x-0 top-0 z-[9998] bg-black/70"
            style={{ height: Math.max(0, spotlightRect.top) }}
            onClick={dismiss}
          />
          <div
            className="pointer-events-auto fixed inset-x-0 bottom-0 z-[9998] bg-black/70"
            style={{ top: spotlightRect.top + spotlightRect.height }}
            onClick={dismiss}
          />
          <div
            className="pointer-events-auto fixed left-0 z-[9998] bg-black/70"
            style={{
              top: spotlightRect.top,
              width: Math.max(0, spotlightRect.left),
              height: spotlightRect.height,
            }}
            onClick={dismiss}
          />
          <div
            className="pointer-events-auto fixed right-0 z-[9998] bg-black/70"
            style={{
              top: spotlightRect.top,
              left: spotlightRect.left + spotlightRect.width,
              height: spotlightRect.height,
            }}
            onClick={dismiss}
          />
          <div
            className="pointer-events-none fixed z-[9999] rounded-lg ring-2 ring-green-400/80"
            style={{
              top: spotlightRect.top,
              left: spotlightRect.left,
              width: spotlightRect.width,
              height: spotlightRect.height,
            }}
          />
        </>
      ) : (
        <div className="pointer-events-auto fixed inset-0 z-[9998] bg-black/70" onClick={dismiss} />
      )}

      <div
        role="dialog"
        aria-modal="true"
        aria-label={localize('com_tutorial_aria_label')}
        className={cn(
          'fixed z-[10000] rounded-2xl border border-border-medium bg-surface-secondary shadow-2xl',
          isCenter && 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
        )}
        style={isCenter ? { width: CARD_W } : { ...tooltipStyle, position: 'fixed' }}
      >
        <div className="p-5">
          <div className="mb-4 flex items-center gap-1.5">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-200',
                  i === step ? 'w-5 bg-green-500' : i < step ? 'w-1.5 bg-green-400/60' : 'w-1.5 bg-border-heavy',
                )}
              />
            ))}
            <span className="ml-auto text-xs text-text-tertiary">{step + 1} / {STEPS.length}</span>
          </div>

          <h3 className="mb-2 text-sm font-semibold text-text-primary">
            {localize(currentStep.titleKey as TranslationKeys)}
          </h3>
          <p className="mb-5 text-sm leading-relaxed text-text-secondary">
            {localize(currentStep.descriptionKey as TranslationKeys)}
          </p>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={dismiss}
              className="text-xs text-text-tertiary hover:text-text-secondary focus:outline-none"
            >
              {localize('com_tutorial_skip')}
            </button>
            <div className="flex gap-2">
              {step > 0 && (
                <button
                  type="button"
                  onClick={prev}
                  className="rounded-lg border border-border-heavy px-3 py-1.5 text-xs text-text-primary hover:bg-surface-hover focus:outline-none"
                >
                  {localize('com_ui_prev')}
                </button>
              )}
              <button
                type="button"
                onClick={next}
                className="rounded-lg bg-green-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {isLast ? localize('com_tutorial_finish') : localize('com_ui_next')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
}

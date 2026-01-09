/**
 * Thinking Indicator Component
 * Claude-style animated thinking display
 */

import { setIcon } from 'obsidian';

export type ThinkingStage =
  | 'understanding'
  | 'context'
  | 'thinking'
  | 'generating'
  | 'complete';

const STAGE_LABELS: Record<ThinkingStage, string> = {
  understanding: 'Understanding your question',
  context: 'Reviewing context',
  thinking: 'Thinking',
  generating: 'Generating response',
  complete: 'Complete',
};

export class ThinkingIndicator {
  private containerEl: HTMLElement;
  private stageEl: HTMLElement | null = null;
  private iconEl: HTMLElement | null = null;
  private currentStage: ThinkingStage = 'understanding';
  private animationInterval: number | null = null;

  constructor(parentEl: HTMLElement) {
    this.containerEl = parentEl.createDiv({ cls: 'cotton-thinking-container' });
    this.render();
    this.startAnimation();
  }

  private render(): void {
    this.containerEl.empty();

    const indicatorEl = this.containerEl.createDiv({ cls: 'cotton-thinking-indicator' });

    // Animated icon
    this.iconEl = indicatorEl.createDiv({ cls: 'cotton-thinking-icon' });
    setIcon(this.iconEl, 'loader-2');

    // Stage label
    this.stageEl = indicatorEl.createDiv({ cls: 'cotton-thinking-label' });
    this.updateLabel();
  }

  private updateLabel(): void {
    if (this.stageEl) {
      this.stageEl.textContent = STAGE_LABELS[this.currentStage];
    }
  }

  private startAnimation(): void {
    // Cycle through stages automatically
    const stages: ThinkingStage[] = ['understanding', 'context', 'thinking', 'generating'];
    let stageIndex = 0;

    this.animationInterval = window.setInterval(() => {
      stageIndex = (stageIndex + 1) % stages.length;
      this.currentStage = stages[stageIndex];
      this.updateLabel();
    }, 2000);
  }

  setStage(stage: ThinkingStage): void {
    this.currentStage = stage;
    this.updateLabel();

    if (stage === 'complete') {
      this.stopAnimation();
      this.containerEl.addClass('cotton-thinking-complete');
    }
  }

  private stopAnimation(): void {
    if (this.animationInterval !== null) {
      window.clearInterval(this.animationInterval);
      this.animationInterval = null;
    }
  }

  remove(): void {
    this.stopAnimation();
    this.containerEl.remove();
  }

  getElement(): HTMLElement {
    return this.containerEl;
  }
}

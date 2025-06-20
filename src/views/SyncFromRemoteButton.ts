import { Extension, RangeSetBuilder, StateField } from '@codemirror/state';
import { Decoration, EditorView, WidgetType } from '@codemirror/view';
import { assert } from 'es-toolkit';
import { MarkdownView, Notice } from 'obsidian';
import { getTaskLineMeta, TaskLineMeta } from 'src/libs/regexp';
import TaskSyncPlugin from 'src/main';
import { FileRepository } from 'src/repositories/FileRepository';

// 위젯 캐시를 위한 클래스
class WidgetCache {
  private cache = new Map<string, SyncFromRemoteWidget>();

  get(key: string): SyncFromRemoteWidget | undefined {
    return this.cache.get(key);
  }

  set(key: string, widget: SyncFromRemoteWidget) {
    this.cache.set(key, widget);
  }

  clear() {
    this.cache.clear();
  }
}

class SyncFromRemoteWidget extends WidgetType {
  private static widgetCache = new WidgetCache();
  private static widgetIdCounter = 0;
  public readonly widgetId: string;
  private button: HTMLButtonElement | null = null;

  constructor(
    private meta: TaskLineMeta,
    private index: number,
    private plugin: TaskSyncPlugin,
    private fileRepo: FileRepository,
  ) {
    super();
    this.widgetId = `sync-widget-${SyncFromRemoteWidget.widgetIdCounter++}`;
  }

  static create(
    meta: TaskLineMeta,
    index: number,
    plugin: TaskSyncPlugin,
    fileRepo: FileRepository,
  ): SyncFromRemoteWidget {
    const cacheKey = `${meta.identifier}-${index}`;
    const cached = this.widgetCache.get(cacheKey);

    if (cached && cached.meta.identifier === meta.identifier && cached.index === index) {
      return cached;
    }

    const widget = new SyncFromRemoteWidget(meta, index, plugin, fileRepo);
    this.widgetCache.set(cacheKey, widget);
    return widget;
  }

  toDOM(): HTMLElement {
    if (this.button) {
      return this.button;
    }

    this.button = document.createElement('button');
    this.button.textContent = 'Sync from Remote';
    this.button.className = 'cm-sync-button';
    this.button.dataset.widgetId = this.widgetId;
    this.button.dataset.taskId = this.meta.identifier;
    this.button.dataset.lineIndex = this.index.toString();

    this.button.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('Button clicked directly!', this.meta.identifier);

      const markdownView = this.plugin.app.workspace.getActiveViewOfType(MarkdownView);
      assert(markdownView != null, 'Cannot find Markdown view');
      assert(markdownView.file != null, 'Cannot find Markdown file');

      try {
        const file = this.fileRepo.get(markdownView.file.path);
        assert(file != null, 'Cannot find file');

        const task = file.getTask(this.meta);
        assert(task != null, 'Cannot find task');

        task.remote.get(task.identifier).then((remoteTask) => {
          task.setTitle(remoteTask.title);
          task.setCompleted(remoteTask.completed);
          markdownView.editor.setLine(this.index, task.toMarkdown());
          new Notice(`Synced`);
        });
      } catch (e) {
        new Notice(`Error: ${e.message}`);
      }
    });

    return this.button;
  }

  eq(other: SyncFromRemoteWidget): boolean {
    if (!other) return false;
    return (
      this.widgetId === other.widgetId &&
      this.meta.identifier === other.meta.identifier &&
      this.index === other.index &&
      this.button === other.button // DOM 요소도 비교
    );
  }

  updateDOM(dom: HTMLElement): boolean {
    // DOM이 이미 존재하고 동일한 위젯의 것이라면 업데이트하지 않음
    return dom === this.button;
  }

  destroy(dom: HTMLElement) {
    // 버튼 참조 제거
    if (dom === this.button) {
      this.button = null;
    }
  }
}

export const createSyncFromRemoteExtension = (plugin: TaskSyncPlugin, fileRepo: FileRepository): Extension => {
  return [
    EditorView.theme(
      {
        '&': {
          '& .cm-sync-button': {
            cursor: 'pointer',
          },
        },
      },
      {
        dark: true,
      },
    ),
    StateField.define({
      create() {
        return Decoration.none;
      },
      update(_, tr) {
        const builder = new RangeSetBuilder<Decoration>();
        const lines = tr.state.doc.toString().split('\n');

        if (!plugin.getIsAuthorized()) {
          return builder.finish();
        }

        let pos = 0;
        for (const [index, line] of lines.entries()) {
          const meta = getTaskLineMeta(line);

          if (meta != null) {
            builder.add(
              pos + line.length,
              pos + line.length,
              Decoration.widget({
                widget: SyncFromRemoteWidget.create(meta, index, plugin, fileRepo),
                side: 1,
              }),
            );
          }
          pos += line.length + 1;
        }

        return builder.finish();
      },
      provide: (f) => EditorView.decorations.from(f),
    }),
  ];
};

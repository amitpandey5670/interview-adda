import { afterRenderEffect, Component, ElementRef, input, viewChild } from '@angular/core';
import hljs from 'highlight.js/lib/core';
import csharp from 'highlight.js/lib/languages/csharp';
import javascript from 'highlight.js/lib/languages/javascript';
import json from 'highlight.js/lib/languages/json';
import typescript from 'highlight.js/lib/languages/typescript';

hljs.registerLanguage('csharp', csharp);
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('json', json);

@Component({
  selector: 'app-code-block',
  templateUrl: './code-block.html',
  styleUrl: './code-block.scss',
})
export class CodeBlock {
  readonly language = input('csharp');
  readonly label = input('');
  readonly code = input('');
  readonly explanation = input('');
  private readonly codeEl = viewChild<ElementRef<HTMLElement>>('hljsCode');
  private lastHighlightKey = '';

  constructor() {
    afterRenderEffect(() => {
      this.highlight(this.code(), this.language());
    });
  }

  private highlight(code: string, language: string): void {
    const el = this.codeEl()?.nativeElement;
    if (!el) {
      return;
    }

    const key = `${language}\0${code}`;
    if (key === this.lastHighlightKey) {
      return;
    }
    this.lastHighlightKey = key;

    el.className = `language-${language}`;

    const registered = hljs.getLanguage(language);
    if (!registered) {
      el.textContent = code;
      return;
    }

    const { value } = hljs.highlight(code, { language });
    el.innerHTML = value;
  }
}

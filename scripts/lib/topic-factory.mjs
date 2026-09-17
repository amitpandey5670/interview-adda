/** Build schema-valid intermediate JS topic JSON from a config object. */
export function buildTopic(cfg) {
  return {
    id: cfg.id,
    slug: cfg.slug,
    title: cfg.title,
    moduleId: cfg.moduleId,
    order: cfg.order,
    hook: cfg.hook,
    sections: [
      {
        heading: 'What is this?',
        blocks: [
          { type: 'prose', text: cfg.whatIs },
          { type: 'glossary', title: 'Key terms', entries: cfg.glossary },
        ],
      },
      {
        heading: 'Why does it matter?',
        blocks: [
          { type: 'prose', text: cfg.whyMatters },
          {
            type: 'callout',
            variant: 'tip',
            title: cfg.trapTitle ?? 'Interview trap',
            body: cfg.trapBody,
          },
        ],
      },
      {
        heading: 'How it works step by step',
        blocks: [
          { type: 'steps', title: cfg.stepsTitle ?? 'Mental model', items: cfg.steps },
          {
            type: 'diagram',
            diagram: { type: 'mermaid', title: cfg.diagramTitle, source: cfg.diagramSource },
          },
        ],
      },
      {
        heading: 'Code walkthrough',
        blocks: cfg.snippets.map((s) => ({ type: 'snippet', snippet: s })),
      },
      {
        heading: 'Compare with C# and TypeScript',
        blocks: [{ type: 'comparisonTable', title: cfg.compareTitle, headers: cfg.compareHeaders, rows: cfg.compareRows }],
      },
      {
        heading: 'Common mistakes',
        blocks: [
          {
            type: 'callout',
            variant: 'warning',
            title: 'Pitfalls to avoid',
            body: cfg.commonMistakes,
          },
        ],
      },
      {
        heading: 'Senior interview depth',
        blocks: [
          { type: 'prose', text: cfg.seniorProse },
          {
            type: 'comparisonTable',
            title: 'Tradeoffs at senior level',
            headers: cfg.seniorHeaders ?? ['Approach', 'When it wins', 'When it fails'],
            rows: cfg.seniorRows,
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'What gets you rejected in interviews',
            body: cfg.seniorWarning,
          },
        ],
      },
    ],
    interviewTakeaways: cfg.interviewTakeaways,
    commonPitfalls: cfg.commonPitfalls,
    relatedTopicIds: cfg.relatedTopicIds,
    jsTsCorrelations: cfg.jsTsCorrelations,
    officialSources: cfg.officialSources ?? [
      { title: 'MDN JavaScript reference', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference' },
      { title: 'javascript.info', url: 'https://javascript.info/' },
    ],
    ...(cfg.animationHint ? { animationHint: cfg.animationHint } : {}),
    ...(cfg.scenarioTag ? { scenarioTag: cfg.scenarioTag } : {}),
  };
}

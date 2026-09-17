export function snippet(language, label, code, explanation) {
  return { language, label, code, explanation };
}

export function buildTopic(def, module, topicRef) {
  const siblings = module.topics.filter((t) => t.id !== topicRef.id).map((t) => t.id);
  const related = def.relatedTopicIds ?? siblings.slice(0, 3);
  const sections = [
    { heading: 'What is this?', blocks: [{ type: 'prose', text: def.whatIs }, { type: 'glossary', title: 'Key terms', entries: def.glossary }] },
    { heading: 'Why does it matter?', blocks: [{ type: 'prose', text: def.whyMatters }, { type: 'callout', variant: 'tip', title: def.tipTitle ?? 'Interview trap', body: def.tipBody }] },
    { heading: 'How it works step by step', blocks: [{ type: 'steps', title: def.stepsTitle ?? 'Mental model', items: def.steps }, { type: 'diagram', diagram: { type: 'mermaid', title: def.diagramTitle, source: def.diagram } }] },
    { heading: 'Code walkthrough', blocks: def.snippets.map((s) => ({ type: 'snippet', snippet: s })) },
    { heading: 'Compare with JavaScript and C#', blocks: [{ type: 'comparisonTable', title: def.compareTitle ?? `${topicRef.title} across languages`, headers: def.compareHeaders ?? ['Aspect', 'TypeScript', 'JavaScript', 'C#'], rows: def.compareRows }] },
    { heading: 'Common mistakes', blocks: [{ type: 'callout', variant: 'warning', title: def.mistakesTitle ?? 'Pitfalls to avoid', body: def.mistakesBody }] },
    { heading: 'Senior interview depth', blocks: [{ type: 'prose', text: def.seniorProse }, { type: 'comparisonTable', title: 'Tradeoffs at senior level', headers: def.seniorHeaders ?? ['Approach', 'When it wins', 'When it fails'], rows: def.seniorRows }, { type: 'callout', variant: 'warning', title: 'What gets you rejected in interviews', body: def.seniorWarning }] },
  ];
  const topic = { id: topicRef.id, slug: topicRef.slug, title: topicRef.title, moduleId: module.id, order: topicRef.order, hook: def.hook, sections, interviewTakeaways: def.interviewTakeaways, commonPitfalls: def.commonPitfalls, relatedTopicIds: related, jsTsCorrelations: def.jsTsCorrelations, officialSources: def.officialSources };
  if (def.animationHint) topic.animationHint = def.animationHint;
  if (def.scenarioTag) topic.scenarioTag = def.scenarioTag;
  return topic;
}

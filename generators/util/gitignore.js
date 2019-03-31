exports.mergeGitignore = function mergeGitignore(original, updates) {
  const sections = [];
  const sectionRefs = {};
  let thisSection = { rules: [], order: sections.length };
  sections.push(thisSection);

  original.forEach((line) => {
    if (!line.trim()) return;
    if (line.startsWith('#')) {
      thisSection = {
        title: line.slice(1),
        rules: [],
        order: sections.length,
      };
      sections.push(thisSection);
    } else {
      thisSection.rules.push(line);
    }
    sectionRefs[line] = sections.length - 1;
  });

  let unsorted = sections.find((section) => !section.title);
  if (!unsorted) {
    unsorted = { rules: [], order: 0 };
    sections.push(unsorted);
  }

  thisSection = unsorted;
  updates.forEach((line) => {
    if (!line.trim()) return;

    if (line in sectionRefs) {
      thisSection = sections[sectionRefs[line]];
    }
    if (line.startsWith('#')) {
      if (!(line in sectionRefs)) {
        thisSection = {
          title: line.slice(1),
          rules: [],
          order: sections.length,
        };
        sections.push(thisSection);
      }
    } else if (!thisSection.rules.includes(line)) {
      thisSection.rules.push(line);
    }
  });

  return sections
    .sort((a, b) => a.order - b.order)
    .filter(({ rules }) => rules.length > 0)
    .map((section) => [
      ...(section.title ? [`#${section.title}`] : []),
      ...section.rules.sort(),
      '',
    ])
    .reduce((a, b) => [...a, ...b], []);
};

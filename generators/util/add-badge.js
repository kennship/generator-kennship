const remark = require('remark');
const definitions = require('mdast-util-definitions');
const visit = require('unist-util-visit');

const NEWLINE = {
  type: 'text',
  value: '\n',
};
function badgeTransform({
  /**
   * Short name of the badge; e.g. 'circle-ci'.
   *
   * Used for URL references.
   */
  name,

  /** Mouseover text */
  altText = name,

  /** URL for the badge image */
  imageUrl,

  /** Link target (optional but recommended) */
  href = null,

  /**
   * "Priority" from 0 - 100.
   *
   * Badges with priority 0 are placed at the end; badges with priority
   * 100 are placed at the beginning.
   */

  priority = 50,
}) {
  return () =>
    function transformer(tree) {
      const references = definitions(tree);

      let badgeExists = false;

      visit(tree, ['imageReference', 'image'], (node, index, parent) => {
        if (badgeExists) return;
        switch (node.type) {
          case 'imageReference': {
            const isDirectMatch = imageRefMatchesBadge(node);
            const isParentMatch = linkMatchesBadge(parent);
            if (isDirectMatch && isParentMatch) {
              node.alt = altText;
              badgeExists = true;
            }
            break;
          }
          case 'image': {
            const isDirectMatch = imageMatchesBadge(node);
            const isParentMatch = linkMatchesBadge(parent);
            if (isDirectMatch && isParentMatch) {
              node.alt = altText;
              badgeExists = true;
            }
            break;
          }
          default:
            break;
        }
      });

      if (badgeExists) return;

      let badgeBlock = tree.children.find(isBadgeBlock);
      if (!badgeBlock) {
        badgeBlock = {
          type: 'paragraph',
          children: [],
        };
        tree.children = [
          ...tree.children.slice(0, 2),
          badgeBlock,
          ...tree.children.slice(2),
        ];
      }

      const defs = tree.children.filter(({ type }) => type === 'definition');
      const sliceIndex =
        badgeBlock.children.length -
        Math.floor((priority * badgeBlock.children.length) / 100);
      let imageIdentifier = `${name}-image`;
      let urlIdentifier = `${name}-url`;

      let newBadge = {
        type: 'imageReference',
        identifier: imageIdentifier,
        label: imageIdentifier,
        referenceType: 'full',
        alt: altText,
      };
      if (
        !defs.some((def) => {
          if (def.identifier !== imageIdentifier) return false;
          def.url = imageUrl;
          return true;
        })
      ) {
        tree.children.push({
          type: 'definition',
          identifier: imageIdentifier,
          label: imageIdentifier,
          title: null,
          url: imageUrl,
        });
      }
      if (href) {
        newBadge = {
          type: 'linkReference',
          identifier: urlIdentifier,
          label: urlIdentifier,
          referenceType: 'full',
          children: [newBadge],
        };

        if (
          !defs.some((def) => {
            if (def.identifier !== urlIdentifier) return false;
            def.url = href;
            return true;
          })
        ) {
          tree.children.push({
            type: 'definition',
            identifier: urlIdentifier,
            label: urlIdentifier,
            title: null,
            url: href,
          });
        }
      }

      badgeBlock.children = [
        ...badgeBlock.children.slice(0, sliceIndex),
        newBadge,
        ...(sliceIndex < badgeBlock.length - 1 ? [] : [NEWLINE]),
        ...badgeBlock.children.slice(sliceIndex),
      ];

      function imageMatchesBadge(image) {
        return image.url === imageUrl;
      }

      function imageRefMatchesBadge(imageRef) {
        if (imageRef.identifier === `${name}-image`) return true;
        const resolved = references(imageRef.identifier);
        if (!resolved) return false;
        return imageMatchesBadge({
          ...imageRef,
          type: 'image',
          url: resolved.url,
        });
      }

      function linkMatchesBadge(link) {
        if (!href || !['link', 'linkReference'].includes(link.type))
          return false;
        let url = link.url;
        if (link.identifier) {
          if (link.identifier === `${name}-url`) return true;
          url = references(link.identifier);
          url = url && url.url;
        }
        return url === href;
      }

      function isBadgeBlock(node) {
        if (node.type !== 'paragraph') return false;
        for (let i = 0; i < node.children.length; i += 2) {
          const [maybeBadge, spacer] = node.children.slice(i);
          if (!maybeBadge) continue;
          if (!isBadge(maybeBadge)) return false;
          if (spacer) {
            if (isBadge(spacer)) {
              i -= 1;
              continue;
            }
            if (!(spacer.type === 'text' && /^\s*$/.test(spacer.value)))
              return false;
          }
        }

        return true;
      }
    };
}

function isBadge(node) {
  if (['link', 'linkReference'].includes(node.type)) {
    return isBadge(node.children[0]);
  }
  return ['image', 'imageReference'].includes(node.type);
}

module.exports = async function addBadge(fileContents, badgeOpts) {
  return new Promise((resolve, reject) => {
    remark()
      .use(badgeTransform(badgeOpts))
      .process(fileContents, (err, result) =>
        err ? reject(err) : resolve(String(result))
      );
  });
};

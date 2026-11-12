import { CanvasLayoutNode, CanvasConnectionLine, GenealogyPerson } from '../types';
import { 
  getPersonById, 
  getChildren, 
  getSiblings, 
  getDirectLineageAncestors, 
  getAllGenealogyPersons,
  ROOT_PATRIARCH_ID 
} from '../data/genealogyDatabase';
import { FAMILY_BRANCHES } from '../data/familyData';

export interface LayoutEngineOutput {
  nodes: CanvasLayoutNode[];
  connections: CanvasConnectionLine[];
  bounds: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    width: number;
    height: number;
  };
  focusedNodePosition?: { x: number; y: number };
}

const CARD_WIDTH = 250;
const CARD_HEIGHT = 100;
const SIBLING_GAP = 30;
const BRANCH_GAP = 80;
const VERTICAL_LEVEL_GAP = 200;

/**
 * Computes the required branch width recursively for any person sub-tree
 */
const computePersonBranchWidth = (
  personId: string,
  expandedDescendants: Set<string>
): number => {
  if (!expandedDescendants.has(personId)) {
    return CARD_WIDTH;
  }
  const children = getChildren(personId);
  if (children.length === 0) {
    return CARD_WIDTH;
  }
  let totalWidth = 0;
  children.forEach((child, idx) => {
    const childWidth = computePersonBranchWidth(child.id, expandedDescendants);
    totalWidth += childWidth;
    if (idx > 0) totalWidth += SIBLING_GAP;
  });
  return Math.max(CARD_WIDTH, totalWidth);
};

/**
 * Recursively positions collateral children vertically beneath a parent sibling
 * using straight orthogonal 90° lines and collision-free horizontal spans.
 */
const layoutChildrenUnderParent = (
  parentId: string,
  parentCenterX: number,
  parentY: number,
  expandedDescendants: Set<string>,
  nodePositionMap: Map<string, { x: number; y: number }>,
  nodes: CanvasLayoutNode[],
  connections: CanvasConnectionLine[],
  options: {
    focusedPersonId: string;
    selectedPersonId: string | null;
    directAncestorIds: Set<string>;
  }
) => {
  if (!expandedDescendants.has(parentId)) return;

  const children = getChildren(parentId).sort((a, b) => {
    const ordA = a.birthOrder ?? a.orderNumber ?? 999;
    const ordB = b.birthOrder ?? b.orderNumber ?? 999;
    return ordA - ordB;
  });

  if (children.length === 0) return;

  // Compute width for each child sub-tree
  const childWidths = children.map((c) => computePersonBranchWidth(c.id, expandedDescendants));
  const totalChildrenSpan =
    childWidths.reduce((sum, w) => sum + w, 0) + (children.length - 1) * SIBLING_GAP;

  let currentChildLeft = parentCenterX - totalChildrenSpan / 2;
  const childY = parentY + VERTICAL_LEVEL_GAP;

  children.forEach((child, idx) => {
    const branchWidth = childWidths[idx];
    const childCenterX = currentChildLeft + branchWidth / 2;
    const childCardX = childCenterX - CARD_WIDTH / 2;

    nodePositionMap.set(child.id, { x: childCardX, y: childY });

    const isDirect = options.directAncestorIds.has(child.id);
    const childChildren = getChildren(child.id);
    const childSiblings = getSiblings(child.id);
    const isPending = child.verificationStatus === 'pending_approval';

    nodes.push({
      id: child.id,
      person: child,
      x: childCardX,
      y: childY,
      width: CARD_WIDTH,
      height: CARD_HEIGHT,
      isFocused: child.id === options.focusedPersonId,
      isSelected: child.id === options.selectedPersonId,
      isInDirectLineage: isDirect,
      isSiblingCollateral: !isDirect,
      hasChildren: childChildren.length > 0,
      childrenCount: childChildren.length,
      childrenExpanded: expandedDescendants.has(child.id),
      hasSiblings: childSiblings.length > 0,
      siblingsCount: childSiblings.length,
      siblingsExpanded: false,
      hasParents: true,
      generationLevel: child.generationLevel,
      clickCycleState: 0,
      isPendingVerification: isPending
    });

    // 90° straight orthogonal connection from parent to child
    const startX = parentCenterX;
    const startY = parentY + CARD_HEIGHT;
    const endX = childCenterX;
    const endY = childY;
    const midY = (startY + endY) / 2;

    connections.push({
      id: `conn-parent-${parentId}-child-${child.id}`,
      fromId: parentId,
      toId: child.id,
      type: 'parent-child',
      startX,
      startY,
      endX,
      endY,
      midY,
      isDirectLineage: options.directAncestorIds.has(parentId) && isDirect,
      isPending
    });

    // Recursively layout if this child is also expanded
    if (expandedDescendants.has(child.id)) {
      layoutChildrenUnderParent(
        child.id,
        childCenterX,
        childY,
        expandedDescendants,
        nodePositionMap,
        nodes,
        connections,
        options
      );
    }

    currentChildLeft += branchWidth + SIBLING_GAP;
  });
};

export const computeDynamicTreeLayout = (
  focusedPersonId: string,
  expandedDescendants: Set<string>,
  expandedSiblings: Set<string>,
  viewMode: 'full_tree' | 'dynamic' | 'direct_lineage',
  selectedPersonId: string | null = null
): LayoutEngineOutput => {
  const allPersons = getAllGenealogyPersons();
  const focusedPerson = getPersonById(focusedPersonId) || getPersonById(ROOT_PATRIARCH_ID)!;
  const directAncestors = getDirectLineageAncestors(focusedPerson.id);
  const directAncestorIds = new Set(directAncestors.map((a) => a.id));

  const nodes: CanvasLayoutNode[] = [];
  const connections: CanvasConnectionLine[] = [];
  const nodePositionMap = new Map<string, { x: number; y: number }>();

  // =========================================================================
  // MODE 1: FULL FAMILY TREE (Default Starting View - All Levels 0-2)
  // =========================================================================
  if (viewMode === 'full_tree') {
    const patriarch = getPersonById(ROOT_PATRIARCH_ID);
    const level1Branches = FAMILY_BRANCHES.map((b) => getPersonById(b.id)).filter(Boolean) as GenealogyPerson[];

    // Calculate branch widths based on their Level 2 grandchildren
    const branchLayoutInfo: {
      branchPerson: GenealogyPerson;
      grandchildren: GenealogyPerson[];
      width: number;
      startX: number;
      centerX: number;
    }[] = [];

    let currentX = 100;

    level1Branches.forEach((branch) => {
      // Find grandchildren belonging to this branch (Level 2)
      const branchGrandchildren = allPersons
        .filter((p) => p.generationLevel === 2 && (p.fatherId === branch.id || p.motherId === branch.id || p.branchId === branch.id))
        .sort((a, b) => {
          const ordA = a.birthOrder ?? a.orderNumber ?? 999;
          const ordB = b.birthOrder ?? b.orderNumber ?? 999;
          return ordA - ordB;
        });

      const count = Math.max(branchGrandchildren.length, 1);
      const branchWidth = Math.max(CARD_WIDTH, count * CARD_WIDTH + (count - 1) * SIBLING_GAP);

      branchLayoutInfo.push({
        branchPerson: branch,
        grandchildren: branchGrandchildren,
        width: branchWidth,
        startX: currentX,
        centerX: currentX + branchWidth / 2
      });

      currentX += branchWidth + BRANCH_GAP;
    });

    const totalTreeWidth = currentX - BRANCH_GAP + 100;
    const patriarchCenterX = (branchLayoutInfo[0]?.centerX + branchLayoutInfo[branchLayoutInfo.length - 1]?.centerX) / 2 || totalTreeWidth / 2;

    // 1. Position Level 0 Patriarch
    if (patriarch) {
      const pX = patriarchCenterX - CARD_WIDTH / 2;
      const pY = 80;
      nodePositionMap.set(patriarch.id, { x: pX, y: pY });

      const children = getChildren(patriarch.id);

      nodes.push({
        id: patriarch.id,
        person: patriarch,
        x: pX,
        y: pY,
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        isFocused: patriarch.id === focusedPerson.id,
        isSelected: patriarch.id === selectedPersonId,
        isInDirectLineage: true,
        isSiblingCollateral: false,
        hasChildren: children.length > 0,
        childrenCount: children.length,
        childrenExpanded: true,
        hasSiblings: false,
        siblingsCount: 0,
        siblingsExpanded: false,
        hasParents: false,
        generationLevel: 0,
        clickCycleState: 1,
        isPendingVerification: false
      });
    }

    // 2. Position Level 1 Branches & Level 2 Grandchildren
    branchLayoutInfo.forEach((info) => {
      const branch = info.branchPerson;
      const bX = info.centerX - CARD_WIDTH / 2;
      const bY = 80 + VERTICAL_LEVEL_GAP;
      nodePositionMap.set(branch.id, { x: bX, y: bY });

      const children = info.grandchildren;
      const isSelected = branch.id === selectedPersonId;
      const isFocused = branch.id === focusedPerson.id;

      nodes.push({
        id: branch.id,
        person: branch,
        x: bX,
        y: bY,
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        isFocused,
        isSelected,
        isInDirectLineage: directAncestorIds.has(branch.id),
        isSiblingCollateral: false,
        hasChildren: children.length > 0,
        childrenCount: children.length,
        childrenExpanded: true,
        hasSiblings: true,
        siblingsCount: level1Branches.length - 1,
        siblingsExpanded: true,
        hasParents: true,
        generationLevel: 1,
        clickCycleState: 1,
        isPendingVerification: false
      });

      // Position each grandchild under this branch
      info.grandchildren.forEach((gc, idx) => {
        const gcX = info.startX + idx * (CARD_WIDTH + SIBLING_GAP);
        const gcY = 80 + 2 * VERTICAL_LEVEL_GAP;
        nodePositionMap.set(gc.id, { x: gcX, y: gcY });

        const gcChildren = getChildren(gc.id);
        const gcSiblings = info.grandchildren.filter((s) => s.id !== gc.id);
        const isGcSelected = gc.id === selectedPersonId;
        const isGcFocused = gc.id === focusedPerson.id;
        const isPending = gc.verificationStatus === 'pending_approval';

        nodes.push({
          id: gc.id,
          person: gc,
          x: gcX,
          y: gcY,
          width: CARD_WIDTH,
          height: CARD_HEIGHT,
          isFocused: isGcFocused,
          isSelected: isGcSelected,
          isInDirectLineage: directAncestorIds.has(gc.id),
          isSiblingCollateral: false,
          hasChildren: gcChildren.length > 0,
          childrenCount: gcChildren.length,
          childrenExpanded: expandedDescendants.has(gc.id),
          hasSiblings: gcSiblings.length > 0,
          siblingsCount: gcSiblings.length,
          siblingsExpanded: true,
          hasParents: true,
          generationLevel: 2,
          clickCycleState: 0,
          isPendingVerification: isPending
        });

        // If grandchild has community-submitted children that are expanded
        if (expandedDescendants.has(gc.id) && gcChildren.length > 0) {
          gcChildren.forEach((child, cIdx) => {
            const childX = gcX + (cIdx - (gcChildren.length - 1) / 2) * (CARD_WIDTH + SIBLING_GAP);
            const childY = gcY + VERTICAL_LEVEL_GAP;
            nodePositionMap.set(child.id, { x: childX, y: childY });

            nodes.push({
              id: child.id,
              person: child,
              x: childX,
              y: childY,
              width: CARD_WIDTH,
              height: CARD_HEIGHT,
              isFocused: child.id === focusedPerson.id,
              isSelected: child.id === selectedPersonId,
              isInDirectLineage: false,
              isSiblingCollateral: false,
              hasChildren: false,
              childrenCount: 0,
              childrenExpanded: false,
              hasSiblings: gcChildren.length > 1,
              siblingsCount: gcChildren.length - 1,
              siblingsExpanded: true,
              hasParents: true,
              generationLevel: child.generationLevel,
              clickCycleState: 0,
              isPendingVerification: child.verificationStatus === 'pending_approval'
            });
          });
        }
      });
    });

    // 3. Generate Straight Orthogonal Connection Lines (90° turns only)
    nodes.forEach((node) => {
      const parentId = node.person.fatherId || node.person.motherId;
      if (parentId && nodePositionMap.has(parentId)) {
        const parentPos = nodePositionMap.get(parentId)!;
        const startX = parentPos.x + CARD_WIDTH / 2;
        const startY = parentPos.y + CARD_HEIGHT;
        const endX = node.x + CARD_WIDTH / 2;
        const endY = node.y;
        const midY = (startY + endY) / 2;

        connections.push({
          id: `conn-parent-${parentId}-child-${node.id}`,
          fromId: parentId,
          toId: node.id,
          type: 'parent-child',
          startX,
          startY,
          endX,
          endY,
          midY,
          isDirectLineage: directAncestorIds.has(parentId) && directAncestorIds.has(node.id),
          isPending: node.isPendingVerification
        });
      }
    });

  } else {
    // =========================================================================
    // MODE 2: DIRECT LINEAGE & INTERACTIVE ANCESTRY EXPLORATION
    // =========================================================================
    // Central Anchor X coordinate: all direct lineage ancestors anchor here!
    const baseCenterX = 3500;

    const layoutOptions = {
      focusedPersonId: focusedPerson.id,
      selectedPersonId,
      directAncestorIds
    };

    // 1. Process each direct ancestor from top to bottom
    directAncestors.forEach((anc, i) => {
      const ancLevel = anc.generationLevel;
      const ancY = 80 + ancLevel * VERTICAL_LEVEL_GAP;
      const ancX = baseCenterX - CARD_WIDTH / 2;
      const ancCenterX = baseCenterX;

      nodePositionMap.set(anc.id, { x: ancX, y: ancY });

      const ancChildren = getChildren(anc.id);
      const isFocused = anc.id === focusedPerson.id;
      const isSelected = anc.id === selectedPersonId;
      const isPending = anc.verificationStatus === 'pending_approval';

      // SIBLING EXPLORATION FOR DIRECT ANCESTOR (Interaction 1)
      const allSiblings = getSiblings(anc.id).filter((s) => !directAncestorIds.has(s.id));
      const isSibExpanded = expandedSiblings.has(anc.id);

      if (isSibExpanded && allSiblings.length > 0) {
        // Sort siblings consistently by birth order
        const sortedSibs = [...allSiblings].sort((a, b) => {
          const ordA = a.birthOrder ?? a.orderNumber ?? 999;
          const ordB = b.birthOrder ?? b.orderNumber ?? 999;
          return ordA - ordB;
        });

        // Split into balanced left and right wings around central direct ancestor
        const half = Math.ceil(sortedSibs.length / 2);
        // Left wing: reverse so closest sibling to center is placed nearest
        const leftSibs = sortedSibs.slice(0, half).reverse();
        // Right wing: first sibling is placed nearest to center
        const rightSibs = sortedSibs.slice(half);

        // A. Layout Left Siblings (expanding outward to the left)
        let currentLeftEdge = baseCenterX - CARD_WIDTH / 2 - BRANCH_GAP;
        leftSibs.forEach((sib) => {
          const sibWidth = computePersonBranchWidth(sib.id, expandedDescendants);
          const sibCenterX = currentLeftEdge - sibWidth / 2;
          const sibX = sibCenterX - CARD_WIDTH / 2;
          const sibY = ancY; // same generation level!

          nodePositionMap.set(sib.id, { x: sibX, y: sibY });

          const sibChildren = getChildren(sib.id);
          const sibSiblings = getSiblings(sib.id);
          const isSibSelected = sib.id === selectedPersonId;
          const isSibDescExpanded = expandedDescendants.has(sib.id);
          const isSibPending = sib.verificationStatus === 'pending_approval';

          nodes.push({
            id: sib.id,
            person: sib,
            x: sibX,
            y: sibY,
            width: CARD_WIDTH,
            height: CARD_HEIGHT,
            isFocused: false,
            isSelected: isSibSelected,
            isInDirectLineage: false,
            isSiblingCollateral: true,
            hasChildren: sibChildren.length > 0,
            childrenCount: sibChildren.length,
            childrenExpanded: isSibDescExpanded,
            hasSiblings: sibSiblings.length > 0,
            siblingsCount: sibSiblings.length,
            siblingsExpanded: false,
            hasParents: Boolean(sib.fatherId || sib.motherId),
            generationLevel: sib.generationLevel,
            clickCycleState: isSibDescExpanded ? 1 : 0,
            isPendingVerification: isSibPending
          });

          // Orthogonal 90° connection from common parent down to sibling
          const parentId = sib.fatherId || sib.motherId;
          const parentPos = parentId ? nodePositionMap.get(parentId) : undefined;
          const pCenterX = parentPos ? parentPos.x + CARD_WIDTH / 2 : baseCenterX;
          const pBottomY = parentPos ? parentPos.y + CARD_HEIGHT : ancY - VERTICAL_LEVEL_GAP + CARD_HEIGHT;
          const midY = (pBottomY + sibY) / 2;

          connections.push({
            id: `conn-parent-${parentId || 'anc'}-child-${sib.id}`,
            fromId: parentId || anc.id,
            toId: sib.id,
            type: 'parent-child',
            startX: pCenterX,
            startY: pBottomY,
            endX: sibCenterX,
            endY: sibY,
            midY,
            isDirectLineage: false,
            isPending: isSibPending
          });

          // Layout sibling's collateral descendants if expanded (Interaction 2)
          if (isSibDescExpanded) {
            layoutChildrenUnderParent(
              sib.id,
              sibCenterX,
              sibY,
              expandedDescendants,
              nodePositionMap,
              nodes,
              connections,
              layoutOptions
            );
          }

          currentLeftEdge -= (sibWidth + BRANCH_GAP);
        });

        // B. Layout Right Siblings (expanding outward to the right)
        let currentRightEdge = baseCenterX + CARD_WIDTH / 2 + BRANCH_GAP;
        rightSibs.forEach((sib) => {
          const sibWidth = computePersonBranchWidth(sib.id, expandedDescendants);
          const sibCenterX = currentRightEdge + sibWidth / 2;
          const sibX = sibCenterX - CARD_WIDTH / 2;
          const sibY = ancY; // same generation level!

          nodePositionMap.set(sib.id, { x: sibX, y: sibY });

          const sibChildren = getChildren(sib.id);
          const sibSiblings = getSiblings(sib.id);
          const isSibSelected = sib.id === selectedPersonId;
          const isSibDescExpanded = expandedDescendants.has(sib.id);
          const isSibPending = sib.verificationStatus === 'pending_approval';

          nodes.push({
            id: sib.id,
            person: sib,
            x: sibX,
            y: sibY,
            width: CARD_WIDTH,
            height: CARD_HEIGHT,
            isFocused: false,
            isSelected: isSibSelected,
            isInDirectLineage: false,
            isSiblingCollateral: true,
            hasChildren: sibChildren.length > 0,
            childrenCount: sibChildren.length,
            childrenExpanded: isSibDescExpanded,
            hasSiblings: sibSiblings.length > 0,
            siblingsCount: sibSiblings.length,
            siblingsExpanded: false,
            hasParents: Boolean(sib.fatherId || sib.motherId),
            generationLevel: sib.generationLevel,
            clickCycleState: isSibDescExpanded ? 1 : 0,
            isPendingVerification: isSibPending
          });

          // Orthogonal 90° connection from common parent down to sibling
          const parentId = sib.fatherId || sib.motherId;
          const parentPos = parentId ? nodePositionMap.get(parentId) : undefined;
          const pCenterX = parentPos ? parentPos.x + CARD_WIDTH / 2 : baseCenterX;
          const pBottomY = parentPos ? parentPos.y + CARD_HEIGHT : ancY - VERTICAL_LEVEL_GAP + CARD_HEIGHT;
          const midY = (pBottomY + sibY) / 2;

          connections.push({
            id: `conn-parent-${parentId || 'anc'}-child-${sib.id}`,
            fromId: parentId || anc.id,
            toId: sib.id,
            type: 'parent-child',
            startX: pCenterX,
            startY: pBottomY,
            endX: sibCenterX,
            endY: sibY,
            midY,
            isDirectLineage: false,
            isPending: isSibPending
          });

          // Layout sibling's collateral descendants if expanded (Interaction 2)
          if (isSibDescExpanded) {
            layoutChildrenUnderParent(
              sib.id,
              sibCenterX,
              sibY,
              expandedDescendants,
              nodePositionMap,
              nodes,
              connections,
              layoutOptions
            );
          }

          currentRightEdge += (sibWidth + BRANCH_GAP);
        });
      }

      // Add the direct ancestor node
      const isDescExpanded = expandedDescendants.has(anc.id);
      let cycleState = 0;
      if (isSibExpanded && isDescExpanded) cycleState = 1;
      else if (isSibExpanded && !isDescExpanded) cycleState = 2;
      else if (!isSibExpanded && isDescExpanded) cycleState = 3;

      nodes.push({
        id: anc.id,
        person: anc,
        x: ancX,
        y: ancY,
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        isFocused,
        isSelected,
        isInDirectLineage: true,
        isSiblingCollateral: false,
        hasChildren: ancChildren.length > 0,
        childrenCount: ancChildren.length,
        childrenExpanded: isDescExpanded,
        hasSiblings: allSiblings.length > 0,
        siblingsCount: allSiblings.length,
        siblingsExpanded: isSibExpanded,
        hasParents: Boolean(anc.fatherId || anc.motherId),
        generationLevel: anc.generationLevel,
        clickCycleState: cycleState,
        isPendingVerification: isPending
      });

      // Direct lineage vertical connector between consecutive ancestors
      if (i < directAncestors.length - 1) {
        const nextAnc = directAncestors[i + 1];
        const nextY = 80 + nextAnc.generationLevel * VERTICAL_LEVEL_GAP;
        const startX = ancCenterX;
        const startY = ancY + CARD_HEIGHT;
        const endX = ancCenterX;
        const endY = nextY;
        const midY = (startY + endY) / 2;

        connections.push({
          id: `conn-direct-${anc.id}-${nextAnc.id}`,
          fromId: anc.id,
          toId: nextAnc.id,
          type: 'parent-child',
          startX,
          startY,
          endX,
          endY,
          midY,
          isDirectLineage: true,
          isPending: false
        });
      }

      // If this is the focused person and they expanded their descendants
      if (isFocused && isDescExpanded) {
        layoutChildrenUnderParent(
          anc.id,
          ancCenterX,
          ancY,
          expandedDescendants,
          nodePositionMap,
          nodes,
          connections,
          layoutOptions
        );
      }
    });
  }

  // Calculate overall bounds
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  nodes.forEach((n) => {
    minX = Math.min(minX, n.x);
    maxX = Math.max(maxX, n.x + n.width);
    minY = Math.min(minY, n.y);
    maxY = Math.max(maxY, n.y + n.height);
  });

  if (nodes.length === 0) {
    minX = 0;
    maxX = 1400;
    minY = 0;
    maxY = 800;
  }

  const focusedPos = nodePositionMap.get(focusedPerson.id) || (nodes[0] ? { x: nodes[0].x, y: nodes[0].y } : undefined);

  return {
    nodes,
    connections,
    bounds: {
      minX,
      maxX,
      minY,
      maxY,
      width: Math.max(1600, maxX - minX + 600),
      height: Math.max(1000, maxY - minY + 400)
    },
    focusedNodePosition: focusedPos
      ? { x: focusedPos.x + CARD_WIDTH / 2, y: focusedPos.y + CARD_HEIGHT / 2 }
      : undefined
  };
};

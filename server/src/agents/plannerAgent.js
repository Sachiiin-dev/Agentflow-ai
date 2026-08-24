/**
 * Planner Agent
 * Decides topological execution ordering and emits planning confidence scores.
 */
class PlannerAgent {
  constructor() {
    this.name = 'planner';
  }

  /**
   * Plans the execution graph from nodes and edges
   */
  async plan(workflow) {
    const { nodes = [], edges = [] } = workflow;

    if (nodes.length === 0) {
      throw new Error('Workflow contains no nodes to execute.');
    }

    // Build adjacency list and in-degree map for topological sort (Kahn's algorithm)
    const inDegree = new Map();
    const adj = new Map();

    nodes.forEach((node) => {
      inDegree.set(node.id, 0);
      adj.set(node.id, []);
    });

    edges.forEach((edge) => {
      if (adj.has(edge.source) && inDegree.has(edge.target)) {
        adj.get(edge.source).push(edge.target);
        inDegree.set(edge.target, inDegree.get(edge.target) + 1);
      }
    });

    // Find all starting nodes (in-degree 0)
    const queue = [];
    inDegree.forEach((deg, nodeId) => {
      if (deg === 0) queue.push(nodeId);
    });

    const executionPlan = [];
    const visited = new Set();

    while (queue.length > 0) {
      const currentId = queue.shift();
      const node = nodes.find((n) => n.id === currentId);
      if (node) {
        executionPlan.push(node);
        visited.add(currentId);
      }

      const neighbors = adj.get(currentId) || [];
      for (const neighbor of neighbors) {
        inDegree.set(neighbor, inDegree.get(neighbor) - 1);
        if (inDegree.get(neighbor) === 0) {
          queue.push(neighbor);
        }
      }
    }

    // Check for cycles or unvisited nodes
    if (executionPlan.length < nodes.length) {
      // Add any remaining unlinked nodes
      nodes.forEach((node) => {
        if (!visited.has(node.id)) {
          executionPlan.push(node);
        }
      });
    }

    // Calculate confidence score based on node completeness and connectivity
    let confidenceScore = 0.95;
    const hasTrigger = nodes.some((n) => n.type === 'trigger' || n.data?.category === 'trigger');
    if (!hasTrigger) confidenceScore -= 0.15;
    if (edges.length === 0 && nodes.length > 1) confidenceScore -= 0.2;

    confidenceScore = Math.max(0.6, Math.min(0.99, confidenceScore));

    return {
      plannedOrder: executionPlan.map((n) => n.id),
      plannedNodes: executionPlan,
      totalSteps: executionPlan.length,
      confidenceScore: parseFloat(confidenceScore.toFixed(2)),
      reasoning: `Orchestrated ${executionPlan.length} steps in dependency order with confidence ${confidenceScore * 100}%.`,
    };
  }
}

module.exports = new PlannerAgent();

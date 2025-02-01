import Dagre from "@dagrejs/dagre";
import { useEffect } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  useReactFlow,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

const getLayoutedElements = (nodes: any, edges: any, options: any) => {
  const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: options.direction });

  edges.forEach((edge: any) => g.setEdge(edge.source, edge.target));
  nodes.forEach((node: any) =>
    g.setNode(node.id, {
      ...node,
      width: 150,
      height: 50,
    })
  );

  Dagre.layout(g);

  return {
    nodes: nodes.map((node: any) => {
      const position = g.node(node.id);
      // We are shifting the dagre node position (anchor=center center) to the top left
      // so it matches the React Flow node anchor point (top left).
      const x = position.x - (node.measured?.width ?? 0) / 2;
      const y = position.y - (node.measured?.height ?? 0) / 2;

      return { ...node, position: { x, y } };
    }),
    edges,
  };
};
var derivednodes: any = [];
var derivededges: any = [];
var toplevelnodes: any = [];

function recursiveNodeAdd(parentid: string, children: any) {
  children.forEach((child: any) => {
    derivednodes.push({
      id: child.id,
      data: { label: child.label },
      position: { x: 0, y: 0 },
    });
    derivededges.push({
      id: `${parentid}-${child.id}`,
      source: parentid,
      target: child.id,
      animated: true,
    });
    if (child.children) {
      recursiveNodeAdd(child.id, child.children);
    }
  });
}
interface Props {
  data: object;
}
function InnerFlow(data: any) {
  const { fitView } = useReactFlow();

  useEffect(() => {
    console.log("ok going to cruch", data);
    derivednodes = [];
    derivededges = [];
    toplevelnodes = [];

    derivednodes.push({
      id: data.data.id,
      type: "input",
      data: { label: data.data.label },
      position: { x: 0, y: 0 },
    });
    toplevelnodes.push(data.data.id);
    if (data.data.children) {
      recursiveNodeAdd(data.data.id, data.data.children);
    }

    console.log("derivednodes", derivednodes, derivededges);

    const initboi = getLayoutedElements(derivednodes, derivededges, {
      direction: "TB",
    });
    console.log("987987987987", initboi);

    setNodes(initboi.nodes);
    setEdges(initboi.edges);
    window.requestAnimationFrame(() => fitView());
  }, []);

  const [nodes, setNodes] = useNodesState([]);
  const [edges, setEdges] = useEdgesState([]);

  return (
    <>
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          flexDirection: "column",
        }}
      >
        <div style={{ flex: 1 }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={() => {
              window.requestAnimationFrame(() => fitView());
            }}
            fitView
          ></ReactFlow>
        </div>
        <div>
          {/* {toplevelnodes.map((item: any) => {
            return (
              <Button
                onClick={() => {
                  const selectedsubtree = data.data.items.find(
                    (x: any) => x.id === item
                  );
                  console.log(selectedsubtree);
                  derivednodes = [];
                  derivededges = [];
                  derivednodes.push({
                    id: selectedsubtree.id,
                    type: "input",
                    data: { label: selectedsubtree.label },
                    position: { x: 0, y: 0 },
                  });
                  if (selectedsubtree.children) {
                    recursiveNodeAdd(
                      selectedsubtree.id,
                      selectedsubtree.children
                    );
                  }
                  const initboi = getLayoutedElements(
                    derivednodes,
                    derivededges,
                    {
                      direction: "LR",
                    }
                  );

                  setNodes(initboi.nodes);
                  setEdges(initboi.edges);
                  window.requestAnimationFrame(() => {
                    fitView({ nodes: initboi.nodes });
                  });
                }}
              >
                {item}
              </Button>
            );
          })} */}
        </div>
      </div>
    </>
  );
}

const Flow = (props: Props) => {
  console.log("props", props);
  return (
    <ReactFlowProvider>
      <InnerFlow data={props.data} />
    </ReactFlowProvider>
  );
};

export default Flow;

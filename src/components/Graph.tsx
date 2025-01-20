// src/components/Graph.jsx
import React, { useEffect, useRef } from 'react';
import cytoscape from 'cytoscape';
import elementsData from '../data';

// 导入插件与工具提示相关库
import popper from 'cytoscape-popper';
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';

import cxtmenu from 'cytoscape-cxtmenu';

// 注册 Cytoscape 插件
cytoscape.use(popper);
cytoscape.use(cxtmenu);

const Graph = ({ 
  onSelectNode, 
  highlightNodeId,       
  filterRelationship,
  onGraphReady            
}) => {
  const cyRef = useRef(null);
  const cyInstanceRef = useRef(null);

  useEffect(() => {
    if (!cyRef.current) return;
    let cyInstance;
    try {
      cyInstance = cytoscape({
        container: cyRef.current,
        elements: elementsData,
        style: [
          {
            selector: 'node',
            style: {
              'background-color': ele => ele.data('gender') === '男' ? '#1976d2' : '#e91e63',
              label: 'data(id)',
              color: '#fff',
              'text-valign': 'center',
              'text-halign': 'center',
              'font-size': '10px',
              width: 30,
              height: 30,
              'text-outline-width': 2,
              'text-outline-color': '#000',
              'border-width': 0,
            },
          },
          {
            selector: 'edge',
            style: {
              width: 2,
              'line-color': '#ccc',
              'curve-style': 'bezier',
              opacity: 1,
            },
          },
          {
            selector: 'edge[relationship="CURRENT_PARTNER"]',
            style: { 'line-color': '#4caf50' }
          },
          {
            selector: 'edge[relationship="EX_PARTNER"]',
            style: { 'line-color': '#f44336' }
          },
          {
            selector: 'edge[relationship="AFFECTION"]',
            style: { 'line-color': '#ff9800', 'line-style': 'dashed' }
          },
          {
            selector: '.highlighted',
            style: {
              'line-color': '#FFD700',
              'target-arrow-color': '#FFD700',
              'transition-property': 'line-color, target-arrow-color',
              'transition-duration': '0.5s'
            }
          }
        ],
        layout: {
          name: 'cose',
          animate: true,
        },
      });
    } catch (error) {
      console.error('Error initializing Cytoscape:', error);
      return;
    }

    cyInstanceRef.current = cyInstance;

    if (onGraphReady) onGraphReady(cyInstance);

    cyInstance.on('tap', 'node', (evt) => {
      try {
        const node = evt.target;
        if (onSelectNode) {
          const connectedEdges = node.connectedEdges().map(e => e.data());
          const connectedNodes = node.connectedNodes().map(n => n.data());
          onSelectNode({
            ...node.data(),
            connectedEdges,
            connectedNodes,
          });
        }
      } catch (error) {
        console.error('Error handling node tap:', error);
      }
    });

    // 上下文菜单配置
    try {
      cyInstance.cxtmenu({
        selector: 'node',
        commands: [
          {
            content: '删除节点',
            select: (ele) => { ele.remove(); }
          },
          {
            content: '编辑节点',
            select: (ele) => {
              alert(`编辑节点: ${ele.data('id')}`);
            }
          },
        ]
      });
    } catch (error) {
      console.error('Error setting up context menu:', error);
    }

    // 为每个节点添加工具提示
    cyInstance.nodes().forEach(node => {
      let tipInstance = null;
      node.on('mouseover', () => {
        try {
          const ref = node.popperRef();
          if (!ref) return;
          const dummyDomEle = document.createElement('div');
          tipInstance = tippy(dummyDomEle, {
            content: `姓名: ${node.data('id')}<br/>性别: ${node.data('gender')}`,
            getReferenceClientRect: ref.getBoundingClientRect,
            trigger: 'manual',
            placement: 'top',
            arrow: true,
            interactive: true,
          });
          tipInstance.show();
        } catch (error) {
          console.error('Error creating tooltip:', error);
        }
      });
      node.on('mouseout', () => {
        if(tipInstance) {
          tipInstance.destroy();
          tipInstance = null;
        }
      });
    });

    return () => {
      try {
        cyInstance.destroy();
      } catch (error) {
        console.error('Error destroying Cytoscape instance:', error);
      }
    };
  }, [onSelectNode, onGraphReady]);

  useEffect(() => {
    try {
      const cy = cyInstanceRef.current;
      if (!cy) return;
      cy.nodes().style({ 'border-width': 0, 'border-color': null });
      if (highlightNodeId) {
        const nodeToHighlight = cy.$(`node[id="${highlightNodeId}"]`);
        if (nodeToHighlight.length) {
          nodeToHighlight.style({ 'border-width': 4, 'border-color': '#FFD700' });
          cy.animate({ fit: { eles: nodeToHighlight, padding: 50 } }, { duration: 500 });
        }
      }
    } catch (error) {
      console.error('Error in highlight effect:', error);
    }
  }, [highlightNodeId]);

  useEffect(() => {
    try {
      const cy = cyInstanceRef.current;
      if (!cy) return;
      const edges = cy.edges();
      if (filterRelationship) {
        edges.style('opacity', ele => ele.data('relationship') === filterRelationship ? 1 : 0.1);
      } else {
        edges.style('opacity', 1);
      }
    } catch (error) {
      console.error('Error in relationship filter effect:', error);
    }
  }, [filterRelationship]);

  return <div ref={cyRef} style={{ width: '100%', height: '100%' }} />;
};

export default Graph;

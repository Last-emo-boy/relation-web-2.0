// src/App.jsx
import React, { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import Graph from './components/Graph';
import {
  createTheme,
  ThemeProvider,
  CssBaseline,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Switch,
  Paper,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Box,
  Stack
} from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

import Graphology from 'graphology';
import betweennessCentrality from 'graphology-metrics/centrality/betweenness';

/* 控制面板组件 */
function ControlPanel({
  highlightNodeId,
  setHighlightNodeId,
  filterRelationship,
  setFilterRelationship,
  layoutName,
  setLayoutName,
  newNodeId,
  setNewNodeId,
  newNodeGender,
  setNewNodeGender,
  handleAddNode,
  sourceId,
  setSourceId,
  targetId,
  setTargetId,
  handleFindPath,
  handleExportPNG,
  handleExportJSON,
  computeBetweennessCentrality
}) {
  return (
    <div style={{ padding: '1rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
      <TextField
        label="高亮节点ID"
        variant="outlined"
        size="small"
        value={highlightNodeId}
        onChange={e => setHighlightNodeId(e.target.value)}
      />
      <FormControl variant="outlined" size="small" style={{ minWidth: 150 }}>
        <InputLabel>关系过滤</InputLabel>
        <Select
          label="关系过滤"
          value={filterRelationship}
          onChange={e => setFilterRelationship(e.target.value)}
        >
          <MenuItem value="">全部</MenuItem>
          <MenuItem value="CURRENT_PARTNER">CURRENT_PARTNER</MenuItem>
          <MenuItem value="EX_PARTNER">EX_PARTNER</MenuItem>
          <MenuItem value="AFFECTION">AFFECTION</MenuItem>
        </Select>
      </FormControl>
      <FormControl variant="outlined" size="small" style={{ minWidth: 150 }}>
        <InputLabel>布局切换</InputLabel>
        <Select
          label="布局切换"
          value={layoutName}
          onChange={e => setLayoutName(e.target.value)}
        >
          <MenuItem value="cose">Cose</MenuItem>
          <MenuItem value="circle">Circle</MenuItem>
          <MenuItem value="grid">Grid</MenuItem>
          <MenuItem value="breadthfirst">Breadthfirst</MenuItem>
        </Select>
      </FormControl>
      <TextField
        label="新节点ID"
        variant="outlined"
        size="small"
        value={newNodeId}
        onChange={e => setNewNodeId(e.target.value)}
      />
      <FormControl variant="outlined" size="small" style={{ minWidth: 100 }}>
        <InputLabel>性别</InputLabel>
        <Select
          label="性别"
          value={newNodeGender}
          onChange={e => setNewNodeGender(e.target.value)}
        >
          <MenuItem value="男">男</MenuItem>
          <MenuItem value="女">女</MenuItem>
        </Select>
      </FormControl>
      <Button variant="contained" color="primary" onClick={handleAddNode}>
        添加节点
      </Button>
      <TextField
        label="起点ID"
        variant="outlined"
        size="small"
        value={sourceId}
        onChange={e => setSourceId(e.target.value)}
      />
      <TextField
        label="终点ID"
        variant="outlined"
        size="small"
        value={targetId}
        onChange={e => setTargetId(e.target.value)}
      />
      <Button variant="contained" color="secondary" onClick={handleFindPath}>
        查找最短路径
      </Button>
      <Button variant="outlined" onClick={handleExportPNG}>
        导出PNG
      </Button>
      <Button variant="outlined" onClick={handleExportJSON}>
        导出JSON
      </Button>
      <Button variant="contained" onClick={computeBetweennessCentrality}>
        计算介数中心性
      </Button>
    </div>
  );
}

/* 详情面板组件 */
function DetailPanel({ selectedNode, selectedEdge, pathResult, onRemoveNode }) {
  return (
    <>
      {selectedNode ? (
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" gutterBottom>
              节点详情
            </Typography>
            <Typography variant="body1"><strong>ID:</strong> {selectedNode.id}</Typography>
            <Typography variant="body1"><strong>性别:</strong> {selectedNode.gender}</Typography>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1">相邻节点</Typography>
            {selectedNode.connectedNodes && selectedNode.connectedNodes.length > 0 ? (
              <List dense>
                {selectedNode.connectedNodes.map((n) => (
                  <ListItem key={n.id}>
                    <ListItemText primary={`${n.id} (${n.gender})`} />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2">无相邻节点</Typography>
            )}
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1">相关边</Typography>
            {selectedNode.connectedEdges && selectedNode.connectedEdges.length > 0 ? (
              <List dense>
                {selectedNode.connectedEdges.map((e) => (
                  <ListItem key={e.id}>
                    <ListItemText primary={`${e.source} → ${e.target} (${e.relationship})`} />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2">无相关边</Typography>
            )}
          </CardContent>
        </Card>
      ) : selectedEdge ? (
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" gutterBottom>
              边详情
            </Typography>
            <Typography variant="body1"><strong>源:</strong> {selectedEdge.source}</Typography>
            <Typography variant="body1"><strong>目标:</strong> {selectedEdge.target}</Typography>
            <Typography variant="body1"><strong>关系:</strong> {selectedEdge.relationship}</Typography>
          </CardContent>
        </Card>
      ) : (
        <Typography variant="body1">点击节点或边查看详情</Typography>
      )}
      {pathResult.length > 0 && (
        <>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle1">最短路径（元素ID列表）</Typography>
          <List dense>
            {pathResult.map(id => (
              <ListItem key={id}>
                <ListItemText primary={id} />
              </ListItem>
            ))}
          </List>
        </>
      )}
    </>
  );
}

/* 图例组件 */
function Legend() {
  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle1">图例</Typography>
      <List dense>
        <ListItem>
          <Box sx={{ width: 16, height: 16, bgcolor: '#1976d2', display:'inline-block', mr:1 }} />
          <ListItemText primary="男节点" />
        </ListItem>
        <ListItem>
          <Box sx={{ width: 16, height: 16, bgcolor: '#e91e63', display:'inline-block', mr:1 }} />
          <ListItemText primary="女节点" />
        </ListItem>
        <ListItem>
          <Box sx={{ width: 16, height: 4, bgcolor: '#4caf50', display:'inline-block', mr:1 }} />
          <ListItemText primary="CURRENT_PARTNER 边" />
        </ListItem>
        <ListItem>
          <Box sx={{ width: 16, height: 4, bgcolor: '#f44336', display:'inline-block', mr:1 }} />
          <ListItemText primary="EX_PARTNER 边" />
        </ListItem>
        <ListItem>
          <Box sx={{ width: 16, height: 4, bgcolor: '#ff9800', display:'inline-block', mr:1, border: '1px dashed' }} />
          <ListItemText primary="AFFECTION 边" />
        </ListItem>
        <ListItem>
          <Box sx={{ width: 16, height: 16, border: '2px solid #FFD700', display:'inline-block', mr:1 }} />
          <ListItemText primary="高亮节点边框" />
        </ListItem>
      </List>
    </Box>
  );
}

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedEdge, setSelectedEdge] = useState(null);
  const [highlightNodeId, setHighlightNodeId] = useState('');
  const [filterRelationship, setFilterRelationship] = useState('');
  const [newNodeId, setNewNodeId] = useState('');
  const [newNodeGender, setNewNodeGender] = useState('男');
  const [sourceId, setSourceId] = useState('');
  const [targetId, setTargetId] = useState('');
  const [pathResult, setPathResult] = useState([]);
  const [layoutName, setLayoutName] = useState('cose');

  const graphRef = useRef(null);

  const theme = useMemo(
    () =>
      createTheme({
        palette: { mode: darkMode ? 'dark' : 'light' },
        components: {
          MuiAppBar: { styleOverrides: { root: { borderRadius: 0 } } },
        },
      }),
    [darkMode]
  );

  const toggleDarkMode = () => setDarkMode(prev => !prev);

  const handleSelectNode = useCallback((nodeData) => {
    setSelectedNode(nodeData);
    setSelectedEdge(null);
  }, []);

  const handleSelectEdge = useCallback((edgeData) => {
    setSelectedEdge(edgeData);
    setSelectedNode(null);
  }, []);

  const handleGraphReady = useCallback((cy) => {
    graphRef.current = cy;
  }, []);

  const handleAddNode = () => {
    const cy = graphRef.current;
    if (!cy || !newNodeId) return;
    cy.add({ group: 'nodes', data: { id: newNodeId, gender: newNodeGender } });
    cy.layout({ name: layoutName, animate: true }).run();
  };

  const handleFindPath = () => {
    const cy = graphRef.current;
    if (!cy || !sourceId || !targetId) return;
    const dijkstra = cy.elements().dijkstra(`#${sourceId}`, edge => 1);
    const targetNode = cy.$(`#${targetId}`);
    if (targetNode.nonempty()) {
      const path = dijkstra.pathTo(targetNode);
      cy.elements().removeClass('highlighted');
      path.addClass('highlighted');
      setPathResult(path.map(ele => ele.id()));
    }
  };

  const handleExportPNG = () => {
    const cy = graphRef.current;
    if (cy) {
      const pngData = cy.png({ full: true, scale: 2 });
      const link = document.createElement('a');
      link.href = pngData;
      link.download = 'graph.png';
      link.click();
    }
  };

  const handleExportJSON = () => {
    const cy = graphRef.current;
    if (cy) {
      const jsonData = cy.json();
      const blob = new Blob([JSON.stringify(jsonData)], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'graph.json';
      link.click();
    }
  };

  const computeBetweennessCentrality = () => {
    const cy = graphRef.current;
    if (!cy) return;
    const graph = new Graphology();
    cy.nodes().forEach(node => {
      graph.addNode(node.id(), { gender: node.data('gender') });
    });
    cy.edges().forEach(edge => {
      const source = edge.data('source');
      const target = edge.data('target');
      if (!graph.hasEdge(source, target)) {
        graph.addUndirectedEdge(source, target);
      }
    });
    const centrality = betweennessCentrality(graph);
    alert('Betweenness Centrality: ' + JSON.stringify(centrality, null, 2));
  };

  const handleRemoveNode = useCallback((nodeId) => {
    const cy = graphRef.current;
    if(cy) {
      cy.remove(`node[id="${nodeId}"]`);
    }
  }, []);

  useEffect(() => {
    const cy = graphRef.current;
    if (!cy) return;
    cy.layout({ name: layoutName, animate: true }).run();
  }, [layoutName]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static" elevation={3}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            关系图可视化
          </Typography>
          <IconButton color="inherit" onClick={toggleDarkMode}>
            {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
          <Switch checked={darkMode} onChange={toggleDarkMode} />
        </Toolbar>
      </AppBar>
      <Box sx={{ display: 'flex', height: 'calc(100vh - 64px)' }}>
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <ControlPanel
            highlightNodeId={highlightNodeId}
            setHighlightNodeId={setHighlightNodeId}
            filterRelationship={filterRelationship}
            setFilterRelationship={setFilterRelationship}
            layoutName={layoutName}
            setLayoutName={setLayoutName}
            newNodeId={newNodeId}
            setNewNodeId={setNewNodeId}
            newNodeGender={newNodeGender}
            setNewNodeGender={setNewNodeGender}
            handleAddNode={handleAddNode}
            sourceId={sourceId}
            setSourceId={setSourceId}
            targetId={targetId}
            setTargetId={setTargetId}
            handleFindPath={handleFindPath}
            handleExportPNG={handleExportPNG}
            handleExportJSON={handleExportJSON}
            computeBetweennessCentrality={computeBetweennessCentrality}
          />
          <Box sx={{ flex: 1, m: 2 }}>
            <Graph
              onSelectNode={handleSelectNode}
              onSelectEdge={handleSelectEdge}
              highlightNodeId={highlightNodeId}
              filterRelationship={filterRelationship}
              onGraphReady={handleGraphReady}
            />
          </Box>
        </Box>
        <Paper 
          elevation={3} 
          sx={{
            width: 320, 
            m: 2,
            p: 2, 
            overflowY: 'auto',
            borderLeft: '1px solid',
            borderColor: 'divider'
          }}
        >
          <DetailPanel 
            selectedNode={selectedNode} 
            selectedEdge={selectedEdge}
            pathResult={pathResult} 
            onRemoveNode={handleRemoveNode}
          />
          <Legend />
        </Paper>
      </Box>
    </ThemeProvider>
  );
}

export default App;

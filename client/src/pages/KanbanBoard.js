import React from 'react';
import { useParams } from 'react-router-dom';
import KanbanBoardComponent from '../components/KanbanBoard';

const KanbanBoard = () => {
  const { projectId } = useParams();

  return <KanbanBoardComponent projectId={projectId} />;
};

export default KanbanBoard;

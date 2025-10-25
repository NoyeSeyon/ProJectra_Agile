import React, { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, MoreHorizontal, Calendar, User, Flag } from 'lucide-react';
import { useSocket } from '../contexts/SocketContext';
import axios from 'axios';

// Sortable Card Component
const SortableCard = ({ card, onEdit, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'border-purple-500 bg-purple-50';
      case 'high': return 'border-red-500 bg-red-50';
      case 'medium': return 'border-yellow-500 bg-yellow-50';
      case 'low': return 'border-green-500 bg-green-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'urgent': return '🔴';
      case 'high': return '🟠';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  };

  const isOverdue = card.dueDate && new Date(card.dueDate) < new Date() && card.status !== 'completed';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`kanban-card ${isDragging ? 'dragging' : ''} ${getPriorityColor(card.priority)}`}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-sm text-gray-900 line-clamp-2">
          {card.title}
        </h4>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(card);
          }}
          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded"
        >
          <MoreHorizontal size={14} />
        </button>
      </div>

      {card.description && (
        <p className="text-xs text-gray-600 mb-3 line-clamp-2">
          {card.description}
        </p>
      )}

      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1">
            <Flag size={12} />
            {getPriorityIcon(card.priority)}
          </span>
          {card.dueDate && (
            <span className={`flex items-center gap-1 ${isOverdue ? 'text-red-600' : ''}`}>
              <Calendar size={12} />
              {new Date(card.dueDate).toLocaleDateString()}
            </span>
          )}
        </div>
        {card.assignees && card.assignees.length > 0 && (
          <div className="flex items-center gap-1">
            <User size={12} />
            <span>{card.assignees.length}</span>
          </div>
        )}
      </div>

      {card.checklist && card.checklist.length > 0 && (
        <div className="mt-2">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
            <span>
              {card.checklist.filter(item => item.completed).length}/{card.checklist.length}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

// Sortable Column Component
const SortableColumn = ({ column, cards, onAddCard, onEditCard, onDeleteCard }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: column._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`kanban-column ${isDragging ? 'opacity-50' : ''}`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: column.color }}
          ></div>
          {column.title}
        </h3>
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
            {cards.length}
          </span>
          <button
            onClick={() => onAddCard(column)}
            className="p-1 hover:bg-gray-200 rounded opacity-0 group-hover:opacity-100 transition-opacity"
            title="Add card"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      <SortableContext items={cards.map(card => card._id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {cards.map(card => (
            <SortableCard
              key={card._id}
              card={card}
              onEdit={onEditCard}
              onDelete={onDeleteCard}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  );
};

// Main Kanban Board Component
const KanbanBoard = ({ projectId }) => {
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { socket, emitCardMoved, onCardMoved } = useSocket();

  // Load Kanban board data
  useEffect(() => {
    const loadBoard = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/kanban/projects/${projectId}/board`);
        setColumns(response.data.data.columns);
        setError(null);
      } catch (err) {
        console.error('Failed to load Kanban board:', err);
        setError('Failed to load Kanban board');
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      loadBoard();
    }
  }, [projectId]);

  // Listen for real-time card moves
  useEffect(() => {
    if (socket) {
      const cleanup = onCardMoved((data) => {
        // Update local state with moved card
        setColumns(prevColumns => {
          const newColumns = [...prevColumns];
          
          // Find source and target columns
          const sourceColumnIndex = newColumns.findIndex(col => 
            col.cards.some(card => card._id === data.cardId)
          );
          const targetColumnIndex = newColumns.findIndex(col => 
            col._id === data.toColumn
          );

          if (sourceColumnIndex !== -1 && targetColumnIndex !== -1) {
            // Remove card from source column
            const sourceColumn = { ...newColumns[sourceColumnIndex] };
            const cardIndex = sourceColumn.cards.findIndex(card => card._id === data.cardId);
            const [movedCard] = sourceColumn.cards.splice(cardIndex, 1);
            
            // Add card to target column
            const targetColumn = { ...newColumns[targetColumnIndex] };
            movedCard.column = data.toColumn;
            targetColumn.cards.push(movedCard);
            
            // Update columns
            newColumns[sourceColumnIndex] = sourceColumn;
            newColumns[targetColumnIndex] = targetColumn;
          }

          return newColumns;
        });
      });
      return cleanup;
    }
  }, [socket, onCardMoved]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const activeCard = findCardById(active.id);
    const overCard = findCardById(over.id);

    if (!activeCard) return;

    // Determine if we're moving within a column or between columns
    const activeColumn = findColumnByCardId(active.id);
    const overColumn = overCard ? findColumnByCardId(over.id) : findColumnById(over.id);

    if (!activeColumn || !overColumn) return;

    if (activeColumn._id === overColumn._id) {
      // Moving within the same column
      const newCards = arrayMove(activeColumn.cards, activeColumn.cards.findIndex(card => card._id === active.id), overCard ? activeColumn.cards.findIndex(card => card._id === over.id) : activeColumn.cards.length - 1);
      
      setColumns(prevColumns => 
        prevColumns.map(col => 
          col._id === activeColumn._id 
            ? { ...col, cards: newCards }
            : col
        )
      );

      // Emit socket event
      emitCardMoved({
        cardId: active.id,
        fromColumn: activeColumn._id,
        toColumn: overColumn._id,
        order: overCard ? activeColumn.cards.findIndex(card => card._id === over.id) : activeColumn.cards.length - 1,
        orgId: activeCard.organization,
        projectId: activeCard.project
      });
    } else {
      // Moving between columns
      const sourceCards = activeColumn.cards.filter(card => card._id !== active.id);
      const targetCards = [...overColumn.cards, { ...activeCard, column: overColumn._id }];

      setColumns(prevColumns => 
        prevColumns.map(col => {
          if (col._id === activeColumn._id) {
            return { ...col, cards: sourceCards };
          } else if (col._id === overColumn._id) {
            return { ...col, cards: targetCards };
          }
          return col;
        })
      );

      // Emit socket event
      emitCardMoved({
        cardId: active.id,
        fromColumn: activeColumn._id,
        toColumn: overColumn._id,
        order: overColumn.cards.length,
        orgId: activeCard.organization,
        projectId: activeCard.project
      });
    }
  };

  const findCardById = (cardId) => {
    for (const column of columns) {
      const card = column.cards.find(card => card._id === cardId);
      if (card) return card;
    }
    return null;
  };

  const findColumnByCardId = (cardId) => {
    return columns.find(column => column.cards.some(card => card._id === cardId));
  };

  const findColumnById = (columnId) => {
    return columns.find(column => column._id === columnId);
  };

  const handleAddCard = (column) => {
    // This would open a modal or form to create a new card
    console.log('Add card to column:', column);
  };

  const handleEditCard = (card) => {
    // This would open a modal or form to edit the card
    console.log('Edit card:', card);
  };

  const handleDeleteCard = (card) => {
    // This would show a confirmation dialog and delete the card
    console.log('Delete card:', card);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Kanban Board</h1>
        <p className="text-gray-600">Drag and drop cards to manage your workflow</p>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-6 overflow-x-auto pb-4">
          {columns.map(column => (
            <SortableColumn
              key={column._id}
              column={column}
              cards={column.cards || []}
              onAddCard={handleAddCard}
              onEditCard={handleEditCard}
              onDeleteCard={handleDeleteCard}
            />
          ))}
        </div>
      </DndContext>
    </div>
  );
};

export default KanbanBoard;

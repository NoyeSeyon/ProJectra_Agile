import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import KanbanCard from './KanbanCard';

const KanbanColumn = ({ column, tasks, onEdit, onDelete, onLogTime }) => {
  const { setNodeRef } = useDroppable({
    id: column.id,
  });

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Column Header */}
      <div className={`px-4 py-3 rounded-t-lg ${column.color}`}>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-900">{column.title}</h3>
          <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full">
            {tasks.length}
          </span>
        </div>
      </div>

      {/* Column Content */}
      <div className="p-4">
        <SortableContext
          items={tasks.map(task => task._id)}
          strategy={verticalListSortingStrategy}
        >
          <div
            ref={setNodeRef}
            className="space-y-3 min-h-[200px]"
          >
            {tasks.map((task) => (
              <KanbanCard
                key={task._id}
                task={task}
                onEdit={onEdit}
                onDelete={onDelete}
                onLogTime={onLogTime}
              />
            ))}
          </div>
        </SortableContext>

        {tasks.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">No tasks in this column</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default KanbanColumn;
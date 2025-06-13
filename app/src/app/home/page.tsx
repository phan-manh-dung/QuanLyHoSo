'use client';
import React, { useState } from 'react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import toast from 'react-hot-toast';

// Type for all columns
type Column = {
  id: string;
  label: string;
};

// Initial columns data
const initialColumns: Column[] = [
  { id: 'id', label: 'ID' },
  { id: 'stt', label: 'STT' },
  { id: 'ten', label: 'Tên Hồ Sơ' },
  { id: 'est', label: 'Estimated Month' },
  { id: 'pos', label: 'Thay đổi vị trí' },
  { id: 'date', label: 'Proposal Date' },
  { id: 'resp', label: 'Responsible Person' },
  { id: 'sup', label: 'Supporter' },
  { id: 'note', label: 'Resolution Notes' },
  { id: 'done', label: 'Completed' },
  { id: 'cate', label: 'Category' },
  { id: 'actions', label: 'Actions' },
];

// Sortable header component
function SortableHeader({ column }: { column: Column }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: column.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <th
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="px-3 py-2 font-bold border bg-blue-100 cursor-move"
    >
      {column.label}
    </th>
  );
}

export default function HomePage() {
  const [columns, setColumns] = useState<Column[]>(initialColumns);
  const [newColumnName, setNewColumnName] = useState('');
  const [showInput, setShowInput] = useState(false);

  // Hàm thêm cột mới
  const handleAddColumn = () => {
    const trimmed = newColumnName.trim();

    if (!trimmed) {
      toast('Tên cột không được để trống và không chứa ký tự đặc biệt!');
      return;
    }

    const newCol: Column = {
      id: Date.now().toString(),
      label: trimmed,
    };
    setColumns([...columns.slice(0, -1), newCol, columns[columns.length - 1]]);
    setNewColumnName('');
    setShowInput(false);
  };

  // Hàm xử lý kết thúc kéo thả
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = columns.findIndex((col) => col.id === active.id);
    const newIndex = columns.findIndex((col) => col.id === over.id);

    // Không cho kéo "Actions" đi chỗ khác
    if (
      columns[oldIndex].id === 'actions' ||
      columns[newIndex].id === 'actions'
    )
      return;

    setColumns(arrayMove(columns, oldIndex, newIndex));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-2 md:px-8">
      <div className="mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b pb-4 mb-6">
          <h1 className="text-4xl font-extrabold text-gray-800 mb-2 md:mb-0">
            Task Tracker
          </h1>
          <div className="text-gray-700 text-lg flex items-center gap-2">
            <span>
              Xin chào,{' '}
              <span className="font-semibold text-blue-700">admin</span>
            </span>
            <span className="mx-2">|</span>
            <a href="#" className="text-blue-600 hover:underline font-medium">
              Logout
            </a>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto mt-4 rounded-lg shadow bg-white">
          <table className="min-w-full text-sm text-left">
            <thead>
              <DndContext
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={columns.map((col) => col.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <tr>
                    {columns.map((column) =>
                      column.id === 'actions' ? (
                        <th
                          key={column.id}
                          className="px-3 py-2 font-bold border bg-blue-100"
                        >
                          {column.label}
                        </th>
                      ) : (
                        <SortableHeader key={column.id} column={column} />
                      )
                    )}
                  </tr>
                </SortableContext>
              </DndContext>
            </thead>
            <tbody>
              <tr>
                {columns.map((col) =>
                  col.id === 'actions' ? (
                    <td key={col.id} className="border px-3 py-2 flex gap-2">
                      <button className="text-red-600 hover:underline cursor-pointer">
                        Delete
                      </button>
                      <button className="text-blue-600 hover:underline cursor-pointer">
                        Detail
                      </button>
                    </td>
                  ) : (
                    <td key={col.id} className="border px-3 py-2 text-gray-500">
                      {/* dữ liệu giả */}
                      ---
                    </td>
                  )
                )}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Add New Column */}
        {showInput ? (
          <div className="flex items-center justify-end gap-2 py-3">
            <input
              value={newColumnName}
              onChange={(e) => setNewColumnName(e.target.value)}
              placeholder="Tên cột"
              className="px-2 py-1 border rounded"
            />
            <button
              onClick={handleAddColumn}
              className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 cursor-pointer"
            >
              OK
            </button>
            <button
              onClick={() => {
                setShowInput(false);
                setNewColumnName('');
              }}
              className="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        ) : (
            <div className="flex items-center justify-end gap-2 py-3"> 
               <button
              onClick={() => setShowInput(true)}
              className="text-blue-600 hover:underline font-medium text-base cursor-pointer"
            >
              + Thêm cột mới vào bảng
            </button>
          </div>
        )}

        <div className="fixed bottom-4 left-0 w-full flex flex-col md:flex-row md:items-center gap-4 justify-between px-10 ">
          {/* Upload & Export */}
          <div className="flex flex-col md:flex-row md:items-center gap-4 mt-6">
            <form className="flex items-center gap-2 bg-white p-4 rounded-lg shadow">
              <label className="font-medium text-gray-700">Upload Excel:</label>
              <input
                type="file"
                className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <button
                type="button"
                className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition cursor-pointer"
              >
                Upload
              </button>
            </form>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium shadow hover:bg-green-700 transition w-fit cursor-pointer">
              Export Data Table to Excel
            </button>
          </div>

          {/* Download Template */}
          <div className="mt-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Tải file mẫu để nhập liệu
            </h2>
            <a
              href="#"
              className="text-blue-600 hover:underline font-medium text-base"
            >
              Download Template{' '}
            </a>
            <a
              href="#"
              className="text-blue-600 hover:underline font-medium text-base"
            >
              Generate Report{' '}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

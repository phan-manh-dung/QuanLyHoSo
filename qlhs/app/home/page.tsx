'use client';
import React, { useEffect, useRef, useState } from 'react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import toast from 'react-hot-toast';

// Type for all columns
interface ColumnType {
  id: string;
  label: string;
  type?: string;
}

// Type for data row
interface DataRow {
  [key: string]: string | number | null;
}

// Type for Excel row
interface ExcelRow {
  [key: string]: string | number;
}

// Type for API response item
interface ApiResponseItem {
  values: Record<string, string | number | null>;
}

// Sortable header component
function SortableHeader({ column }: { column: ColumnType }) {
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
  const [columns, setColumns] = useState<ColumnType[]>([]);
  console.log('columns', columns);
  const [newColumnName, setNewColumnName] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dataColumn, setDataColumn] = useState<DataRow[]>([]);
  console.log('dataColumn', dataColumn);

  // Lấy dữ liệu cột từ API khi component mount
  useEffect(() => {
    const fetchColumns = async () => {
      try {
        const res = await fetch('/api/column');
        const data = await res.json();
        // Thêm cột actions vào cuối danh sách cột
        const columnsWithActions = [
          ...data,
          {
            id: 'actions',
            label: 'Actions',
            type: 'actions',
          },
        ];
        setColumns(columnsWithActions);
      } catch (error) {
        console.error('Failed to fetch columns:', error);
      }
    };

    fetchColumns();
  }, []);

  // Chuyển đổi ngày từ định dạng Excel sang định dạng JS Date
  function excelDateToJSDate(serial: number): string {
    const utc_days = Math.floor(serial - 25569);
    const utc_value = utc_days * 86400; // seconds
    const date_info = new Date(utc_value * 1000);

    // Nếu muốn định dạng kiểu "dd/mm/yyyy"
    const day = date_info.getDate().toString().padStart(2, '0');
    const month = (date_info.getMonth() + 1).toString().padStart(2, '0'); // tháng 0-based
    const year = date_info.getFullYear();

    return `${day}/${month}/${year}`;
  }

  // Hàm thêm cột mới
  const handleAddColumn = async () => {
    const trimmed = newColumnName.trim();

    if (!trimmed) {
      toast('Tên cột không được để trống và không chứa ký tự đặc biệt!');
      return;
    }

    try {
      const res = await fetch('/api/column', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: Date.now().toString(),
          label: trimmed,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Lỗi khi thêm cột');
      }

      const newCol = await res.json();

      setColumns((prev) => {
        const lastCol = prev[prev.length - 1];
        const newList =
          lastCol?.id === 'actions'
            ? [...prev.slice(0, -1), newCol, lastCol]
            : [...prev, newCol];
        return newList;
      });

      toast.success('Thêm cột thành công!');
      setNewColumnName('');
      setShowInput(false);
    } catch (error) {
      toast.error(`Lỗi: ${error}`);
    }
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

  // Hàm download file Excel
  const handleDownloadTemplate = () => {
    // Lọc bỏ cột actions
    const visibleColumns = columns.filter(
      (col) => col.id !== 'actions' && col.id !== 'id'
    );

    // Tạo mảng object với key là col.label và value là rỗng
    const sampleRow: Record<string, string> = visibleColumns.reduce((acc, col) => {
      acc[col.label] = '';
      return acc;
    }, {} as Record<string, string>);

    const worksheetData = [sampleRow]; // chỉ 1 dòng làm mẫu

    // Tạo worksheet & workbook
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');

    // Xuất file Excel
    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });

    const fileBlob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
    });

    saveAs(fileBlob, 'template.xlsx');
  };

  // Hàm fileChange
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  // Hàm upload file Excel
const handleFileUpload = async () => {
  if (!file) {
    toast('Vui lòng chọn một file Excel');
    return;
  }

  const reader = new FileReader();

  reader.onload = async (e) => {
    const data = e.target?.result;
    const workbook = XLSX.read(data, { type: 'binary' });

    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const json = XLSX.utils.sheet_to_json(worksheet) as ExcelRow[];

    // Không cần thêm 
    const jsonWithId = json.map((item) => ({
      ...item,
    }));

    // Tạo map label sang id từ columns
    const labelToIdMap = columns.reduce((acc, col) => {
      acc[col.label] = col.id;
      return acc;
    }, {} as Record<string, string>);

    // Map key dữ liệu theo labelToIdMap, không tạo 
    const jsonWithMappedKeys = jsonWithId.map((row) => {
      const newRow: Record<string, string | number> = {};

      for (const key in row) {
        const mappedKey = labelToIdMap[key] ?? key;
        let value = row[key];
        if (mappedKey === 'ngay-tao' && typeof value === 'number') {
          value = excelDateToJSDate(value);
        }
        newRow[mappedKey] = value;
      }

      return newRow;
    });

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jsonWithMappedKeys),
      });

      const result = await res.json() as ApiResponseItem[];

      // Không dùng  nữa, flatten data như sau:
      const flattened = result.map((item) => {
        const flatRow: Record<string, string | number | null> = {};

        for (const [key, value] of Object.entries(item.values || {})) {
          flatRow[key] = value;
        }

        return flatRow;
      });

      setDataColumn(flattened);

      if (res.ok) {
        toast.success('Tải dữ liệu thành công!');
        if (fileInputRef.current) {
          fileInputRef.current.value = ''; // reset file input
        }
        setFile(null);
      } else {
        console.error('Lỗi khi tải lên:', result);
        toast.error('Tải dữ liệu thất bại');
      }
    } catch (error) {
      console.error('Lỗi hệ thống:', error);
      toast.error('Lỗi hệ thống xảy ra');
    }
  };

  reader.readAsBinaryString(file);
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
                    {(columns ?? [])?.map((column) =>
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
              {dataColumn.map((row, rowIndex) => (
                <tr key={rowIndex}>
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
                      <td
                        key={col.id}
                        className="border px-3 py-2 text-gray-500"
                      >
                        {col.id === 'id'
                          ? rowIndex + 1
                          : (row[col.id as keyof typeof row] ?? 'null')}
                      </td>
                    )
                  )}
                </tr>
              ))}
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
                onChange={handleFileChange}
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls"
                className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <button
                onClick={handleFileUpload}
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
            <h2 className="text-2xl font-bold text-gray-800 mb-2 cursor-pointer">
              Tải file mẫu để nhập liệu
            </h2>
            <a
              onClick={handleDownloadTemplate}
              className="text-blue-600 hover:underline font-medium text-base cursor-pointer"
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

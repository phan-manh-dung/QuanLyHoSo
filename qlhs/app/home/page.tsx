'use client';
import React, { useEffect, useRef, useState } from 'react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPen, faFileExcel } from '@fortawesome/free-solid-svg-icons';

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
  _id?: string;
  [key: string]: string | number | null | Date | undefined;
}

// Type for Excel row
interface ExcelRow {
  [key: string]: string | number;
}

// Type for API response item
interface ApiResponseItem {
  _id: string;
  values: Record<string, string | number | null | Date>; // Xác định các kiểu giá trị có thể
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
      className="px-3 py-2 font-bold border bg-blue-100 sticky top-0 z-10 cursor-move"
    >
      {column.label}
    </th>
  );
}

export default function HomePage() {
  const [columns, setColumns] = useState<ColumnType[]>([]);
  const [newColumnName, setNewColumnName] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [dataColumn, setDataColumn] = useState<DataRow[]>([]);
  const [dataRowDB, setDataRowDB] = useState<DataRow[]>([]);
  const [searchColumn, setSearchColumn] = useState<string>('');
  const [searchValue, setSearchValue] = useState<string>('');
  const [filteredRows, setFilteredRows] = useState<DataRow[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const rowsToDisplay = [...dataRowDB, ...dataColumn];
  
  // Khi render header và dữ liệu, sắp xếp lại columns để actions lên đầu
  const orderedColumns = React.useMemo(() => {
    const actionsCol = columns.find((col) => col.id === 'actions');
    const otherCols = columns.filter((col) => col.id !== 'actions');
    return actionsCol ? [actionsCol, ...otherCols] : columns;
  }, [columns]);

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
            label: 'AT',
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

  // lấy dữ liệu cột từ API khi component mount
  useEffect(() => {
    fetchDataRows();
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
      toast('Tên cột không được để trống!');
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
    const sampleRow: Record<string, string> = visibleColumns.reduce(
      (acc, col) => {
        acc[col.label] = '';
        return acc;
      },
      {} as Record<string, string>
    );

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
      const labelToIdMap = columns.reduce(
        (acc, col) => {
          acc[col.label] = col.id;
          return acc;
        },
        {} as Record<string, string>
      );

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

        const result = await res.json();
        console.log('result', result);

        if (result.success === false) {
          toast.error(result.message || 'Lỗi hệ thống!');
          return;
        }

        // Nếu thành công, flatten data như cũ
        const flattened = (result.inserted || []).map(
          (item: ApiResponseItem) => {
            const flatRow: DataRow = {
              _id: item._id,
            };
            for (const [key, value] of Object.entries(item.values || {})) {
              flatRow[key] = value;
            }
            return flatRow;
          }
        );
        setDataColumn(flattened);

        toast.success('Tải dữ liệu thành công!');
        if (fileInputRef.current) {
          fileInputRef.current.value = ''; // reset file input
        }
        setFile(null);
      } catch (error) {
        console.error('Lỗi hệ thống:', error);
        toast.error('Lỗi hệ thống!');
      }
    };

    reader.readAsBinaryString(file);
  };

  // Hàm export dữ liệu bảng ra Excel (loại trừ cột AT)
  const handleExportToExcel = () => {
    // Hỏi tên file
    const fileName = window.prompt(
      'Nhập tên file muốn tải xuống (không cần .xlsx):',
      'data-table'
    );
    if (fileName === null) return; // Người dùng bấm Cancel

    const exportColumns = columns.filter(
      (col) => col.id !== 'actions' && col.label !== 'AT'
    );
    const exportData = rowsToDisplay.map((row, idx) => {
      const obj: Record<string, string | number | null> = {};

      exportColumns.forEach((col) => {
        if (col.id === 'stt') {
          obj[col.label] = idx + 1;
        } else {
          const value = row[col.id];
          if (value instanceof Date) {
            obj[col.label] = value.toLocaleDateString('vi-VN');
          } else {
            obj[col.label] = value ?? '';
          }
        }
      });

      return obj;
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });
    const fileBlob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
    });
    // Nếu người dùng không nhập gì, dùng tên mặc định
    const finalName =
      fileName && fileName.trim() !== ''
        ? fileName.trim() + '.xlsx'
        : 'data-table.xlsx';
    saveAs(fileBlob, finalName);
  };

  // Hàm xử lý tìm kiếm
  const handleSearch = () => {
    if (!searchColumn || !searchValue) return;
    const filtered = rowsToDisplay.filter((row) => {
      const value = row[searchColumn];
      return (
        value !== undefined &&
        value !== null &&
        value.toString().toLowerCase().includes(searchValue.toLowerCase())
      );
    });
    setFilteredRows(filtered);
  };

  // Hàm hủy tìm kiếm
  const handleCancelSearch = () => {
    setFilteredRows(null);
    setSearchColumn('');
    setSearchValue('');
  };

    // Hàm fetch dữ liệu từ database (tách riêng để có thể gọi lại)
  const fetchDataRows = async () => {
    try {
      const res = await fetch('/api/upload');
      const data = await res.json();
      const flattened = data.map((item: ApiResponseItem) => {
        const flatRow: DataRow = {
          _id: item._id,
        };

        for (const [key, value] of Object.entries(item.values || {})) {
          flatRow[key] = value;
        }

        return flatRow;
      });

      setDataRowDB(flattened);
    } catch (error) {
      console.error('Failed to fetch data rows:', error);
    }
  };

  // Hàm xóa dòng
  const handleDeleteRow = async (rowId: string) => {
    const confirmed = window.confirm('Bạn có chắc chắn muốn xóa dòng này không?');
    
    if (!confirmed) {
      return;
    }

    try {
      const res = await fetch(`/api/upload/${rowId}`, {
        method: 'DELETE',
      });

      const result = await res.json();

      if (res.ok) {
        toast.success('Xóa dòng thành công!');
        
        // Load lại dữ liệu từ database sau khi xóa thành công
        await fetchDataRows();
        
        // Clear dataColumn vì dữ liệu mới upload sẽ được load lại
        setDataColumn([]);
      } else {
        toast.error(result.message || 'Lỗi khi xóa dòng');
      }
    } catch (error) {
      console.error('Lỗi khi xóa:', error);
      toast.error('Lỗi hệ thống khi xóa dòng');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-4 px-2 md:px-8">
      <div className="mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b pb-1 mb-1">
          <h1 className="text-4xl font-extrabold text-gray-800 mb-2 md:mb-0">
            Task Tracker
          </h1>
          <div className="text-gray-700 text-lg flex items-center gap-2">
            <span>
              <span className="text-sm">Xin chào: </span>
              <span className="font-semibold text-blue-700"> admin</span>
            </span>
            <span className="mx-2">|</span>
            <a href="#" className="text-blue-600 hover:underline font-medium">
              Logout
            </a>
          </div>
        </div>

        {/* Search & Add New Column Section */}
        <div className="flex items-center justify-between border-b pb-1 mb-3">
          {/* Search box góc trái */}
          <div className="flex items-center gap-2">
            <label className="font-medium text-gray-700 text-base h-8 flex items-center">
              Tìm theo
            </label>
            <select
              className="border rounded px-2 py-1 h-8"
              value={searchColumn}
              onChange={(e) => {
                setSearchColumn(e.target.value);
                setSearchValue('');
              }}
            >
              <option value="">Cột</option>
              {columns
                .filter((col) => col.id !== 'actions' && col.id !== 'id')
                .map((col) => (
                  <option key={col.id} value={col.id}>
                    {col.label}
                  </option>
                ))}
            </select>
            {searchColumn && (
              <>
                <input
                  className="border rounded px-2 py-1 h-8 text-sm"
                  placeholder={`Nhập giá trị...`}
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                />
                <button
                  className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 cursor-pointer h-8"
                  onClick={(e) => {
                    e.preventDefault();
                    handleSearch();
                  }}
                  disabled={!searchValue}
                >
                  OK
                </button>
                <button
                  className="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500 cursor-pointer h-8"
                  onClick={(e) => {
                    e.preventDefault();
                    handleCancelSearch();
                  }}
                >
                  Cancel
                </button>
              </>
            )}
          </div>

          {/* Add New Column */}
          {showInput ? (
            <div className="flex items-center gap-2">
              <input
                value={newColumnName}
                onChange={(e) => setNewColumnName(e.target.value)}
                placeholder="Tên cột"
                className="px-2 py-1 border rounded h-8"
              />
              <button
                onClick={handleAddColumn}
                className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 cursor-pointer h-8"
              >
                OK
              </button>
              <button
                onClick={() => {
                  setShowInput(false);
                  setNewColumnName('');
                }}
                className="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500 cursor-pointer h-8"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowInput(true)}
                className="text-blue-600 hover:underline font-medium text-base cursor-pointer px-2 py-1 h-8"
              >
                + Thêm cột mới vào bảng
              </button>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto max-h-[68vh] overflow-y-auto mt-1 rounded-lg shadow bg-white custom-scrollbar">
          <table className="min-w-full text-sm text-left">
            <thead>
              <DndContext
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={orderedColumns.map((col) => col.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <tr>
                    {(orderedColumns ?? [])?.map((column) =>
                      column.id === 'actions' ? (
                        <th
                          key={column.id}
                          className="px-0 py-2 font-bold border bg-blue-100 sticky top-0 z-10 w-[48px] text-center"
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
              {(filteredRows ?? rowsToDisplay).map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {orderedColumns.map((col) =>
                    col.id === 'actions' ? (
                      <td
                        key={col.id}
                        className="px-0 py-2 flex items-center justify-center gap-3 w-[48px]"
                      >
                        <button 
                          className="text-red-600 flex items-center justify-center cursor-pointer" 
                          onClick={() => row._id && handleDeleteRow(row._id)}
                        >
                          <FontAwesomeIcon icon={faTrash} size="sm" />
                        </button>

                        <button className="text-blue-600 flex items-center justify-center cursor-pointer">
                          <FontAwesomeIcon icon={faPen} size="sm" />
                        </button>
                      </td>
                    ) : (
                      <td
                        key={col.id}
                        className="border px-3 py-2 text-gray-500 "
                      >
                        {col.id === 'stt'
                          ? rowIndex + 1
                          : (() => {
                              const value = row[col.id as keyof typeof row];
                              if (value instanceof Date) {
                                return value.toLocaleDateString('vi-VN');
                              }
                              return value ?? 'null';
                            })()}
                      </td>
                    )
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Upload & Export */}
        <div className="fixed bottom-4 left-0 w-full flex flex-col md:flex-row md:items-center gap-4 justify-between px-10 ">
          <div className="flex flex-col md:flex-row md:items-center gap-4 mt-6">
            <form className="flex items-center gap-2 bg-white p-1 rounded-lg shadow">
              <label className="font-medium text-green-700">
                <FontAwesomeIcon icon={faFileExcel} size="2x" />
              </label>
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
            <button
              className="px-2 py-1 bg-green-600 text-white rounded-lg font-medium shadow hover:bg-green-700 transition w-fit cursor-pointer"
              onClick={handleExportToExcel}
            >
              Export Data Table to Excel
            </button>
          </div>

          {/* Download Template */}
          <div className="mt-10">
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

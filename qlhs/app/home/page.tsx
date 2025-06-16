'use client';
import React, { useEffect, useRef, useState } from 'react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTrash,
  faPen,
  faRightFromBracket,
  faGear,
} from '@fortawesome/free-solid-svg-icons';
import AuthGuard from '../../src/components/AuthGuard';
import { Drawer, Form, Input, Button, Space } from 'antd';

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
  [key: string]: string | number | boolean | Date | null;
}

// Type for API response item
interface ApiResponseItem {
  _id: string;
  values: Record<string, string | number | null | Date>; // Xác định các kiểu giá trị có thể
}

// Sortable header component
function SortableHeader({
  column,
  onDeleteColumn,
  checkAdmin,
}: {
  column: ColumnType;
  onDeleteColumn: (id: string) => void;
  checkAdmin: boolean;
}) {
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
      className="px-3 py-2 font-bold border bg-blue-100 sticky top-0 z-10 cursor-move relative group"
    >
      <div className="flex items-center justify-between">
        <div {...attributes} {...listeners} className="flex-1">
          <span>{column.label}</span>
        </div>
        {checkAdmin && column.id !== 'actions' && column.id !== 'stt' && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDeleteColumn(column.id);
            }}
            className="ml-2 text-red-600 hover:text-red-800 p-1 rounded z-20 relative"
            title="Xóa cột"
          >
            <FontAwesomeIcon icon={faTrash} size="xs" />
          </button>
        )}
      </div>
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
  const [userData, setUserData] = useState<any>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedRow, setSelectedRow] = useState<DataRow | null>(null);
  const [form] = Form.useForm();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const rowsToDisplay = [...dataRowDB, ...dataColumn];
  const [settingsDrawerVisible, setSettingsDrawerVisible] = useState(false);

  // Hàm định dạng ngày tháng thành dd/mm/yyyy
  const formatDateToDDMMYYYY = (date: Date | string | number | null): string | null => {
    if (!date) return null;
    let d: Date;

    if (date instanceof Date) {
      d = date;
    } else if (typeof date === 'string' || typeof date === 'number') {
      // Attempt to parse string/number to Date if needed, or assume it's already in a parsable format
      // For this specific use case (from Excel's raw: false or serial number), it's likely a Date object or serial number
      // For simplicity, we'll try to convert if it's a serial number
      if (typeof date === 'number' && date > 10000 && date < 60000) { // Simple heuristic for Excel serial dates
        const utc_days = Math.floor(date - 25569);
        const utc_value = utc_days * 86400;
        d = new Date(utc_value * 1000);
      } else {
        try {
          d = new Date(date);
          if (isNaN(d.getTime())) return String(date); // Return original if invalid date
        } catch {
          return String(date); // Return original if parsing fails
        }
      }
    } else {
      return null; // For other types
    }

    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();

    return `${day}/${month}/${year}`;
  };

  // biến check admin để xác định quyền của user
  const idAd = process.env.NEXT_PUBLIC_ID_ADMIN;
  const checkAdmin =
    userData?.username === 'admin' && userData?.role === 'adminql' && idAd
      ? true
      : false;

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

  // Lấy thông tin user từ localStorage
  useEffect(() => {
    const userId = localStorage.getItem('userId');
    const username = localStorage.getItem('username');
    const role = localStorage.getItem('role');

    if (userId && username) {
      setUserData({
        userId,
        username,
        role: role || 'user',
      });
    }
  }, []);

  // Chuyển đổi ngày từ định dạng Excel sang định dạng JS Date
  function excelDateToJSDate(serial: number): string {
    const utc_days = Math.floor(serial - 25569);
    const utc_value = utc_days * 86400; // seconds
    const date_info = new Date(utc_value * 1000);

    // Định dạng kiểu "dd/mm/yyyy"
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
      (col) => col.id !== 'actions' && col.id !== 'stt'
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
      const workbook = XLSX.read(data, { type: 'binary', cellDates: true });

      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(worksheet, { raw: false }) as ExcelRow[];

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
        const newRow: Record<string, string | number | boolean | Date | null> = {};

        for (const key in row) {
          const mappedKey = labelToIdMap[key] ?? key;
          const value = row[key];

          // If value is already a Date object, format it
          if (typeof value === 'object' && value !== null && value instanceof Date && !isNaN(value.getTime())) {
            newRow[mappedKey] = formatDateToDDMMYYYY(value);
          }
          // Otherwise, if it's a number and for 'ngay-tao', convert from Excel serial
          else if (mappedKey === 'ngay-tao' && typeof value === 'number') {
            newRow[mappedKey] = formatDateToDDMMYYYY(excelDateToJSDate(value));
          } else {
            newRow[mappedKey] = value;
          }
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
          fileInputRef.current.value = ''; 
        }
        setFile(null);
        setSettingsDrawerVisible(false);
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
            obj[col.label] = formatDateToDDMMYYYY(value);
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

  // Hàm hủy tìm kiếm
  const handleCancelSearch = () => {
    setFilteredRows(null);
    setSearchColumn('');
    setSearchValue('');
  };

  // Hàm search real-time khi người dùng nhập
  const handleRealTimeSearch = (value: string) => {
    setSearchValue(value);
    if (!searchColumn || !value.trim()) {
      setFilteredRows(null);
      return;
    }
    const filtered = rowsToDisplay.filter((row) => {
      const rowValue = row[searchColumn];
      return (
        rowValue !== undefined &&
        rowValue !== null &&
        rowValue.toString().toLowerCase().includes(value.toLowerCase())
      );
    });
    setFilteredRows(filtered);
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
    const confirmed = window.confirm(
      'Bạn có chắc chắn muốn xóa dòng này không?'
    );

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

  // Hàm xóa cột
  const handleDeleteColumn = async (columnId: string) => {
    const confirmed = window.confirm(
      'Bạn có chắc chắn muốn xóa cột này không?'
    );
    if (!confirmed) {
      return;
    }

    try {
      const res = await fetch(`/api/column/${columnId}`, {
        method: 'DELETE',
      });

      const result = await res.json();

      if (res.ok) {
        toast.success('Xóa cột thành công!');

        // Load lại danh sách cột từ database sau khi xóa thành công
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

        await fetchColumns();
      } else {
        toast.error(result.message || 'Lỗi khi xóa cột');
      }
    } catch (error) {
      console.error('Lỗi khi xóa:', error);
      toast.error('Lỗi hệ thống khi xóa cột');
    }
  };

  // Hàm logout
  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');

    toast.success('Đã đăng xuất');
    window.location.href = '/';
  };

  // Hàm mở drawer để xem/sửa thông tin hàng
  const handleEditRow = (row: DataRow) => {
    setSelectedRow(row);
    setDrawerVisible(true);
    // Set form values
    const formValues: Record<string, any> = {};
    columns.forEach(col => {
      if (col.id !== 'actions' && col.id !== 'stt') {
        formValues[col.id] = row[col.id] || '';
      }
    });
    form.setFieldsValue(formValues);
  };

  // Hàm đóng drawer
  const handleCloseDrawer = () => {
    setDrawerVisible(false);
    setSelectedRow(null);
    form.resetFields();
  };

  // Hàm đóng drawer tùy chỉnh
  const handleCloseSettingsDrawer = () => {
    setSettingsDrawerVisible(false);
    setShowInput(false);
    setNewColumnName(''); 
  };

  // Hàm lưu thay đổi
  const handleSaveChanges = async (values: any) => {
    if (!selectedRow?._id) {
      toast.error('Không tìm thấy ID của dòng dữ liệu');
      return;
    }

    try {
      const res = await fetch(`/api/upload/${selectedRow._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ values }),
      });

      const result = await res.json();

      if (res.ok) {
        toast.success('Cập nhật thành công!');
        handleCloseDrawer();
        // Reload data
        await fetchDataRows();
      } else {
        toast.error(result.message || 'Lỗi khi cập nhật');
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật:', error);
      toast.error('Lỗi hệ thống khi cập nhật');
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-1 px-2 md:px-8">
        <div className="mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b pb-1 mb-1">
            <h1 className="text-4xl font-extrabold text-gray-800 mb-2 md:mb-0">
              Task Trakcer
            </h1>
            <div className="text-gray-700 text-lg flex items-center gap-2">
              <span>
                <span className="text-sm">Xin chào: </span>
                <span className="font-semibold text-blue-700">
                  {' '}
                  {userData?.username}
                </span>
              </span>
              <span className="mx-1">|</span>
              <a
                href="#"
                className="text-blue-600 hover:underline font-medium"
                onClick={handleLogout}
              >
                <FontAwesomeIcon icon={faRightFromBracket} size="lg" />
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
                  setFilteredRows(null);
                }}
              >
                {columns
                  .filter((col) => col.id !== 'actions' && col.id !== 'stt')
                  .map((col) => (
                    <option key={col.id} value={col.id}>
                      {col.label}
                    </option>
                  ))}
              </select>
              <input
                className="border rounded px-2 py-1 h-8 text-sm"
                placeholder="Nhập giá trị để tìm kiếm..."
                value={searchValue}
                onChange={(e) => handleRealTimeSearch(e.target.value)}
              />
              <button
                className="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500 cursor-pointer h-8"
                onClick={(e) => {
                  e.preventDefault();
                  handleCancelSearch();
                }}
              >
                Xóa
              </button>
            </div>

            {/* Settings icon to open drawer */}
            {checkAdmin && (
              <button
                onClick={() => setSettingsDrawerVisible(true)}
                className="text-gray-600 hover:text-gray-800 p-2 rounded-full transition-colors duration-200 cursor-pointer"
                title="Tùy chọn"
              >
                <FontAwesomeIcon icon={faGear} size="lg" />
              </button>
            )}
          </div>

          {/* Table */}

          <div className="overflow-x-auto max-h-[58vh] overflow-y-auto mt-1 rounded-lg shadow bg-white custom-scrollbar">
            <DndContext
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={orderedColumns.map((col) => col.id)}
                strategy={verticalListSortingStrategy}
              >
                <table className="min-w-full text-sm text-left">
                  <thead>
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
                          <SortableHeader
                            key={column.id}
                            column={column}
                            checkAdmin={checkAdmin}
                            onDeleteColumn={handleDeleteColumn}
                          />
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {(filteredRows ?? rowsToDisplay).map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {orderedColumns.map((col) =>
                          col.id === 'actions' ? (
                            <td
                              key={col.id}
                              className="px-0 py-2 flex items-center justify-center gap-1 flex-nowrap "
                            >
                              {checkAdmin && (
                                <div className="flex gap-1">
                                  <button
                                    className="text-red-600 flex items-center justify-center cursor-pointer"
                                    onClick={() =>
                                      row._id && handleDeleteRow(row._id)
                                    }
                                  >
                                    <FontAwesomeIcon icon={faTrash} size="sm" />
                                  </button>
                                  <button 
                                    className="text-blue-600 flex items-center justify-center cursor-pointer"
                                    onClick={() => handleEditRow(row)}
                                  >
                                    <FontAwesomeIcon icon={faPen} size="sm" />
                                  </button>
                                </div>
                              )}
                            </td>
                          ) : (
                            <td
                              key={col.id}
                              className="border px-3 py-2 text-gray-500 "
                            >
                              {col.id === 'stt'
                                ? rowIndex + 1
                                : (() => {
                                    const value =
                                      row[col.id as keyof typeof row];
                                    if (value instanceof Date) {
                                      return formatDateToDDMMYYYY(value);
                                    }
                                    return value ?? 'null';
                                  })()}
                            </td>
                          )
                        )}
                      </tr>
                    ))}
                    {filteredRows && filteredRows.length === 0 && (
                      <tr>
                        <td 
                          colSpan={orderedColumns.length} 
                          className="border px-3 py-8 text-center text-gray-500 bg-gray-50"
                        >
                          Không có dữ liệu phù hợp với tìm kiếm
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </SortableContext>
            </DndContext>
          </div>

        </div>
      </div>

      {/* Drawer for editing row details */}
      <Drawer
        title="Chi tiết dữ liệu"
        placement="right"
        width={600}
        onClose={handleCloseDrawer}
        open={drawerVisible}
        footer={(
          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={handleCloseDrawer}>Hủy</Button>
              <Button type="primary" onClick={() => form.submit()}>
                Lưu thay đổi
              </Button>
            </Space>
          </div>
        )}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveChanges}
        >
          {columns
            .filter(col => col.id !== 'actions' && col.id !== 'stt')
            .map(col => (
            <Form.Item
          key={col.id}
          label={<span style={{ fontWeight: 'bold' }}>{col.label}</span>}
          name={col.id}
        >
          <Input placeholder={`Nhập ${col.label}`} style={{ width: '100%' }} />
        </Form.Item>
            ))}
        </Form>
      </Drawer>

      {/* Settings Drawer */}
      <Drawer
        title="Tùy chọn chỉnh sửa"
        placement="right"
        width={400}
        onClose={handleCloseSettingsDrawer}
        open={settingsDrawerVisible}
        footer={(
          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={handleCloseSettingsDrawer}>Đóng</Button>
            </Space>
          </div>
        )}
      >
        {/* Add New Column Section inside Drawer */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Thêm cột mới</h3>
          {showInput ? (
            <div className="flex items-center gap-2">
              <Input
                value={newColumnName}
                onChange={(e) => setNewColumnName(e.target.value)}
                placeholder="Tên cột"
              />
              <Button type="primary" onClick={handleAddColumn}>
                OK
              </Button>
              <Button
                onClick={() => {
                  setShowInput(false);
                  setNewColumnName('');
                }}
              >
                Hủy
              </Button>
            </div>
          ) : (
            <Button onClick={() => setShowInput(true)}>
              + Thêm cột mới vào bảng
            </Button>
          )}
        </div>

        {/* Upload File Section inside Drawer */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Tải lên dữ liệu Excel</h3>
          <form className="flex flex-col gap-2">
            <input
              onChange={handleFileChange}
              ref={fileInputRef}
              type="file"
              accept=".xlsx, .xls"
              className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <Button type="primary" onClick={handleFileUpload}>
              Upload
            </Button>
          </form>
        </div>

        {/* Export Data Table to Excel Section inside Drawer */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Xuất dữ liệu</h3>
          <Button onClick={handleExportToExcel}>
            Export Data Table to Excel
          </Button>
        </div>

        {/* Download Template & Generate Report Section inside Drawer */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Mẫu và Báo cáo</h3>
          <div className="flex flex-col gap-2">
            <Button onClick={handleDownloadTemplate}>
              Download Template
            </Button>
            <Button>
              Generate Report
            </Button>
          </div>
        </div>
      </Drawer>
    </AuthGuard>
  );
}

import React from 'react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-2 md:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b pb-4 mb-6">
          <h1 className="text-4xl font-extrabold text-gray-800 mb-2 md:mb-0">Task Tracker</h1>
          <div className="text-gray-700 text-lg flex items-center gap-2">
            <span>Welcome, <span className="font-semibold text-blue-700">admin</span></span>
            <span className="mx-2">|</span>
            <a href="#" className="text-blue-600 hover:underline font-medium">Logout</a>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg shadow bg-white">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-blue-100">
              <tr>
                <th className="px-3 py-2 font-bold border">ID</th>
                <th className="px-3 py-2 font-bold border">STT</th>
                <th className="px-3 py-2 font-bold border">Tên Hồ Sơ</th>
                <th className="px-3 py-2 font-bold border">Estimated Month</th>
                <th className="px-3 py-2 font-bold border">Thay đổi vị trí</th>
                <th className="px-3 py-2 font-bold border">Proposal Date</th>
                <th className="px-3 py-2 font-bold border">Responsible Person</th>
                <th className="px-3 py-2 font-bold border">Supporter</th>
                <th className="px-3 py-2 font-bold border">Resolution Notes</th>
                <th className="px-3 py-2 font-bold border">Completed</th>
                <th className="px-3 py-2 font-bold border">cột mới 2003</th>
                <th className="px-3 py-2 font-bold border">Category</th>
                <th className="px-3 py-2 font-bold border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {/* Bảng trống */}
              <tr>
                <td colSpan={13} className="text-center text-gray-400 py-8">Chưa có dữ liệu</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Add New Task */}
        <div className="mt-4">
          <a href="#" className="text-blue-600 hover:underline font-medium text-base">+ Add New Task</a>
        </div>

        {/* Upload & Export */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 mt-6">
          <form className="flex items-center gap-2 bg-white p-4 rounded-lg shadow">
            <label className="font-medium text-gray-700">Upload Excel:</label>
            <input type="file" className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
            <button type="button" className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition">Upload</button>
          </form>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium shadow hover:bg-green-700 transition w-fit">Export to Excel</button>
        </div>

        {/* Download Template */}
        <div className="mt-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Tải file mẫu</h2>
          <a href="#" className="text-blue-600 hover:underline font-medium text-base">Download Template Generate Report</a>
        </div>
      </div>
    </div>
  );
}
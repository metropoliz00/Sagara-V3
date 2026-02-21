
import React, { useState, useMemo } from 'react';
import { Book, Plus, Search, Trash2, CheckCircle, Clock, Filter, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';
import { Student, BookLoan } from '../types';
import { MOCK_SUBJECTS } from '../constants';

interface BookLoanViewProps {
  students: Student[];
  bookLoans: BookLoan[];
  onSaveLoan: (loan: BookLoan) => void;
  onDeleteLoan: (id: string) => void;
  isDemoMode: boolean;
}

const BookLoanView: React.FC<BookLoanViewProps> = ({
  students,
  bookLoans,
  onSaveLoan,
  onDeleteLoan,
  isDemoMode
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'Semua' | 'Dipinjam' | 'Dikembalikan'>('Semua');

  // Form State
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedBooks, setSelectedBooks] = useState<string[]>([]);
  const [qty, setQty] = useState(1);
  const [status, setStatus] = useState<'Dipinjam' | 'Dikembalikan'>('Dipinjam');
  const [notes, setNotes] = useState('');

  const subjects = MOCK_SUBJECTS.filter(s => s.id !== 'kka').slice(0, 9);

  const formatDateIndo = (dateStr: string) => {
    if (!dateStr) return '-';
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }).format(date);
    } catch (e) {
      return dateStr;
    }
  };

  const filteredLoans = useMemo(() => {
    return bookLoans.filter(loan => {
      const matchesSearch = loan.studentName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'Semua' || loan.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [bookLoans, searchTerm, filterStatus]);

  const handleToggleBook = (bookName: string) => {
    setSelectedBooks(prev => 
      prev.includes(bookName) 
        ? prev.filter(b => b !== bookName) 
        : [...prev, bookName]
    );
  };

  const handleSelectAllBooks = () => {
    if (selectedBooks.length === subjects.length) {
      setSelectedBooks([]);
    } else {
      setSelectedBooks(subjects.map(s => s.name));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || selectedBooks.length === 0) return;

    const student = students.find(s => s.id === selectedStudentId);
    if (!student) return;

    const newLoan: BookLoan = {
      id: `loan-${Date.now()}`,
      studentId: selectedStudentId,
      studentName: student.name,
      classId: student.classId,
      books: selectedBooks,
      qty: qty,
      status: status,
      date: new Date().toISOString().split('T')[0],
      notes: notes
    };

    onSaveLoan(newLoan);
    resetForm();
  };

  const handleReturnLoan = (loan: BookLoan) => {
    const updatedLoan: BookLoan = {
      ...loan,
      status: 'Dikembalikan',
      notes: loan.notes ? `${loan.notes} (Dikembalikan pada ${formatDateIndo(new Date().toISOString())})` : `Dikembalikan pada ${formatDateIndo(new Date().toISOString())}`
    };
    onSaveLoan(updatedLoan);
  };

  const resetForm = () => {
    setSelectedStudentId('');
    setSelectedBooks([]);
    setQty(1);
    setStatus('Dipinjam');
    setNotes('');
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <Book className="mr-2 text-indigo-600" /> Peminjaman Buku Paket
          </h2>
          <p className="text-gray-500">Kelola peminjaman buku paket siswa per mata pelajaran.</p>
        </div>
        <button 
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-all"
        >
          {isFormOpen ? <ChevronUp size={18} /> : <Plus size={18} />}
          <span>{isFormOpen ? 'Tutup Form' : 'Input Peminjaman'}</span>
        </button>
      </div>

      {/* Input Form */}
      {isFormOpen && (
        <div className="bg-white p-6 rounded-2xl border border-indigo-100 shadow-md animate-fade-in-down">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Nama Siswa</label>
                <select 
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                >
                  <option value="">Pilih Siswa</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex justify-between items-center">
                  <span>Buku Paket yang Dipinjam</span>
                  <button 
                    type="button"
                    onClick={handleSelectAllBooks}
                    className="text-xs text-indigo-600 hover:underline"
                  >
                    {selectedBooks.length === subjects.length ? 'Hapus Semua' : 'Pilih Semua'}
                  </button>
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border border-gray-100 rounded-lg bg-gray-50">
                  {subjects.map(subject => (
                    <label key={subject.id} className="flex items-center space-x-2 p-2 hover:bg-white rounded cursor-pointer transition-colors">
                      <input 
                        type="checkbox"
                        checked={selectedBooks.includes(subject.name)}
                        onChange={() => handleToggleBook(subject.name)}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-700">{subject.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Jumlah Buku</label>
                  <input 
                    type="number"
                    min="1"
                    value={qty}
                    onChange={(e) => setQty(parseInt(e.target.value))}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Status</label>
                  <select 
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="Dipinjam">Dipinjam</option>
                    <option value="Dikembalikan">Dikembalikan</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Keterangan</label>
                <textarea 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Contoh: Kondisi buku baik, dipinjam untuk semester 1"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none h-24 resize-none"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button 
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold shadow-md hover:bg-indigo-700 transition-all"
                >
                  Simpan Data
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Filter & Search */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text"
            placeholder="Cari nama siswa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter size={18} className="text-gray-400" />
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="p-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
          >
            <option value="Semua">Semua Status</option>
            <option value="Dipinjam">Dipinjam</option>
            <option value="Dikembalikan">Dikembalikan</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-indigo-50 text-indigo-800 font-bold uppercase text-xs">
              <tr>
                <th className="p-4 text-center w-12">No</th>
                <th className="p-4">Siswa</th>
                <th className="p-4">Buku Paket</th>
                <th className="p-4 text-center">Jumlah</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4">Keterangan</th>
                <th className="p-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredLoans.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-400 italic">
                    Belum ada data peminjaman buku.
                  </td>
                </tr>
              ) : (
                filteredLoans.map((loan, idx) => (
                  <tr key={loan.id} className="hover:bg-indigo-50/30 transition-colors">
                    <td className="p-4 text-center text-gray-500 font-mono">{idx + 1}</td>
                    <td className="p-4">
                      <div className="font-bold text-gray-800">{loan.studentName}</div>
                      <div className="text-xs text-gray-500">Pinjam pada {formatDateIndo(loan.date)}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {loan.books.map((book, bIdx) => (
                          <span 
                            key={bIdx} 
                            className="px-2 py-0.5 bg-white border border-indigo-100 text-indigo-700 rounded-full text-[10px] font-medium shadow-sm"
                          >
                            {book}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4 text-center font-bold text-indigo-600">{loan.qty}</td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${
                        loan.status === 'Dipinjam' 
                          ? 'bg-amber-50 text-amber-700 border-amber-200' 
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                        {loan.status === 'Dipinjam' ? <Clock size={12} className="mr-1" /> : <CheckCircle size={12} className="mr-1" />}
                        {loan.status}
                      </span>
                    </td>
                    <td className="p-4 text-gray-600 italic text-xs">
                      {loan.notes || '-'}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        {loan.status === 'Dipinjam' && (
                          <button 
                            onClick={() => handleReturnLoan(loan)}
                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Kembalikan Buku"
                          >
                            <RotateCcw size={18} />
                          </button>
                        )}
                        <button 
                          onClick={() => onDeleteLoan(loan.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Hapus Data"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BookLoanView;


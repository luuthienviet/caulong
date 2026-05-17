import React, { useState } from 'react';

export default function SearchBar({ onSearch }) {
  const [keyword, setKeyword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch({ keyword: keyword.trim() });
  };

  return (
    <div className="search-bar">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="🔍 Tìm sân theo tên..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <button type="submit">Tìm kiếm</button>
        <button type="button" onClick={() => { setKeyword(''); onSearch({ keyword: '' }); }}>Xóa lọc</button>
      </form>
    </div>
  );
}
import React from "react";

const SearchInput = ({ searchQuery, handleSearch, placeholder, readOnly }) => {
  return (
    <input
      type="search"
      className="form-control input-data"
      placeholder={placeholder}
      value={searchQuery}
      onChange={handleSearch}
      readOnly={readOnly}
    />
  );
};

export default SearchInput;
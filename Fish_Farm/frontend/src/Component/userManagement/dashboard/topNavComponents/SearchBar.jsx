import React from 'react';

function SearchBar() {
    return (
        <div className="search-container">
            <input
                type="search"
                name="search"
                placeholder="Search"
                className="search-input"
            />
            <svg
                className="search-icon"
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 16 16"
            >
                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
            </svg>

            <style>{`
                .search-container {
                    position: relative;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    width: 100%;
                    max-width: 400px;
                }

                .search-input {
                    width: 100%;
                    height: 40px;
                    padding: 0 40px 0 15px;
                    border-radius: 8px;
                    border: 1px solid #ccc;
                    font-size: 0.875rem;
                    outline: none;
                    box-sizing: border-box;
                }

                .search-input:focus {
                    border-color: #00b075;
                    box-shadow: 0 0 0 2px rgba(0,176,117,0.2);
                }

                .search-icon {
                    position: absolute;
                    right: 15px;
                    pointer-events: none;
                    color: #4B5563; /* gray-600 */
                }
            `}</style>
        </div>
    );
}

export default SearchBar;

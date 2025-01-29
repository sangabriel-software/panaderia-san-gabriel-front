import { useState, useEffect } from "react";

const useOptionsMenu = () => {
  const [activeOptionsId, setActiveOptionsId] = useState(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close the menu if clicking outside of the active menu
      if (activeOptionsId && !event.target.closest(".options-container")) {
        setActiveOptionsId(null);
      }
    };

    // Add event listener
    document.addEventListener("click", handleClickOutside);

    // Clean up event listener
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [activeOptionsId]);

  const handleOptionsClick = (id, event) => {
    // Prevent immediate closing
    event.stopPropagation();
    setActiveOptionsId(activeOptionsId === id ? null : id);
  };

  return {
    activeOptionsId,
    handleOptionsClick,
  };
};

export default useOptionsMenu;

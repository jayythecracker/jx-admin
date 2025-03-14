import { useState } from "react";

interface PaginationProps {
  totalItems: number;
  itemsPerPage: number;
  initialPage?: number;
}

export function usePagination({ totalItems, itemsPerPage, initialPage = 1 }: PaginationProps) {
  const [currentPage, setCurrentPage] = useState(initialPage);
  
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  
  // Ensure currentPage is always valid
  if (currentPage > totalPages) {
    setCurrentPage(totalPages);
  }
  
  const goToPage = (page: number) => {
    const pageNumber = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(pageNumber);
  };
  
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  // Calculate page range to display (e.g., 1 2 3 ... 10)
  const getPageRange = () => {
    const range: (number | string)[] = [];
    const maxVisiblePages = 5;
    
    // Always show the first page
    range.push(1);
    
    if (totalPages <= maxVisiblePages) {
      // If we have 5 or fewer pages, show all of them
      for (let i = 2; i <= totalPages; i++) {
        range.push(i);
      }
    } else {
      // When we have more than maxVisiblePages, we need to be selective
      
      // Is the current page close to the start?
      if (currentPage <= 3) {
        range.push(2, 3);
        range.push("...");
        range.push(totalPages);
      }
      // Is the current page close to the end?
      else if (currentPage >= totalPages - 2) {
        range.push("...");
        range.push(totalPages - 2, totalPages - 1, totalPages);
      }
      // Current page is somewhere in the middle
      else {
        range.push("...");
        range.push(currentPage - 1, currentPage, currentPage + 1);
        range.push("...");
        range.push(totalPages);
      }
    }
    
    return range;
  };
  
  return {
    currentPage,
    totalPages,
    goToPage,
    nextPage,
    prevPage,
    getPageRange,
    startIndex: (currentPage - 1) * itemsPerPage,
    endIndex: Math.min(currentPage * itemsPerPage - 1, totalItems - 1),
    itemsPerPage
  };
}

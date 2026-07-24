export const mapPage = (pageData, itemMapper) => {
  if (!pageData) {
    return {
      content: [],
      totalPages: 0,
      totalElements: 0,
      hasNext: false,
    };
  }

  // If pageData is just an array, wrap it in a mock Page structure
  if (Array.isArray(pageData)) {
    return {
      content: pageData.map(itemMapper),
      totalPages: 1,
      totalElements: pageData.length,
      hasNext: false,
      number: 0,
      size: pageData.length,
    };
  }

  return {
    content: (pageData.content || []).map(itemMapper),
    totalPages: pageData.totalPages || 0,
    totalElements: pageData.totalElements || 0,
    hasNext: !pageData.last,
    number: pageData.number || 0,
    size: pageData.size || 0,
  };
};

export const mapDate = (dateString) => {
  if (!dateString) return null;
  const parsed = new Date(dateString);
  return isNaN(parsed.getTime()) ? null : parsed;
};

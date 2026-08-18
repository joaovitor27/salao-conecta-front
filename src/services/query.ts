export interface QueryParams {
  [key: string]: any;
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
}

export const buildQueryParams = (params?: QueryParams): string => {
  if (!params) return '';
  const urlParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        urlParams.append(key, value.join(','));
      } else {
        urlParams.append(key, String(value));
      }
    }
  });
  
  const queryString = urlParams.toString();
  return queryString ? `?${queryString}` : '';
};

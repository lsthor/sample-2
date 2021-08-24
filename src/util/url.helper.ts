export const constructUrls = (count: number, limit = 100): string[] => {
  if (count === 0) {
    return [];
  }
  const total = Math.ceil(count / limit);

  return [...Array(total).keys()].map((i) => urlTemplate(limit, i * limit));
};

export const urlTemplate = (limit: number, offset = 0) => {
  return `/v1/public/characters?limit=${limit}&offset=${offset}`;
};

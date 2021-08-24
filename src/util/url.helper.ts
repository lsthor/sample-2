export const constructUrls = (count: number, limit = 100): string[] => {
  if (count === 0) {
    return [];
  }
  const total = Math.ceil(count / limit);

  return [...Array(total).keys()].map(
    (i) => `/v1/public/characters?limit=${limit}&skip=${i * limit}`,
  );
};

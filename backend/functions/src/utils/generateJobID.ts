// src/utils/generateJobId.ts
export const generateJobId = (region: string, field: string, length = 5) => {
  const randomChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let suffix = "";
  for (let i = 0; i < length; i++) {
    suffix += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
  }

  const regionCode = region.slice(0, 3).toUpperCase();

  // Split field into words, take first 3 letters of each, concat
  const fieldCode = field
    .split(" ")
    .map(word => word.slice(0, 3).toUpperCase())
    .join("");

  return `${regionCode}${fieldCode}${suffix}`;
};

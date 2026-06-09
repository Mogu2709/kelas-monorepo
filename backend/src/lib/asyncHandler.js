// Bungkus async route handler agar error otomatis diteruskan ke Express error middleware
// Tanpa ini: kalau Prisma throw, server crash tanpa response

export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

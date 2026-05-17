export const adminMiddleware = (req, res, next) => {
  if (!["admin", "manager", "staff"].includes(req.user.role)) {
    return res.status(403).json({ message: "Không có quyền truy cập quản trị" });
  }
  next();
};
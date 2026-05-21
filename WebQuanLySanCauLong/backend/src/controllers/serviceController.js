import Service from "../models/Service.js";

const initialServices = [
  { name: "Revive Chanh Muối 500ml", category: "Nước uống", price: 15000, stock: 150, desc: "Nước bù khoáng Revive hương chanh muối giúp tiếp thêm sinh lực tức thì.", image: "https://images.unsplash.com/photo-1556881286-fc6915169721?w=500&auto=format&fit=crop&q=80" },
  { name: "Nước suối Aquafina 500ml", category: "Nước uống", price: 8000, stock: 220, desc: "Nước uống đóng chai tinh khiết Aquafina tốt cho sức khỏe.", image: "https://images.unsplash.com/photo-1523362628745-0c100150b504?w=500&auto=format&fit=crop&q=80" },
  { name: "Thuê vợt Yonex Astrox 99", category: "Thuê dụng cụ", price: 50000, stock: 10, desc: "Vợt Yonex Astrox 99 cao cấp dành cho người chơi tấn công mạnh mẽ.", image: "https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=500&auto=format&fit=crop&q=80" },
  { name: "Thuê giày Victor Auraspeed", category: "Thuê dụng cụ", price: 40000, stock: 8, desc: "Giày cầu lông Victor êm ái, bám sân cực tốt đầy đủ size.", image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500&auto=format&fit=crop&q=80" },
  { name: "Hộp cầu lông Thành Công", category: "Phụ kiện", price: 230000, stock: 45, desc: "Hộp 12 quả cầu lông Thành Công chuẩn thi đấu câu lạc bộ.", image: "https://images.unsplash.com/photo-1613918108466-292b78a8ef95?w=500&auto=format&fit=crop&q=80" },
  { name: "Cuốn cán vợt Yonex chống trơn", category: "Phụ kiện", price: 20000, stock: 120, desc: "Cuốn cán vợt cao su non giúp cầm vợt êm tay và thấm hút mồ hôi.", image: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=500&auto=format&fit=crop&q=80" },
  { name: "Bánh mì xúc xích kẹp phô mai", category: "Đồ ăn", price: 25000, stock: 0, desc: "Bánh mì nướng nóng hổi ăn nhẹ phục hồi năng lượng giữa các set đấu.", image: "https://images.unsplash.com/photo-1541214113241-21578d2d9b62?w=500&auto=format&fit=crop&q=80" }
];

// Fetch all services / auto-seed if none
export const getServices = async (req, res, next) => {
  try {
    let services = await Service.find();
    if (services.length === 0) {
      services = await Service.insertMany(initialServices);
    }
    res.status(200).json({ success: true, data: services });
  } catch (err) {
    next(err);
  }
};

// Create new service
export const createService = async (req, res, next) => {
  try {
    const { name, category, price, stock, desc, image } = req.body;
    const newService = await Service.create({ name, category, price, stock, desc, image });
    res.status(201).json({ success: true, data: newService });
  } catch (err) {
    next(err);
  }
};

// Update service
export const updateService = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await Service.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!updated) {
      return res.status(404).json({ success: false, message: "Không tìm thấy dịch vụ/sản phẩm" });
    }
    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

// Delete service
export const deleteService = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await Service.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Không tìm thấy dịch vụ/sản phẩm" });
    }
    res.status(200).json({ success: true, message: "Xóa dịch vụ/sản phẩm thành công" });
  } catch (err) {
    next(err);
  }
};

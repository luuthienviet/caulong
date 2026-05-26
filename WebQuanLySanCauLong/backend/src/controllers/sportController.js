import Sport from "../models/Sport.js";

// Lấy tất cả môn thể thao
export const getSports = async (req, res) => {
  try {
    const sports = await Sport.find().sort({ name: 1 });
    res.status(200).json(sports);
  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy danh sách môn thể thao", error: err.message });
  }
};

// Lấy 1 môn thể thao
export const getSportById = async (req, res) => {
  try {
    const sport = await Sport.findById(req.params.id);
    if (!sport) return res.status(404).json({ message: "Không tìm thấy môn thể thao" });
    res.status(200).json(sport);
  } catch (err) {
    res.status(500).json({ message: "Lỗi", error: err.message });
  }
};

// Tạo môn thể thao mới
export const createSport = async (req, res) => {
  try {
    const { name, code, icon } = req.body;
    
    const existing = await Sport.findOne({ code });
    if (existing) {
      return res.status(400).json({ message: "Mã môn thể thao đã tồn tại" });
    }

    const newSport = new Sport({ name, code, icon });
    await newSport.save();
    res.status(201).json(newSport);
  } catch (err) {
    res.status(500).json({ message: "Lỗi tạo môn thể thao", error: err.message });
  }
};

// Cập nhật môn thể thao
export const updateSport = async (req, res) => {
  try {
    const updated = await Sport.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Không tìm thấy môn thể thao" });
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: "Lỗi cập nhật môn thể thao", error: err.message });
  }
};

// Xóa môn thể thao
export const deleteSport = async (req, res) => {
  try {
    const deleted = await Sport.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Không tìm thấy môn thể thao" });
    res.status(200).json({ message: "Đã xóa môn thể thao" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi xóa môn thể thao", error: err.message });
  }
};

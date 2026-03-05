const Court = require('../models/Court');

// Admin tạo sân
exports.createCourt = async (req, res) => {
  try {
    const { name, pricePerHour } = req.body;

    const court = await Court.create({
      name,
      pricePerHour
    });

    res.status(201).json({ message: 'Tạo sân thành công', court });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Xem danh sách sân
exports.getCourts = async (req, res) => {
  try {
    const courts = await Court.find();
    res.json(courts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin cập nhật sân
exports.updateCourt = async (req, res) => {
  try {
    const court = await Court.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json({ message: 'Cập nhật sân thành công', court });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin xoá sân
exports.deleteCourt = async (req, res) => {
  try {
    await Court.findByIdAndDelete(req.params.id);
    res.json({ message: 'Xoá sân thành công' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const Court = require('../models/Court');

// Lấy danh sách sân
exports.getCourts = async (req, res, next) => {
  try {
    const courts = await Court.find();
    res.status(200).json(courts);
  } catch (error) {
    next(error);
  }
};

// Thêm sân mới
exports.createCourt = async (req, res, next) => {
  try {
    const court = await Court.create(req.body);
    res.status(201).json(court);
  } catch (error) {
    next(error);
  }
};

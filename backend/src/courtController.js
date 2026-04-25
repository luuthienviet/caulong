import Court from "../models/Court.js";

export const getCourts = async (req, res, next) => {
  try {
    const courts = await Court.find();
    res.status(200).json(courts);
  } catch (error) {
    next(error);
  }
};

export const createCourt = async (req, res, next) => {
  try {
    const court = await Court.create(req.body);
    res.status(201).json(court);
  } catch (error) {
    next(error);
  }
};
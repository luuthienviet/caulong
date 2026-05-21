import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Tên dịch vụ/sản phẩm là bắt buộc"],
    trim: true
  },
  category: {
    type: String,
    required: [true, "Danh mục là bắt buộc"],
    enum: ["Nước uống", "Đồ ăn", "Thuê dụng cụ", "Phụ kiện"]
  },
  price: {
    type: Number,
    required: [true, "Giá là bắt buộc"],
    min: [0, "Giá không được nhỏ hơn 0"]
  },
  stock: {
    type: Number,
    required: [true, "Số lượng tồn kho là bắt buộc"],
    min: [0, "Số lượng tồn kho không được nhỏ hơn 0"]
  },
  desc: {
    type: String,
    default: ""
  },
  image: {
    type: String,
    default: ""
  }
}, {
  timestamps: true
});

const Service = mongoose.model("Service", serviceSchema);
export default Service;

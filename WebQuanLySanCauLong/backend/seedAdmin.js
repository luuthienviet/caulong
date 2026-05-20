import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// Kết nối MongoDB
await mongoose.connect(
    "mongodb+srv://caulong:Abc%401234@cluster0.dezz4ov.mongodb.net/?retryWrites=true&w=majority"
);

// Schema User
const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    role: {
        type: String,
        default: "user",
    },
});

const User = mongoose.model("User", userSchema);

async function createAdmin() {
    try {
        const existingAdmin = await User.findOne({
            email: "admin@gmail.com",
        });

        if (existingAdmin) {
            console.log("Admin đã tồn tại");
            process.exit();
        }

        const hashedPassword = await bcrypt.hash("123456", 10);

        const admin = new User({
            name: "Admin",
            email: "admin@gmail.com",
            password: hashedPassword,
            role: "admin",
        });

        await admin.save();

        console.log("Tạo admin thành công!");
        console.log("Email: admin@gmail.com");
        console.log("Password: 123456");

        process.exit();
    } catch (error) {
        console.log(error);
        process.exit();
    }
}

createAdmin();
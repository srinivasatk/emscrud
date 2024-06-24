import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
  employeeId: { type: String, required: true, unique: true },
  empName: { type: String, required: true },
  department: { type: String, required: true },
  salary: { type: Number, required: true }
});

const Employee = mongoose.model('Employee', employeeSchema);

export default Employee;

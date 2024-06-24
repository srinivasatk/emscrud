import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cors from 'cors';
//require('dotenv').config();

const app = express();

//Middleware
app.use(bodyParser.json());
app.use(cors());

// MongoDB connection
// const uri = process.env.MONGODB_URI;

mongoose.connect('mongodb+srv://seenu100babu:TCymtpQIWoXHtzqt@mycluster1.bekzbtz.mongodb.net/employeeDB');
// mongoose.connect(uri);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

//Employee Schema
const employeeSchema = new mongoose.Schema({
  employeeId: { type: String, required: true, unique: true },
  empName: { type: String, required: true },
  department: { type: String, required: true },
  salary: { type: Number, required: true }
});

const Employee = mongoose.model('Employee', employeeSchema);

// Function to generate employee ID in format 'emp_01', 'emp_02', ...
async function generateEmployeeId() {
  const lastEmployee = await Employee.findOne({}, {}, { sort: { 'employeeId': -1 } });
  let newIdNumber = 1;
  if (lastEmployee) {
    const lastId = lastEmployee.employeeId;
    newIdNumber = parseInt(lastId.split('_')[1], 10) + 1;
  }
  return `EMP_${String(newIdNumber).padStart(2, '0')}`;
}

//Routes
//GET Employee list
app.get('/api/employees', async (req, res) => {
  try {
    const employees = await Employee.find();
    res.send(employees);
  } catch (err) {
    res.status(500).send(err);
  }
});
//Post or Add Employee

let isProcessing = false; // Flag to track if a request is being processed

app.post('/api/employees', async (req, res) => {
  if (isProcessing) {
    return res.status(409).send({ message: 'Another request is being processed. Please try again later.' });
  }

  const { empName, department, salary } = req.body;

  try {
    isProcessing = true; // Set processing flag to true
    const employeeId = await generateEmployeeId();
    const newEmployee = new Employee({ employeeId, empName, department, salary });
    const savedEmployee = await newEmployee.save();

    res.status(201).send({ message: 'Employee added successfully', employee: savedEmployee });
  } catch (err) {
    res.status(400).send({  message: 'Error adding employee', error: err.message});
  } finally {
    isProcessing = false; // Reset processing flag after request completes
  }
});

//patch or update the employee info if exist

app.patch('/api/employees/:id', async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['empName', 'department', 'salary'];
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid updates!' });
  }

  try {
    const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!employee) {
      return res.status(404).send({ error: 'Invalid Employee ID' });
    }
    res.send(employee);
  } catch (err) {
    res.status(400).send(err);
  }
});

//Delete Employee if exist
app.delete('/api/employees/:id', async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) {
      return res.status(404).send();
    }
    res.send(employee);
  } catch (err) {
    res.status(500).send(err);
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
})


import express from 'express';
import Employee from './models/employeeModel.js';

const router = express.Router();

// Function to generate employee ID in format 'EMP_01', 'EMP_02', ...
async function generateEmployeeId() {
  const lastEmployee = await Employee.findOne({}, {}, { sort: { 'employeeId': -1 } });
  let newIdNumber = 1;
  if (lastEmployee) {
    const lastId = lastEmployee.employeeId;
    newIdNumber = parseInt(lastId.split('_')[1], 10) + 1;
  }
  return `EMP_${String(newIdNumber).padStart(2, '0')}`;
}

// GET Employee list
router.get('/employees', async (req, res) => {
  try {
    const employees = await Employee.find();
    res.send(employees);
  } catch (err) {
    res.status(500).send(err);
  }
});

// POST or Add Employee
let isProcessing = false; // Flag to track if a request is being processed

router.post('/employees', async (req, res) => {
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
    res.status(400).send({ message: 'Error adding employee', error: err.message });
  } finally {
    isProcessing = false; // Reset processing flag after request completes
  }
});

// PATCH or update the employee info if exists
router.patch('/employees/:id', async (req, res) => {
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

// DELETE Employee if exists
router.delete('/employees/:id', async (req, res) => {
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

export default router;

const express = require('express');
const router = express.Router();
const {
  registerPatient,
  getAllPatients,
  getDueTodayPatients,
  getPatientById,
  updatePatient,
  markFollowUpCompleted
} = require('../controllers/patientController');
const { validatePatient } = require('../middleware/validatePatient');

// Patient routes
router.post('/', validatePatient, registerPatient);
router.get('/', getAllPatients);
router.get('/due-today', getDueTodayPatients);
router.get('/:id', getPatientById);
router.put('/:id', validatePatient, updatePatient);
router.patch('/:id/complete', markFollowUpCompleted);

module.exports = router;


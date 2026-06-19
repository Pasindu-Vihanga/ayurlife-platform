import Prescription from '../models/Prescription.js';
import Appointment from '../models/Appointment.js';

// @desc    Create new prescription
// @route   POST /api/prescriptions
// @access  Private (Doctor)
const createPrescription = async (req, res) => {
    const { appointmentId, medicines, instructions } = req.body;

    try {
        const appointment = await Appointment.findById(appointmentId).populate('patient');

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        if (appointment.doctor.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const prescription = new Prescription({
            appointment: appointmentId,
            doctor: req.user._id,
            patient: appointment.patient._id,
            medicines,
            instructions
        });

        const createdPrescription = await prescription.save();

        // Update appointment status to completed
        appointment.status = 'completed';
        await appointment.save();

        res.status(201).json(createdPrescription);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get prescription by ID
// @route   GET /api/prescriptions/:id
// @access  Private (Doctor, Patient)
const getPrescriptionById = async (req, res) => {
    try {
        const prescription = await Prescription.findById(req.params.id)
            .populate('doctor', 'name email')
            .populate('patient', 'name email')
            .populate('appointment');

        if (prescription) {
            // Check authorization (only doctor or patient involved)
            if (
                req.user.role === 'admin' ||
                prescription.doctor._id.toString() === req.user._id.toString() ||
                prescription.patient._id.toString() === req.user._id.toString()
            ) {
                res.json(prescription);
            } else {
                res.status(401).json({ message: 'Not authorized to view this prescription' });
            }
        } else {
            res.status(404).json({ message: 'Prescription not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get prescriptions by patient ID (for Doctors/Admin)
// @route   GET /api/prescriptions/patient/:patientId
// @access  Private (Doctor, Admin)
const getPrescriptionsByPatient = async (req, res) => {
    try {
        const prescriptions = await Prescription.find({ patient: req.params.patientId })
            .populate('doctor', 'name')
            .sort({ createdAt: -1 });
        res.json(prescriptions);
    } catch (error) {
        console.error('getPrescriptionsByPatient error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get my prescriptions (Patient or Doctor)
// @route   GET /api/prescriptions/my
// @access  Private
const getMyPrescriptions = async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'doctor') {
            query = { doctor: req.user._id };
        } else {
            query = { patient: req.user._id };
        }

        const prescriptions = await Prescription.find(query)
            .populate('doctor', 'name')
            .populate('patient', 'name')
            .sort({ createdAt: -1 });
        res.json(prescriptions);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

export { createPrescription, getPrescriptionById, getMyPrescriptions, getPrescriptionsByPatient };

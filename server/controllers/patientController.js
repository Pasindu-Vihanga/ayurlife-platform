import Patient from '../models/Patient.js';
import User from '../models/User.js';

// @desc    Get current patient profile
// @route   GET /api/patients/me
// @access  Private (Patient)
const getPatientProfile = async (req, res) => {
    try {
        const patient = await Patient.findOne({ user: req.user._id }).populate('user', 'name email');

        if (patient) {
            res.json(patient);
        } else {
            // Return 200 with null to avoid console errors for new users
            res.status(200).json({});
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create or Update patient profile
// @route   POST /api/patients
// @access  Private (Patient)
const updatePatientProfile = async (req, res) => {
    const { prakruthi } = req.body;

    try {
        let patient = await Patient.findOne({ user: req.user._id });

        if (patient) {
            // Update
            patient.prakruthi = prakruthi || patient.prakruthi;
            const updatedPatient = await patient.save();
            res.json(updatedPatient);
        } else {
            // Create
            patient = new Patient({
                user: req.user._id,
                prakruthi: prakruthi || 'Unknown',
                history: [],
                symptoms: []
            });
            const createdPatient = await patient.save();
            res.status(201).json(createdPatient);
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Add a symptom log
// @route   POST /api/patients/symptoms
// @access  Private (Patient)
const addSymptomLog = async (req, res) => {
    const { symptomName, severity, duration, notes } = req.body;

    try {
        let patient = await Patient.findOne({ user: req.user._id });

        if (!patient) {
            // Create a new patient profile if it doesn't exist
            patient = new Patient({
                user: req.user._id,
                prakruthi: 'Unknown',
                history: [],
                symptoms: []
            });
        }

        const newSymptom = {
            symptomName,
            severity,
            duration,
            notes,
            date: Date.now()
        };

        patient.symptoms.push(newSymptom);
        await patient.save();
        res.json(patient.symptoms);
    } catch (error) {
        console.error('addSymptomLog error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete a symptom log
// @route   DELETE /api/patients/symptoms/:index
// @access  Private (Patient)
const deleteSymptomLog = async (req, res) => {
    const { index } = req.params;

    try {
        const patient = await Patient.findOne({ user: req.user._id });

        if (patient) {
            const symptomIndex = parseInt(index);

            if (symptomIndex >= 0 && symptomIndex < patient.symptoms.length) {
                patient.symptoms.splice(symptomIndex, 1);
                await patient.save();
                res.json(patient.symptoms);
            } else {
                res.status(400).json({ message: 'Invalid symptom index' });
            }
        } else {
            res.status(404).json({ message: 'Patient profile not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get all patients (for doctors)
// @route   GET /api/doctors/patients
// @access  Private (Doctor)
const getPatients = async (req, res) => {
    try {
        const patients = await Patient.find({}).populate('user', 'name email');
        res.json(patients);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get patient by ID (for doctors)
// @route   GET /api/doctors/patients/:id
// @access  Private (Doctor)
const getPatientById = async (req, res) => {
    try {
        // Find by the Patient model's ID or the User ID?
        // Let's support both or just Patient ID for consistency
        let patient = await Patient.findById(req.params.id).populate('user', 'name email');
        
        if (!patient) {
            // Also try searching by user ID
            patient = await Patient.findOne({ user: req.params.id }).populate('user', 'name email');
        }

        if (patient) {
            res.json(patient);
        } else {
            res.status(404).json({ message: 'Patient not found' });
        }
    } catch (error) {
        console.error('getPatientById error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

export { getPatientProfile, updatePatientProfile, addSymptomLog, deleteSymptomLog, getPatients, getPatientById };

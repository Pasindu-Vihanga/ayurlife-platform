import Appointment from '../models/Appointment.js';
import Doctor from '../models/Doctor.js';

// @desc    Book an appointment
// @route   POST /api/appointments
// @access  Private (Patient)
const bookAppointment = async (req, res) => {
    const { doctorId, date, time, reason } = req.body;

    console.log('Book Appointment Request:', { doctorId, date, time, reason, patient: req.user._id });
    try {
        const appointment = new Appointment({
            patient: req.user._id,
            doctor: doctorId, // Expecting User ID of the doctor
            date,
            time,
            reason,
            paymentStatus: req.body.paymentStatus || 'pending',
            paymentMethod: req.body.paymentMethod,
            amount: req.body.amount,
            transactionId: req.body.transactionId
        });

        const createdAppointment = await appointment.save();
        res.status(201).json(createdAppointment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get my appointments (Patient)
// @route   GET /api/appointments/my
// @access  Private (Patient)
const getMyAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find({ patient: req.user._id })
            .populate('doctor', 'name email')
            .sort({ date: 1 }); // Sort ascending (closest first)
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get doctor appointments
// @route   GET /api/appointments/doctor
// @access  Private (Doctor)
const getDoctorAppointments = async (req, res) => {
    try {
        console.log('Fetching appointments for Doctor (User ID):', req.user._id);
        const appointments = await Appointment.find({ doctor: req.user._id })
            .populate('patient', 'name email')
            .sort({ date: 1 });
        console.log(`Found ${appointments.length} appointments for this doctor.`);
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update appointment status
// @route   PUT /api/appointments/:id/status
// @access  Private (Doctor)
const updateAppointmentStatus = async (req, res) => {
    const { status } = req.body;
    try {
        const appointment = await Appointment.findById(req.params.id);
        if (appointment) {
            // Check if doctor is the one assigned
            if (appointment.doctor.toString() !== req.user._id.toString()) {
                return res.status(401).json({ message: 'Not authorized' });
            }
            appointment.status = status || appointment.status;
            const updatedAppointment = await appointment.save();
            res.json(updatedAppointment);
        } else {
            res.status(404).json({ message: 'Appointment not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get booked slots for a doctor on a specific date
// @route   GET /api/appointments/doctor/:id/booked-slots
// @access  Public (or authenticated)
const getBookedSlots = async (req, res) => {
    try {
        const { date } = req.query;
        const doctorId = req.params.id;
        
        if (!date) {
            return res.status(400).json({ message: 'Date is required' });
        }

        const appointments = await Appointment.find({ 
            doctor: doctorId, 
            date, 
            status: { $ne: 'cancelled' } // assume cancelled appointments free up the slot
        });
        
        const bookedSlots = appointments.map(app => app.time);
        res.json(bookedSlots);
    } catch (error) {
        console.error('Error fetching booked slots:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

export { bookAppointment, getMyAppointments, getDoctorAppointments, updateAppointmentStatus, getBookedSlots };

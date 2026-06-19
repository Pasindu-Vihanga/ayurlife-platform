import { Therapy, Booking } from '../models/Wellness.js';

// --- THERAPIES ---

// @desc    Get all therapies
// @route   GET /api/wellness/therapies
// @access  Public
const getTherapies = async (req, res) => {
    try {
        const filter = {};
        if (req.user && req.user.role === 'wellness_staff') {
            filter.createdBy = req.user._id;
        }
        const therapies = await Therapy.find(filter);
        res.json(therapies);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create new therapy service
// @route   POST /api/wellness/therapies
// @access  Private (Wellness Staff, Admin)
const createTherapy = async (req, res) => {
    const { name, description, durationMinutes, price, image, category, requiredRooms, careInstructions } = req.body;

    try {
        const therapy = new Therapy({
            name,
            description,
            durationMinutes,
            price,
            image,
            category,
            requiredRooms,
            careInstructions,
            createdBy: req.user._id
        });

        const createdTherapy = await therapy.save();
        res.status(201).json(createdTherapy);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// --- BOOKINGS ---

// @desc    Book a therapy
// @route   POST /api/wellness/bookings
// @access  Private (Patient)
const bookTherapy = async (req, res) => {
    const { therapyId, date, time, notes, paymentMethod } = req.body;

    try {
        const therapy = await Therapy.findById(therapyId);
        if (!therapy) {
            return res.status(404).json({ message: 'Therapy not found' });
        }

        // 1. Past date check
        const bookingDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (bookingDate < today) {
            return res.status(400).json({ message: 'Cannot book sessions in the past' });
        }

        // 2. Conflict check (Same therapy, same date, same time)
        const existingBooking = await Booking.findOne({
            therapy: therapyId,
            date: bookingDate,
            time: time,
            status: { $ne: 'cancelled' }
        });

        if (existingBooking) {
            return res.status(400).json({ message: 'This time slot is already booked for this therapy' });
        }

        const booking = new Booking({
            patient: req.user._id,
            therapy: therapyId,
            date: bookingDate,
            time,
            notes,
            therapist: therapy.createdBy, // Auto-assign to the creator of the therapy
            amount: therapy.price,
            paymentMethod: paymentMethod || 'Cash',
            paymentStatus: paymentMethod === 'Card' ? 'paid' : 'pending'
        });

        const createdBooking = await booking.save();
        res.status(201).json(createdBooking);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get bookings for staff
// @route   GET /api/wellness/bookings
// @access  Private (Wellness Staff)
const getBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ therapist: req.user._id })
            .populate('patient', 'name email')
            .populate('therapy')
            .sort({ date: 1 });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update booking status
// @route   PUT /api/wellness/bookings/:id
// @access  Private (Wellness Staff)
const updateBookingStatus = async (req, res) => {
    const { status, therapistId, roomNumber, assignedTherapistName } = req.body;

    try {
        const booking = await Booking.findById(req.params.id);

        if (booking) {
            booking.status = status || booking.status;
            if (therapistId) booking.therapist = therapistId;
            if (roomNumber) booking.roomNumber = roomNumber;
            if (assignedTherapistName) booking.assignedTherapistName = assignedTherapistName;

            const updatedBooking = await booking.save();
            res.json(updatedBooking);
        } else {
            res.status(404).json({ message: 'Booking not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get bookings for logged in patient
// @route   GET /api/wellness/my-bookings
// @access  Private (Patient)
const getMyWellnessBookings = async (req, res) => {
    try {
        let filter = { patient: req.user._id };

        if (req.user.role === 'wellness_staff') {
            filter = { therapist: req.user._id };
        }

        const bookings = await Booking.find(filter)
            .populate('patient', 'name email')
            .populate('therapy')
            .sort({ date: 1 });

        // Always return 200, empty array if none found
        res.status(200).json(bookings || []);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update therapy service
// @route   PUT /api/wellness/therapies/:id
// @access  Private (Wellness Staff, Admin)
const updateTherapy = async (req, res) => {
    const { name, description, durationMinutes, price, image, category, requiredRooms, careInstructions } = req.body;

    try {
        const therapy = await Therapy.findById(req.params.id);

        if (therapy) {
            therapy.name = name || therapy.name;
            therapy.description = description || therapy.description;
            therapy.durationMinutes = durationMinutes || therapy.durationMinutes;
            therapy.price = price || therapy.price;
            therapy.image = image !== undefined ? image : therapy.image;
            therapy.category = category || therapy.category;
            therapy.requiredRooms = requiredRooms || therapy.requiredRooms;
            therapy.careInstructions = careInstructions !== undefined ? careInstructions : therapy.careInstructions;

            const updatedTherapy = await therapy.save();
            res.json(updatedTherapy);
        } else {
            res.status(404).json({ message: 'Therapy not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete therapy service
// @route   DELETE /api/wellness/therapies/:id
// @access  Private (Wellness Staff, Admin)
const deleteTherapy = async (req, res) => {
    try {
        const therapy = await Therapy.findById(req.params.id);

        if (therapy) {
            await therapy.deleteOne();
            res.json({ message: 'Therapy removed' });
        } else {
            res.status(404).json({ message: 'Therapy not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Check booked slots for a therapy and date
// @route   GET /api/wellness/slots
// @access  Private
const checkBookedSlots = async (req, res) => {
    const { therapyId, date } = req.query;

    try {
        const bookings = await Booking.find({
            therapy: therapyId,
            date: new Date(date),
            status: { $ne: 'cancelled' }
        }).select('time');

        const bookedTimes = bookings.map(b => b.time);
        res.json(bookedTimes);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

export { getTherapies, createTherapy, bookTherapy, getBookings, updateBookingStatus, getMyWellnessBookings, updateTherapy, deleteTherapy, checkBookedSlots };

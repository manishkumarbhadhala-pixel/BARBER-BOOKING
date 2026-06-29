const { Appointment, Service, WorkingHours, User } = require('../models');
const { Op } = require('sequelize');

const timeToMinutes = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

// GET /api/appointments/available-slots
const getAvailableSlots = async (req, res) => {
  try {
    const { serviceId, date, barberId } = req.query;

    if (!barberId) {
      return res.status(400).json({ message: 'Please select a barber' });
    }

    const service = await Service.findByPk(serviceId);
    if (!service) return res.status(404).json({ message: 'Service not found' });

    const workingHours = await WorkingHours.findOne({
      where: { barberId }
    });

    if (!workingHours) {
      return res.status(404).json({ 
        message: 'This barber has not set working hours' 
      });
    }

    // Off day check
    const dayOfWeek = new Date(date).getDay();
    const offDays = workingHours.offDays
      ? workingHours.offDays.split(',').map(Number)
      : [];

    if (offDays.includes(dayOfWeek)) {
      return res.json({ slots: [], message: 'Shop is closed on this day!' });
    }

    const startMin = timeToMinutes(workingHours.startTime);
    const endMin = timeToMinutes(workingHours.endTime);
    const duration = service.durationMinutes;

    const breakStartMin = workingHours.breakStart
      ? timeToMinutes(workingHours.breakStart) : null;
    const breakEndMin = workingHours.breakEnd
      ? timeToMinutes(workingHours.breakEnd) : null;

    // Us barber ki existing bookings
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const existing = await Appointment.findAll({
      where: {
        barberId,
        slotStart: { [Op.between]: [startOfDay, endOfDay] },
        isCancelled: false,
      },
    });

    // Slots generate karo
    const slots = [];
    let current = startMin;

    while (current + duration <= endMin) {
      // Break time check
      let inBreak = false;
      if (breakStartMin !== null && breakEndMin !== null) {
        if (current < breakEndMin && current + duration > breakStartMin) {
          inBreak = true;
          current = breakEndMin;
          continue;
        }
      }

      const slotStart = new Date(date);
      slotStart.setHours(Math.floor(current / 60), current % 60, 0, 0);
      const slotEnd = new Date(slotStart);
      slotEnd.setMinutes(slotEnd.getMinutes() + duration);

      // Check overlap
      const conflictingBooking = existing.find(
        (a) => slotStart < new Date(a.slotEnd) && slotEnd > new Date(a.slotStart)
      );

      if (conflictingBooking) {
        // Booked slot ke end time se aage jao
        const bookedEndHour = new Date(conflictingBooking.slotEnd).getHours();
        const bookedEndMin = new Date(conflictingBooking.slotEnd).getMinutes();
        current = bookedEndHour * 60 + bookedEndMin;
      } else {
        slots.push({
          startTime: `${String(Math.floor(current / 60)).padStart(2, '0')}:${String(current % 60).padStart(2, '0')}`,
          endTime: `${String(Math.floor((current + duration) / 60)).padStart(2, '0')}:${String((current + duration) % 60).padStart(2, '0')}`,
          slotStart,
          slotEnd,
          isAvailable: true,
        });
        current += duration;
      }
    }

    res.json({ slots });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/appointments/all-busy-slots
const getAllBusySlots = async (req, res) => {
  try {
    const date = req.query.date || new Date().toISOString().split('T')[0];
    const { barberId } = req.query;

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const whereClause = {
      slotStart: { [Op.between]: [startOfDay, endOfDay] },
      isCancelled: false,
    };

    if (barberId) whereClause.barberId = barberId;

    const appointments = await Appointment.findAll({
      where: whereClause,
      attributes: ['slotStart', 'slotEnd', 'serviceName'],
    });

    res.json({ busySlots: appointments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/appointments/book
const bookAppointment = async (req, res) => {
  const { serviceId, slotStart, slotEnd, barberId } = req.body;
  try {
    const service = await Service.findByPk(serviceId);
    if (!service) return res.status(404).json({ message: 'Service not found' });

    if (!barberId) {
      return res.status(400).json({ message: 'Please select a barber' });
    }

    // Slot conflict check
    const conflict = await Appointment.findOne({
      where: {
        barberId,
        slotStart: { [Op.lt]: new Date(slotEnd) },
        slotEnd: { [Op.gt]: new Date(slotStart) },
        isCancelled: false,
      },
    });
    if (conflict) return res.status(400).json({ message: 'This slot is already booked' });

    const appointment = await Appointment.create({
      customerId: req.user.id,
      customerName: req.user.name,
      serviceId,
      serviceName: service.displayName,
      slotStart: new Date(slotStart),
      slotEnd: new Date(slotEnd),
      barberId,
      shopId: req.user.shopId, // Customer ki shop
      bookedBy: 'customer',
    });

    res.status(201).json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/appointments/my-appointment
const getMyAppointment = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const appointments = await Appointment.findAll({
      where: {
        customerId: req.user.id,
        slotStart: { [Op.gte]: today },
        isCancelled: false,
      },
      include: [
        { 
          model: Service, 
          as: 'service', 
          attributes: ['displayName', 'price', 'durationMinutes'] 
        },
        { 
          model: User, 
          as: 'barber', 
          attributes: ['name'] 
        },
      ],
      order: [['slotStart', 'ASC']],
    });

    res.json({ appointments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/appointments/:id/cancel
const cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (appointment.customerId !== req.user.id) {
      return res.status(403).json({ message: 'This is not your booking' });
    }

    appointment.isCancelled = true;
    await appointment.save();
    res.json({ message: 'Appointment cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAvailableSlots,
  getAllBusySlots,
  bookAppointment,
  getMyAppointment,
  cancelAppointment,
};
const { Service, WorkingHours, Appointment, User } = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../config/db');

// GET /api/admin/services
const getServices = async (req, res) => {
  try {
    const services = await Service.findAll({
      where: { barberId: req.user.id }
    });
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/admin/services
const addService = async (req, res) => {
  const { name, displayName, price, durationMinutes } = req.body;
  try {
    const exists = await Service.findOne({ 
      where: { name, barberId: req.user.id } 
    });
    if (exists) {
      return res.status(400).json({ message: 'Service with this name already exists' });
    }

    const service = await Service.create({
      name,
      displayName,
      price,
      durationMinutes,
      barberId: req.user.id,
    });
    res.status(201).json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/admin/services/:id
const updateService = async (req, res) => {
  const { price, durationMinutes, displayName } = req.body;
  try {
    const service = await Service.findOne({
      where: { id: req.params.id, barberId: req.user.id }
    });
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    if (price !== undefined) service.price = price;
    if (durationMinutes !== undefined) service.durationMinutes = durationMinutes;
    if (displayName !== undefined) service.displayName = displayName;

    await service.save();
    res.json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/admin/services/:id
const deleteService = async (req, res) => {
  try {
    const service = await Service.findOne({
      where: { id: req.params.id, barberId: req.user.id }
    });
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    
    await Appointment.update(
      { isCancelled: true },
      { where: { serviceId: req.params.id } }
    );

    await service.destroy();
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');

    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    res.status(500).json({ message: error.message });
  }
};

// GET /api/admin/working-hours
const getWorkingHours = async (req, res) => {
  try {
    const hours = await WorkingHours.findOne({
      where: { barberId: req.user.id }
    });
    res.json(hours);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/admin/working-hours
const updateWorkingHours = async (req, res) => {
  const { startTime, endTime, breakStart, breakEnd, offDays } = req.body;
  try {
    let hours = await WorkingHours.findOne({
      where: { barberId: req.user.id }
    });

    if (!hours) {
      hours = await WorkingHours.create({
        startTime, endTime, breakStart, breakEnd,
        offDays: offDays ? offDays.join(',') : '0',
        barberId: req.user.id,
      });
    } else {
      if (startTime) hours.startTime = startTime;
      if (endTime) hours.endTime = endTime;
      if (breakStart !== undefined) hours.breakStart = breakStart;
      if (breakEnd !== undefined) hours.breakEnd = breakEnd;
      if (offDays) hours.offDays = offDays.join(',');
      await hours.save();
    }

    res.json(hours);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// FIXED: GET /api/admin/appointments (With IST Timezone Fix)
const getAppointments = async (req, res) => {
  try {
    const dateStr = req.query.date || 
      new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });

    // IST timezone (+05:30) explicitly set
    const startOfDay = new Date(`${dateStr}T00:00:00+05:30`);
    const endOfDay = new Date(`${dateStr}T23:59:59+05:30`);

    const appointments = await Appointment.findAll({
      where: {
        barberId: req.user.id,
        shopId: req.user.shopId,
        slotStart: { [Op.between]: [startOfDay, endOfDay] },
        isCancelled: false,
      },
      include: [{ 
        model: Service, 
        as: 'service', 
        attributes: ['displayName', 'price'] 
      }],
      order: [['slotStart', 'ASC']],
    });

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/admin/appointments/:id/complete
const markComplete = async (req, res) => {
  try {
    const appointment = await Appointment.findOne({
      where: { id: req.params.id, barberId: req.user.id }
    });
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    appointment.isCompleted = !appointment.isCompleted;
    await appointment.save();
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/admin/appointments/book
const adminBookAppointment = async (req, res) => {
  const { customerName, serviceId, slotStart, slotEnd } = req.body;
  try {
    if (!customerName || !serviceId || !slotStart || !slotEnd) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const service = await Service.findOne({
      where: { id: serviceId, barberId: req.user.id }
    });
    if (!service) return res.status(404).json({ message: 'Service not found' });

    const conflict = await Appointment.findOne({
      where: {
        barberId: req.user.id,
        slotStart: { [Op.lt]: new Date(slotEnd) },
        slotEnd: { [Op.gt]: new Date(slotStart) },
        isCancelled: false,
      },
    });
    if (conflict) return res.status(400).json({ message: 'This slot is already booked' });

    const appointment = await Appointment.create({
      customerId: req.user.id,
      customerName,
      serviceId,
      serviceName: service.displayName,
      slotStart: new Date(slotStart),
      slotEnd: new Date(slotEnd),
      barberId: req.user.id,
      shopId: req.user.shopId,
      bookedBy: 'admin',
    });

    res.status(201).json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/admin/appointments/:id
const adminCancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findOne({
      where: { id: req.params.id, barberId: req.user.id }
    });
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    
    appointment.isCancelled = true;
    await appointment.save();
    res.json({ message: 'Appointment cancelled' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// FIXED: GET /api/admin/income (IST Compatible)
const getDailyIncome = async (req, res) => {
  try {
    const dateStr = req.query.date || 
      new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });

    const startOfDay = new Date(`${dateStr}T00:00:00+05:30`);
    const endOfDay = new Date(`${dateStr}T23:59:59+05:30`);

    const completedAppointments = await Appointment.findAll({
      where: {
        barberId: req.user.id,
        isCompleted: true,
        slotStart: { [Op.between]: [startOfDay, endOfDay] },
      },
      include: [{
        model: Service,
        as: 'service',
        attributes: ['displayName', 'price'],
      }],
      order: [['slotStart', 'ASC']],
    });

    let totalIncome = 0;
    const serviceBreakdown = {};

    completedAppointments.forEach((appt) => {
      const price = parseFloat(appt.service?.price || 0);
      const serviceName = appt.serviceName;
      totalIncome += price;

      if (serviceBreakdown[serviceName]) {
        serviceBreakdown[serviceName].count += 1;
        serviceBreakdown[serviceName].total += price;
      } else {
        serviceBreakdown[serviceName] = {
          count: 1,
          price: price,
          total: price,
        };
      }
    });

    res.json({
      date: dateStr,
      totalIncome,
      completedCount: completedAppointments.length,
      breakdown: serviceBreakdown,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/admin/income/monthly
const getMonthlyIncome = async (req, res) => {
  try {
    const { month, year } = req.query;
    const m = parseInt(month) || new Date().getMonth() + 1;
    const y = parseInt(year) || new Date().getFullYear();

    // Month ki pehli aur last date
    const startDate = new Date(`${y}-${String(m).padStart(2, '0')}-01T00:00:00+05:30`);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);
    endDate.setMilliseconds(-1);

    const appointments = await Appointment.findAll({
      where: {
        barberId: req.user.id,
        isCompleted: true,
        slotStart: { [Op.between]: [startDate, endDate] },
      },
      include: [{
        model: Service,
        as: 'service',
        attributes: ['displayName', 'price'],
      }],
      order: [['slotStart', 'ASC']],
    });

    let totalIncome = 0;
    const serviceBreakdown = {};
    const dayWise = {};

    appointments.forEach((appt) => {
      const price = parseFloat(appt.service?.price || 0);
      const serviceName = appt.serviceName;
      const day = new Date(appt.slotStart).toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });

      totalIncome += price;

      // Service breakdown
      if (serviceBreakdown[serviceName]) {
        serviceBreakdown[serviceName].count += 1;
        serviceBreakdown[serviceName].total += price;
      } else {
        serviceBreakdown[serviceName] = { count: 1, price, total: price };
      }

      // Day wise
      if (dayWise[day]) {
        dayWise[day].count += 1;
        dayWise[day].total += price;
      } else {
        dayWise[day] = { count: 1, total: price };
      }
    });

    res.json({
      month: m,
      year: y,
      totalIncome,
      completedCount: appointments.length,
      breakdown: serviceBreakdown,
      dayWise,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/admin/upi-settings — Naya function add kiya
const getUpiSettings = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['upiId', 'upiEnabled'],
    });
    res.json({ upiId: user.upiId, upiEnabled: user.upiEnabled });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/admin/upi-settings — Naya function add kiya
const updateUpiSettings = async (req, res) => {
  const { upiId, upiEnabled } = req.body;
  try {
    const user = await User.findByPk(req.user.id);
    if (upiId !== undefined) user.upiId = upiId;
    if (upiEnabled !== undefined) user.upiEnabled = upiEnabled;
    await user.save();
    res.json({ upiId: user.upiId, upiEnabled: user.upiEnabled });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// module.exports me dono functions mapping add ho gayi h
module.exports = {
  getServices, addService, updateService, deleteService,
  getWorkingHours, updateWorkingHours,
  getAppointments, markComplete,
  adminBookAppointment, adminCancelAppointment,
  getDailyIncome, getMonthlyIncome,
  getUpiSettings, updateUpiSettings,
};
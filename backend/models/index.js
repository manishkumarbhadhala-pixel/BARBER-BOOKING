const { sequelize } = require('../config/db');
const User = require('./User');
const Service = require('./Service'); 
const WorkingHours = require('./WorkingHours');
const Appointment = require('./Appointment');
const AdminRequest = require('./AdminRequest');
const PasswordReset = require('./PasswordReset');
const Shop = require('./Shop');
const Announcement = require('./Announcement'); 
const Note = require('./Note'); // ← Note Model Import kiya
const Message = require('./Message');
const QuickNote = require('./QuickNote'); // ← QuickNote Import kiya

// =============================================
// RELATIONS DEFINE KARO
// =============================================

// 1. Customer Relation (User <-> Appointment)
User.hasMany(Appointment, { foreignKey: 'customer_id' });
Appointment.belongsTo(User, { foreignKey: 'customer_id', as: 'customer' });

// 2. Service Relation (Service <-> Appointment)
Service.hasMany(Appointment, { foreignKey: 'service_id' });
Appointment.belongsTo(Service, { foreignKey: 'service_id', as: 'service' });

// 3. Barber Relation (User <-> Appointment)
User.hasMany(Appointment, { foreignKey: 'barber_id', as: 'barberAppointments' });
Appointment.belongsTo(User, { foreignKey: 'barber_id', as: 'barber' });

// 4. Service — Barber Relation (User <-> Service)
User.hasMany(Service, { foreignKey: 'barber_id', as: 'services' });
Service.belongsTo(User, { foreignKey: 'barber_id', as: 'barber' });

// 5. WorkingHours — Barber Relation (User <-> WorkingHours)
User.hasMany(WorkingHours, { foreignKey: 'barber_id', as: 'workingHours' });
WorkingHours.belongsTo(User, { foreignKey: 'barber_id', as: 'barber' });

// 6. Shop Relations (Shop <-> User & Shop <-> Appointment)
Shop.hasMany(User, { foreignKey: 'shop_id', as: 'members' });
User.belongsTo(Shop, { foreignKey: 'shop_id', as: 'shop' });

Shop.hasMany(Appointment, { foreignKey: 'shop_id', as: 'appointments' });
Appointment.belongsTo(Shop, { foreignKey: 'shop_id', as: 'shop' });

// 7. Announcement Relation (SuperAdmin <-> Announcement)
// created_by column announcements table mein SuperAdmin ki ID store karega
User.hasMany(Announcement, { foreignKey: 'created_by', as: 'announcements' });
Announcement.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

// 8. Note Relation (User <-> Note) ← Naya Relation Add kiya
User.hasMany(Note, { foreignKey: 'user_id', as: 'notes' });
Note.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(Message, { foreignKey: 'sender_id', as: 'sentMessages' });
User.hasMany(Message, { foreignKey: 'receiver_id', as: 'receivedMessages' });
Message.belongsTo(User, { foreignKey: 'sender_id', as: 'sender' });
Message.belongsTo(User, { foreignKey: 'receiver_id', as: 'receiver' });

// 9. QuickNote Relation (User <-> QuickNote) ← Naya Relation Add kiya
User.hasOne(QuickNote, { foreignKey: 'user_id', as: 'quickNote' });
QuickNote.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// =============================================

module.exports = { 
  sequelize, 
  User, 
  Service, 
  WorkingHours, 
  Appointment, 
  AdminRequest,
  PasswordReset,
  Shop,
  Announcement,
  Note, // ← Export mein add kiya
  Message,
  QuickNote // ← Export mein add kiya
};
const express = require('express');
const cors = require('cors');
const path = require('path');
const sequelize = require('./util/database');
const Slot = require('./models/slot');
const Meeting = require('./models/Meeting');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Define Relationships
Slot.hasMany(Meeting, { onDelete: 'CASCADE' });
Meeting.belongsTo(Slot);

// Helper function to generate Google Meet link
function generateMeetLink() {
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  const rand = (len) => Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `https://meet.google.com/${rand(3)}-${rand(4)}-${rand(3)}`;
}

// Routes
// 1. Get all time slots
app.get('/api/slots', async (req, res) => {
  try {
    const slots = await Slot.findAll({ order: [['id', 'ASC']] });
    res.json(slots);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Get all scheduled meetings
app.get('/api/meetings', async (req, res) => {
  try {
    const meetings = await Meeting.findAll({ include: Slot });
    res.json(meetings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Book a meeting
app.post('/api/book', async (req, res) => {
  const { name, email, slotId } = req.body;

  if (!name || !email || !slotId) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    const slot = await Slot.findByPk(slotId);
    if (!slot || slot.available <= 0) {
      return res.status(400).json({ error: 'Slot not available.' });
    }

    // Create meeting & update slot capacity
    const meeting = await Meeting.create({
      name,
      email,
      meetLink: generateMeetLink(),
      SlotId: slotId,
    });

    slot.available -= 1;
    await slot.save();

    res.status(201).json(meeting);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Cancel/Delete a meeting
app.delete('/api/meetings/:id', async (req, res) => {
  try {
    const meeting = await Meeting.findByPk(req.params.id);
    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found.' });
    }

    const slot = await Slot.findByPk(meeting.SlotId);
    if (slot) {
      slot.available += 1;
      await slot.save();
    }

    await meeting.destroy();
    res.json({ message: 'Meeting canceled successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Database Sync and Default Seeding
sequelize.sync().then(async () => {
  const count = await Slot.count();
  if (count === 0) {
    await Slot.bulkCreate([
      { time: '2:00 PM', available: 3 },
      { time: '2:30 PM', available: 4 },
      { time: '3:00 PM', available: 2 },
      { time: '3:30 PM', available: 4 },
    ]);
  }
  app.listen(3000, () => console.log('Server running on http://localhost:3000'));
});
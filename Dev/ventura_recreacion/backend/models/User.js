// backend/models/User.js
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    availability: { type: [String], default: [] },
    incentives: { type: Number, default: 0 }, // Campo para incentivos
});

// backend/userRoutes.js
router.put('/:id/incentives', async (req, res) => {
    const { incentives } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { incentives }, { new: true });
    res.send(user);
});

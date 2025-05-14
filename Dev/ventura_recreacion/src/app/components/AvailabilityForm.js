// src/app/components/AvailabilityForm.js
import { useState } from 'react';
import { updateAvailability } from '../api/user';

export default function AvailabilityForm({ userId }) {
    const [availability, setAvailability] = useState([]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await updateAvailability(userId, { availability });
        console.log(result);
    };

    return (
        <form onSubmit={handleSubmit}>
            <input type="text" value={availability} onChange={(e) => setAvailability(e.target.value.split(','))} placeholder="Available Dates (comma separated)" required />
            <button type="submit">Update Availability</button>
        </form>
    );
}

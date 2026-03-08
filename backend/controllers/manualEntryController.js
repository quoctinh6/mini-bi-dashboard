const prisma = require('../config/prisma');

const createManualEntry = async (req, res) => {
    try {
        const { date, department, revenue, province, zone } = req.body;

        if (!date || !department || revenue === undefined || !province || !zone) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        const numericRevenue = parseFloat(revenue);
        if (isNaN(numericRevenue)) {
             return res.status(400).json({ success: false, message: 'Revenue must be a number' });
        }

        const newSale = await prisma.dashboard_1.create({
            data: {
                Order_Date: new Date(date),
                Department: department,
                Revenue: numericRevenue,
                Province: province,
                Zone: parseFloat(zone)
            }
        });

        res.status(201).json({ success: true, message: 'Manual entry saved', data: newSale });
    } catch (error) {
        console.error('Manual entry error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

module.exports = {
    createManualEntry
};

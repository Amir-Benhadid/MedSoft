
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const { app } = require('electron'); // This won't work in node script. passing path manually.

// Mock getDatabase
const dbPath = 'C:\\Users\\amirb\\OneDrive\\Documents\\test\\cabinet-medical.db';
const db = new Database(dbPath);

function getConversionForSphere(sphere) {
    const roundedSphere = Math.round(Math.abs(sphere) * 4) / 4;
    console.log(`Looking for sphere: ${sphere} (rounded abs: ${roundedSphere})`);

    const exactMatch = db.prepare('SELECT * FROM lentille_conv WHERE lunettes = ?').get(roundedSphere);

    if (exactMatch) {
        console.log('Found exact match:', exactMatch);
        return exactMatch;
    }

    const candidates = db.prepare(`
        SELECT * FROM lentille_conv 
        WHERE lunettes BETWEEN ? AND ?
        ORDER BY lunettes ASC
    `).all(roundedSphere - 0.5, roundedSphere + 0.5);

    console.log('Candidates found:', candidates.length);

    if (candidates.length === 0) {
        return null;
    }

    const closest = candidates.reduce((prev, curr) => {
        return Math.abs(curr.lunettes - roundedSphere) < Math.abs(prev.lunettes - roundedSphere)
            ? curr
            : prev;
    });

    console.log('Closest match:', closest);
    return closest;
}

// Test cases
const testSpheres = [-5.00, -7.00, -4.75, -5.25];

testSpheres.forEach(val => {
    console.log(`\nTesting ${val}:`);
    const conv = getConversionForSphere(val);
    if (conv) {
        // Simulate LentilleService logic
        const getVal = (v, fallback) => {
            if (v === undefined || v === null || v === '') return fallback;
            return parseFloat(String(v));
        };

        const converted = val < 0
            ? getVal(conv.lun_moins, val)
            : getVal(conv.lun_plus, val);

        console.log(`Converted Value: ${converted} (Type: ${typeof converted})`);
    } else {
        console.log('No conversion found');
    }
});

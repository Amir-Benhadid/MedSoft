import fs from 'fs';
import Database from 'better-sqlite3';
import { resolveLocalDbPath } from './lib/local-db.js';

function levenshtein(a: string, b: string): number {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));

    for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= b.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= b.length; j++) {
        for (let i = 1; i <= a.length; i++) {
            const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
            matrix[j][i] = Math.min(
                matrix[j][i - 1] + 1,
                matrix[j - 1][i] + 1,
                matrix[j - 1][i - 1] + indicator
            );
        }
    }

    return matrix[b.length][a.length];
}

function normalizeStr(value: string) {
    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim()
        .toLowerCase()
        .replace(/\s+/g, ' ');
}

function getBirthYear(dob?: string | null) {
    if (!dob) return null;

    const date = new Date(dob);
    return Number.isNaN(date.getTime()) ? null : date.getFullYear();
}

const dbPath = resolveLocalDbPath();
if (!fs.existsSync(dbPath)) {
    throw new Error(`Local database not found: ${dbPath}`);
}

const db = new Database(dbPath, { readonly: true });
db.function('fuzzy_contains', (text: string, pattern: string, distance: number) => {
    if (!text || !pattern) return 0;
    const t = text.toLowerCase();
    const p = pattern.toLowerCase();
    const maxDist = Number(distance);

    if (t.includes(p)) return 1;
    if (p.length < 3) return 0;

    const words = t.split(/[\s,.-]+/);
    for (const word of words) {
        if (Math.abs(word.length - p.length) > maxDist) continue;
        if (levenshtein(word, p) <= maxDist) return 1;
    }

    return 0;
});

type PatientRow = {
    id: string;
    name: string;
    surname: string;
    dob?: string | null;
    phone_number?: string | null;
    street?: string | null;
    city?: string | null;
};

const months: Record<string, string> = {
    'jan': '01', 'janvier': '01', 'january': '01',
    'fev': '02', 'fév': '02', 'fevrier': '02', 'février': '02', 'feb': '02', 'february': '02',
    'mar': '03', 'mars': '03', 'march': '03',
    'avr': '04', 'avril': '04', 'apr': '04', 'april': '04',
    'mai': '05', 'may': '05',
    'jun': '06', 'juin': '06', 'june': '06',
    'jul': '07', 'juil': '07', 'juillet': '07', 'july': '07',
    'aou': '08', 'août': '08', 'aout': '08', 'aug': '08', 'august': '08',
    'sep': '09', 'sept': '09', 'septembre': '09', 'september': '09',
    'oct': '10', 'octobre': '10', 'october': '10',
    'nov': '11', 'novembre': '11', 'november': '11',
    'dec': '12', 'déc': '12', 'decembre': '12', 'décembre': '12', 'december': '12'
};

function buildSearchQuery(term: string) {
    const tokens = term.trim().split(/\s+/).filter(Boolean);
    if (tokens.length === 0) {
        return null;
    }

    let query = 'SELECT * FROM patients WHERE 1=1';
    const params: string[] = [];

    for (const token of tokens) {
        const tokenPattern = `%${token}%`;
        const conditions = [
            'fuzzy_contains(name, ?, 1)',
            'fuzzy_contains(surname, ?, 1)',
            'fuzzy_contains(phone_number, ?, 1)',
            'fuzzy_contains(city, ?, 1)',
            'fuzzy_contains(street, ?, 1)'
        ];
        const tokenParams = [token, token, token, token, token];

        if (/^\d+$/.test(token)) {
            conditions.push('dob LIKE ?');
            tokenParams.push(tokenPattern);
        }

        if (token.includes('/')) {
            const parts = token.split('/');
            if (parts.length === 2) {
                const d = parts[0].padStart(2, '0');
                const m = parts[1].padStart(2, '0');
                conditions.push('dob LIKE ?');
                tokenParams.push(`%-${m}-${d}%`);
            }
        }

        const lowerToken = token.toLowerCase();
        if (lowerToken.length >= 3) {
            for (const [name, digit] of Object.entries(months)) {
                if (name.startsWith(lowerToken)) {
                    conditions.push('dob LIKE ?');
                    tokenParams.push(`%-${digit}-%`);
                    break;
                }
            }
        }

        query += ` AND (${conditions.join(' OR ')})`;
        params.push(...tokenParams);
    }

    query += ' ORDER BY surname ASC, name ASC LIMIT 50';
    return { query, params };
}

function hasDuplicateMatch(source: PatientRow, candidate: PatientRow) {
    const sourceName = normalizeStr(source.name || '');
    const sourceSurname = normalizeStr(source.surname || '');
    const candidateName = normalizeStr(candidate.name || '');
    const candidateSurname = normalizeStr(candidate.surname || '');

    if (!sourceName || !sourceSurname || !candidateName || !candidateSurname) return false;

    const sourceBirthYear = getBirthYear(source.dob);
    const candidateBirthYear = getBirthYear(candidate.dob);
    const exactNameMatch = sourceName === candidateName && sourceSurname === candidateSurname;
    const sameDob = !!source.dob && !!candidate.dob && source.dob === candidate.dob;
    const sameBirthYear = !!sourceBirthYear && !!candidateBirthYear && Math.abs(sourceBirthYear - candidateBirthYear) <= 1;
    const sameCity = normalizeStr(source.city || '') !== '' && normalizeStr(source.city || '') === normalizeStr(candidate.city || '');
    const surnameDistance = levenshtein(sourceSurname, candidateSurname);
    const nameDistance = levenshtein(sourceName, candidateName);

    const isHighConfidence =
        (exactNameMatch && sameDob)
        || (exactNameMatch && sameBirthYear)
        || (exactNameMatch && sameCity && (!source.dob || !candidate.dob));

    if (isHighConfidence) return true;

    return (
        ((exactNameMatch || (surnameDistance <= 1 && nameDistance <= 1)) && sameBirthYear)
        || ((exactNameMatch || (surnameDistance <= 1 && nameDistance <= 1)) && sameCity)
        || (exactNameMatch && !source.dob && !candidate.dob)
    );
}

function runBenchmark(term: string) {
    const built = buildSearchQuery(term);
    if (!built) {
        return null;
    }

    const totalStart = performance.now();
    const queryStart = performance.now();
    const rows = db.prepare(built.query).all(...built.params) as PatientRow[];
    const queryEnd = performance.now();

    const duplicatesStart = performance.now();
    const allPatients = db.prepare('SELECT id, name, surname, dob, city FROM patients ORDER BY surname ASC, name ASC').all() as PatientRow[];
    let duplicateMatchCount = 0;

    for (const row of rows) {
        for (const candidate of allPatients) {
            if (candidate.id === row.id) continue;
            if (hasDuplicateMatch(row, candidate)) {
                duplicateMatchCount += 1;
                break;
            }
        }
    }

    const duplicatesEnd = performance.now();
    const totalEnd = performance.now();

    return {
        term,
        resultCount: rows.length,
        queryMs: queryEnd - queryStart,
        oldDuplicatePhaseMs: duplicatesEnd - duplicatesStart,
        totalCurrentMs: queryEnd - totalStart,
        totalOldStyleMs: totalEnd - totalStart,
        duplicateMatchCount,
    };
}

const inputTerms = process.argv.slice(2);
const terms = inputTerms.length > 0 ? inputTerms : ['mo', 'moh', 'ben', '1990', 'ali'];

try {
    const totalPatients = db.prepare('SELECT COUNT(*) as count FROM patients').get() as { count: number };
    console.log(`Using database: ${dbPath}`);
    console.log(`Total patients: ${totalPatients.count}`);
    console.log('');

    for (const term of terms) {
        const result = runBenchmark(term);
        if (!result) continue;

        console.log(`Search term: ${result.term}`);
        console.log(`  Results: ${result.resultCount}`);
        console.log(`  Current live search: ${result.totalCurrentMs.toFixed(1)}ms`);
        console.log(`  Old duplicate phase only: ${result.oldDuplicatePhaseMs.toFixed(1)}ms`);
        console.log(`  Old total estimate: ${result.totalOldStyleMs.toFixed(1)}ms`);
        console.log(`  Results with at least one duplicate candidate: ${result.duplicateMatchCount}`);
        console.log('');
    }
} finally {
    db.close();
}

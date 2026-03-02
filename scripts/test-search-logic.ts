
import Database from 'better-sqlite3';

function testSearch() {
    console.log('🧪 Starting Search Logic Verification...');

    // 1. Setup In-Memory DB
    const db = new Database(':memory:');

    // 2. Schema
    db.exec(`
        CREATE TABLE patients (
            id TEXT PRIMARY KEY,
            name TEXT,
            surname TEXT,
            dob TEXT,
            phone_number TEXT,
            street TEXT,
            city TEXT,
            oph_ants TEXT,
            gen_ants TEXT
        );
    `);

    // 3. Seed Data
    const patients = [
        { id: '1', name: 'John', surname: 'Doe', dob: '1980-10-29', city: 'Paris' },
        { id: '2', name: 'Jane', surname: 'Smith', dob: '1990-05-15', city: 'London' },
        { id: '3', name: 'Bob', surname: 'Jones', dob: '2020-10-29', city: 'New York' },
        { id: '4', name: 'Alice', surname: 'Wonder', dob: '1985-01-01', city: 'Paris' },
        { id: '5', name: 'Eve', surname: 'Adam', dob: '1995-12-31', city: 'Eden' },
    ];

    const insert = db.prepare('INSERT INTO patients (id, name, surname, dob, city) VALUES (?, ?, ?, ?, ?)');
    patients.forEach(p => insert.run(p.id, p.name, p.surname, p.dob, p.city));

    // 4. Implement Search Logic (Cloned from PatientRepository)
    const search = (term: string) => {
        const tokens = term.trim().split(/\s+/);
        if (tokens.length === 0) return [];

        let query = `SELECT * FROM patients WHERE 1=1`;
        const params: any[] = [];

        const months: Record<string, string> = {
            'jan': '01', 'janvier': '01', 'january': '01',
            'fev': '02', 'fév': '02', 'fevrier': '02', 'février': '02', 'feb': '02',
            'oct': '10', 'octobre': '10'
            // ... (abridged for test)
        };

        for (const token of tokens) {
            const tokenPattern = `%${token}%`;
            const conditions = [
                `name LIKE ?`,
                `surname LIKE ?`,
                `city LIKE ?`
            ];
            const tokenParams = [tokenPattern, tokenPattern, tokenPattern];

            if (/^\d+$/.test(token)) {
                conditions.push(`dob LIKE ?`);
                tokenParams.push(tokenPattern);
            }

            if (token.includes('/')) {
                const parts = token.split('/');
                if (parts.length === 2) {
                    const d = parts[0].padStart(2, '0');
                    const m = parts[1].padStart(2, '0');
                    conditions.push(`dob LIKE ?`);
                    tokenParams.push(`%-${m}-${d}%`);
                }
            }

            const lowerToken = token.toLowerCase();
            if (lowerToken.length >= 3) {
                for (const [name, digit] of Object.entries(months)) {
                    if (name.startsWith(lowerToken)) {
                        conditions.push(`dob LIKE ?`);
                        tokenParams.push(`%-${digit}-%`);
                        break;
                    }
                }
            }

            query += ` AND (${conditions.join(' OR ')})`;
            params.push(...tokenParams);
        }

        return db.prepare(query).all(...params);
    };

    // 5. Run Tests
    const runCase = (term: string, expectedCount: number, caseName: string) => {
        const results = search(term);
        const pass = results.length === expectedCount;
        console.log(`${pass ? '✅' : '❌'} [${term}] ${caseName}: Found ${results.length}, Expected ${expectedCount}`);
        if (!pass) console.table(results);
    };

    runCase('John', 1, 'Simple Name');
    runCase('Doe', 1, 'Simple Surname');
    runCase('Paris', 2, 'City Search');
    runCase('John Paris', 1, 'Multi-token Name + City');
    runCase('29', 2, 'Date (Day) - Should find John (1980-10-29) and Bob (2020-10-29)');
    runCase('10', 2, 'Date (Month) - Should find John and Bob');
    runCase('1980', 1, 'Date (Year) - Should find John');
    runCase('29/10', 2, 'Date (DD/MM) - Should find John and Bob');
    runCase('oct', 2, 'Date (Month Name) - Should find John and Bob');
    runCase('Bob oct', 1, 'Name + Month Name');
    runCase('Bob october', 1, 'Name + Full Month Name');
    runCase('jo 29', 2, 'Partial Name + Day - (John, Bob)');

    console.log('🏁 Verification Complete');
}

testSearch();


import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to root package.json (scripts/ is inside root)
const packageJsonPath = path.resolve(__dirname, '../package.json');

// Interface for package.json structure
interface PackageJson {
    version: string;
    [key: string]: any;
}

// Read current package.json
function getPackageJson(): PackageJson {
    try {
        const data = fs.readFileSync(packageJsonPath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error('❌ Failed to read package.json:', error);
        process.exit(1);
    }
}

// Write to package.json
function writePackageJson(content: PackageJson) {
    try {
        fs.writeFileSync(packageJsonPath, JSON.stringify(content, null, '\t') + '\n', 'utf-8'); // Preserving indentation style (tab or spaces - here assuming tab based on previous files)
    } catch (error) {
        console.error('❌ Failed to write package.json:', error);
        process.exit(1);
    }
}

// Execute shell command
function runCommand(command: string) {
    try {
        console.log(`> ${command}`);
        execSync(command, { stdio: 'inherit' });
    } catch (error) {
        console.error(`❌ Command failed: ${command}`);
        process.exit(1);
    }
}

// Interactive prompt
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function ask(question: string): Promise<string> {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer.trim());
        });
    });
}

async function main() {
    console.log('🚀 Interactive Release Script');
    console.log('-----------------------------');

    // 1. Get current version
    const pkg = getPackageJson();
    const currentVersion = pkg.version;
    console.log(`Current version: ${currentVersion}`);

    const versionParts = currentVersion.split('.').map(Number);
    if (versionParts.length !== 3 || versionParts.some(isNaN)) {
        console.error('❌ Invalid semantic version format in package.json (expected x.y.z)');
        process.exit(1);
    }

    const [major, minor, patch] = versionParts;

    // 2. Determine options
    const nextPatch = `${major}.${minor}.${patch + 1}`;
    const nextMinor = `${major}.${minor + 1}.0`;
    const nextMajor = `${major + 1}.0.0`;

    console.log('\nSelect release type:');
    console.log(`1) Patch (${nextPatch})`);
    console.log(`2) Minor (${nextMinor})`);
    console.log(`3) Major (${nextMajor})`);
    console.log(`4) Custom Version`);
    console.log(`5) Cancel`);

    const choice = await ask('\nEnter choice (1-5): ');

    let newVersion = '';

    switch (choice) {
        case '1':
            newVersion = nextPatch;
            break;
        case '2':
            newVersion = nextMinor;
            break;
        case '3':
            newVersion = nextMajor;
            break;
        case '4':
            newVersion = await ask('Enter custom version (e.g. 1.2.3): ');
            if (!/^\d+\.\d+\.\d+$/.test(newVersion)) {
                console.error('❌ Invalid version format. Must be x.y.z');
                rl.close();
                return;
            }
            break;
        case '5':
        default:
            console.log('❌ Release cancelled.');
            rl.close();
            return;
    }

    console.log(`\nSelected version: ${newVersion}`);
    const confirmation = await ask('Proceed with release? (y/n): ');

    if (confirmation.toLowerCase() !== 'y' && confirmation.toLowerCase() !== 'yes') {
        console.log('❌ Release cancelled.');
        rl.close();
        return;
    }

    // 3. Update package.json
    console.log('\n📦 Updating package.json...');
    pkg.version = newVersion;
    writePackageJson(pkg);

    // Update lockfile
    console.log('\n📦 Updating lockfile...');
    try {
        execSync('pnpm install', { stdio: 'inherit' });
    } catch (e) {
        console.warn('⚠️  pnpm install failed, continuing anyway...');
    }

    // 4. Git operations
    console.log('\ncommit & tag...');

    // Stage package.json and lockfile
    runCommand('git add package.json pnpm-lock.yaml');

    // Check for other changes
    try {
        const status = execSync('git status --porcelain').toString();
        if (status) {
            console.log('\n📝 Detected uncommitted changes:');
            const addAll = await ask('⚠️  Do you want to run "git add ." and include these changes in the release commit? (y/n): ');
            if (addAll.toLowerCase() === 'y' || addAll.toLowerCase() === 'yes') {
                runCommand('git add .');
            } else {
                console.log('ℹ️  Skipping git add . (only package.json will be committed)');
            }
        }
    } catch (e) {
        // ignore
    }

    // Commit
    runCommand(`git commit -m "chore: release v${newVersion}"`);

    // Tag
    try {
        // Check if tag exists
        execSync(`git rev-parse v${newVersion}`, { stdio: 'ignore' });
        console.log(`⚠️  Tag v${newVersion} already exists. Skipping tag creation (or you might want to handle this manually).`);
        // We could offer to delete it, but safer to warn.
    } catch (e) {
        // Tag doesn't exist, create it
        runCommand(`git tag v${newVersion}`);
    }

    console.log('\n✅ Local release created successfully!');

    // 5. Push
    const push = await ask('\nDo you want to push commits and tags to remote? (y/n): ');

    if (push.toLowerCase() === 'y' || push.toLowerCase() === 'yes') {
        runCommand('git push');
        runCommand('git push --tags');
        console.log('\n🚀 Pushed to remote!');
    } else {
        console.log('\nℹ️  Remember to push manually: git push && git push --tags');
    }

    rl.close();
}

main().catch((err) => {
    console.error('❌ Unexpected error:', err);
    rl.close();
});

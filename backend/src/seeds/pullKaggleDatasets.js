const path = require('path');
const fs = require('fs');
const os = require('os');
const { execSync } = require('child_process');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const datasets = [
  { slug: 'shekpaul/global-superstore', folder: 'global-superstore' },
  { slug: 'heesoo37/120-years-of-olympic-history-athletes-and-results', folder: 'olympics-history' },
  { slug: 'shivamb/netflix-shows', folder: 'netflix-shows' },
  { slug: 'ahmedshahriarsakib/sql-practice-questions', folder: 'sql-practice-questions' }
];

const outputRoot = path.resolve(__dirname, '../../datasets');
let kaggleCmd = 'kaggle';

function run(command) {
  execSync(command, { stdio: 'inherit' });
}

function ensureKaggleAuth() {
  const kaggleDir = path.join(os.homedir(), '.kaggle');
  const kaggleJsonPath = path.join(kaggleDir, 'kaggle.json');

  // If user already configured Kaggle globally, use it as-is.
  if (fs.existsSync(kaggleJsonPath)) {
    process.env.KAGGLE_CONFIG_DIR = kaggleDir;
    return;
  }

  const username = process.env.KAGGLE_USERNAME;
  const key = process.env.KAGGLE_KEY;
  const usingPlaceholders =
    username === 'your_kaggle_username' ||
    key === 'your_kaggle_api_key';

  if (!username || !key || usingPlaceholders) {
    console.error('Kaggle credentials are missing.');
    console.error('Set KAGGLE_USERNAME and KAGGLE_KEY in backend/.env, or create ~/.kaggle/kaggle.json manually.');
    process.exit(1);
  }

  fs.mkdirSync(kaggleDir, { recursive: true });
  fs.writeFileSync(kaggleJsonPath, JSON.stringify({ username, key }, null, 2), 'utf8');

  // Kaggle CLI requires strict file permissions on Unix systems.
  try {
    fs.chmodSync(kaggleJsonPath, 0o600);
  } catch (_) {
    // Windows can ignore chmod requirements.
  }

  process.env.KAGGLE_CONFIG_DIR = kaggleDir;
  console.log(`Created Kaggle auth file at: ${kaggleJsonPath}`);
}

function main() {
  ensureKaggleAuth();

  console.log('Checking Kaggle CLI...');
  try {
    run('kaggle --version');
  } catch (error) {
    try {
      run('py -m kaggle.cli --version');
      kaggleCmd = 'py -m kaggle.cli';
    } catch (_) {
      console.error('Kaggle CLI is not installed or not available in PATH.');
      console.error('Install with: py -m pip install kaggle');
      process.exit(1);
    }
  }

  console.log('Downloading datasets to:', outputRoot);

  const downloaded = [];
  const failed = [];

  datasets.forEach((item) => {
    const targetDir = path.join(outputRoot, item.folder);
    fs.mkdirSync(targetDir, { recursive: true });
    const command = `${kaggleCmd} datasets download -d ${item.slug} -p "${targetDir}" --unzip`;
    console.log(`\\n> ${command}`);

    try {
      run(command);
      downloaded.push(item.slug);
    } catch (error) {
      failed.push(item.slug);
      console.warn(`Failed to download ${item.slug}. Skipping and continuing...`);
    }
  });

  console.log('\nDownload summary:');
  console.log(`- Success: ${downloaded.length}`);
  downloaded.forEach((slug) => console.log(`  - ${slug}`));
  console.log(`- Failed: ${failed.length}`);
  failed.forEach((slug) => console.log(`  - ${slug}`));

  if (failed.length > 0) {
    console.log('Some datasets failed (often due to Kaggle permissions/private metadata), but available datasets were downloaded successfully.');
  }

  console.log('Done. You can now seed questions from available Kaggle datasets.');
}

main();

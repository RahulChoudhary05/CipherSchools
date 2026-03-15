const fs = require('fs');
const path = require('path');

function parseCsvLine(line) {
  const out = [];
  let value = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];

    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        value += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (ch === ',' && !inQuotes) {
      out.push(value);
      value = '';
      continue;
    }

    value += ch;
  }

  out.push(value);
  return out;
}

function readCsv(filePath, maxRows = 200) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const lines = raw.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length < 2) return { headers: [], rows: [] };

  const headers = parseCsvLine(lines[0]);
  const rows = [];

  for (let i = 1; i < lines.length && rows.length < maxRows; i += 1) {
    const cells = parseCsvLine(lines[i]);
    const row = {};

    headers.forEach((header, idx) => {
      let val = cells[idx] !== undefined ? cells[idx] : '';
      if (val === 'NA' || val === '') val = null;
      row[header] = val;
    });

    rows.push(row);
  }

  return { headers, rows };
}

function toInt(val) {
  if (val === null || val === undefined) return null;
  const n = Number(val);
  if (Number.isNaN(n)) return null;
  return Math.trunc(n);
}

function normalizeCountry(country) {
  if (!country) return null;
  return String(country).split(',')[0].trim() || null;
}

function groupCount(rows, keySelector) {
  const map = new Map();
  rows.forEach((row) => {
    const key = keySelector(row);
    if (!key) return;
    map.set(key, (map.get(key) || 0) + 1);
  });
  return map;
}

function mapToSortedRows(countMap, keyName, valueName, limit) {
  const arr = Array.from(countMap.entries())
    .map(([k, v]) => ({ [keyName]: k, [valueName]: v }))
    .sort((a, b) => {
      if (b[valueName] !== a[valueName]) return b[valueName] - a[valueName];
      return String(a[keyName]).localeCompare(String(b[keyName]));
    });
  if (typeof limit === 'number') return arr.slice(0, limit);
  return arr;
}

function generateFromNetflix(datasetsRoot) {
  const filePath = path.join(datasetsRoot, 'netflix-shows', 'netflix_titles.csv');
  if (!fs.existsSync(filePath)) return [];

  const { rows } = readCsv(filePath, 100);

  const tableRows = rows.map((r) => ({
    show_id: r.show_id,
    type: r.type,
    title: r.title ? String(r.title).slice(0, 250) : null,
    country: normalizeCountry(r.country),
    release_year: toInt(r.release_year),
    rating: r.rating,
    duration: r.duration
  }));

  const sampleTable = {
    tableName: 'netflix_titles',
    columns: [
      { columnName: 'show_id', dataType: 'VARCHAR(20)' },
      { columnName: 'type', dataType: 'VARCHAR(20)' },
      { columnName: 'title', dataType: 'TEXT' },
      { columnName: 'country', dataType: 'VARCHAR(100)' },
      { columnName: 'release_year', dataType: 'INTEGER' },
      { columnName: 'rating', dataType: 'VARCHAR(20)' },
      { columnName: 'duration', dataType: 'VARCHAR(30)' }
    ],
    rows: tableRows
  };

  const typeCounts = groupCount(tableRows, (r) => r.type);
  const typeCountRows = mapToSortedRows(typeCounts, 'type', 'total_count');

  const recentRows = tableRows
    .filter((r) => r.release_year !== null && r.release_year >= 2019)
    .sort((a, b) => {
      if (a.release_year !== b.release_year) return a.release_year - b.release_year;
      return String(a.title).localeCompare(String(b.title));
    })
    .slice(0, 20)
    .map((r) => ({ title: r.title, release_year: r.release_year }));

  const countryCounts = groupCount(tableRows, (r) => r.country);
  const topCountries = mapToSortedRows(countryCounts, 'country', 'show_count', 10);

  const ratingCounts = groupCount(tableRows, (r) => r.rating);
  const ratingRows = mapToSortedRows(ratingCounts, 'rating', 'title_count', 10);

  return [
    {
      title: 'Kaggle Netflix - Count Titles By Type',
      difficulty: 'Easy',
      topic: 'GROUP BY',
      tags: ['kaggle', 'netflix', 'group by'],
      datasetKey: 'netflix',
      description: 'Use Kaggle Netflix data to count titles by type.',
      question: 'From netflix_titles, return type and total_count sorted by total_count desc and type asc.',
      starterSql: 'SELECT type, COUNT(*) AS total_count\nFROM netflix_titles\nGROUP BY type\nORDER BY total_count DESC, type ASC;',
      solutionSql: 'SELECT type, COUNT(*) AS total_count\nFROM netflix_titles\nGROUP BY type\nORDER BY total_count DESC, type ASC;',
      hints: [
        'Group using type column.',
        'Use COUNT(*) for totals.',
        'Apply deterministic ORDER BY.'
      ],
      sampleTables: [sampleTable],
      expectedOutput: {
        type: 'table',
        columns: ['type', 'total_count'],
        value: typeCountRows
      }
    },
    {
      title: 'Kaggle Netflix - Recent Releases',
      difficulty: 'Medium',
      topic: 'WHERE',
      tags: ['kaggle', 'netflix', 'filter'],
      datasetKey: 'netflix',
      description: 'Filter Kaggle Netflix data by release year.',
      question: 'Return title and release_year where release_year >= 2019, sorted by release_year and title.',
      starterSql: 'SELECT title, release_year\nFROM netflix_titles\nWHERE release_year >= 2019\nORDER BY release_year ASC, title ASC\nLIMIT 20;',
      solutionSql: 'SELECT title, release_year\nFROM netflix_titles\nWHERE release_year >= 2019\nORDER BY release_year ASC, title ASC\nLIMIT 20;',
      hints: [
        'Use release_year in WHERE clause.',
        'Sort by year then title.',
        'Limit output to first 20 rows.'
      ],
      sampleTables: [sampleTable],
      expectedOutput: {
        type: 'table',
        columns: ['title', 'release_year'],
        value: recentRows
      }
    },
    {
      title: 'Kaggle Netflix - Top Countries By Titles',
      difficulty: 'Medium',
      topic: 'GROUP BY',
      tags: ['kaggle', 'netflix', 'aggregation'],
      datasetKey: 'netflix',
      description: 'Find top countries by title count from Kaggle Netflix data.',
      question: 'Return country and show_count for top 10 countries by number of titles.',
      starterSql: 'SELECT country, COUNT(*) AS show_count\nFROM netflix_titles\nWHERE country IS NOT NULL\nGROUP BY country\nORDER BY show_count DESC, country ASC\nLIMIT 10;',
      solutionSql: 'SELECT country, COUNT(*) AS show_count\nFROM netflix_titles\nWHERE country IS NOT NULL\nGROUP BY country\nORDER BY show_count DESC, country ASC\nLIMIT 10;',
      hints: [
        'Exclude null country values.',
        'Group by country.',
        'Sort by count descending.'
      ],
      sampleTables: [sampleTable],
      expectedOutput: {
        type: 'table',
        columns: ['country', 'show_count'],
        value: topCountries
      }
    },
    {
      title: 'Kaggle Netflix - Titles By Rating',
      difficulty: 'Medium',
      topic: 'GROUP BY',
      tags: ['kaggle', 'netflix', 'rating'],
      datasetKey: 'netflix',
      description: 'Count titles per content rating from Kaggle Netflix data.',
      question: 'Return rating and title_count sorted by title_count desc and rating asc (top 10).',
      starterSql: 'SELECT rating, COUNT(*) AS title_count\nFROM netflix_titles\nWHERE rating IS NOT NULL\nGROUP BY rating\nORDER BY title_count DESC, rating ASC\nLIMIT 10;',
      solutionSql: 'SELECT rating, COUNT(*) AS title_count\nFROM netflix_titles\nWHERE rating IS NOT NULL\nGROUP BY rating\nORDER BY title_count DESC, rating ASC\nLIMIT 10;',
      hints: [
        'Filter out null ratings.',
        'Group by rating and count.',
        'Sort by count descending.'
      ],
      sampleTables: [sampleTable],
      expectedOutput: {
        type: 'table',
        columns: ['rating', 'title_count'],
        value: ratingRows
      }
    }
  ];
}

function generateFromOlympics(datasetsRoot) {
  const athleteFile = path.join(datasetsRoot, 'olympics-history', 'athlete_events.csv');
  const regionsFile = path.join(datasetsRoot, 'olympics-history', 'noc_regions.csv');
  if (!fs.existsSync(athleteFile)) return [];

  const athleteCsv = readCsv(athleteFile, 150);
  const athleteRows = athleteCsv.rows.map((r) => ({
    athlete_id: toInt(r.ID),
    name: r.Name ? String(r.Name).slice(0, 120) : null,
    sex: r.Sex,
    age: toInt(r.Age),
    team: r.Team ? String(r.Team).slice(0, 100) : null,
    noc: r.NOC,
    year: toInt(r.Year),
    season: r.Season,
    sport: r.Sport ? String(r.Sport).slice(0, 80) : null,
    medal: r.Medal
  }));

  const eventsTable = {
    tableName: 'athlete_events',
    columns: [
      { columnName: 'athlete_id', dataType: 'INTEGER' },
      { columnName: 'name', dataType: 'TEXT' },
      { columnName: 'sex', dataType: 'VARCHAR(5)' },
      { columnName: 'age', dataType: 'INTEGER' },
      { columnName: 'team', dataType: 'TEXT' },
      { columnName: 'noc', dataType: 'VARCHAR(10)' },
      { columnName: 'year', dataType: 'INTEGER' },
      { columnName: 'season', dataType: 'VARCHAR(10)' },
      { columnName: 'sport', dataType: 'TEXT' },
      { columnName: 'medal', dataType: 'VARCHAR(20)' }
    ],
    rows: athleteRows
  };

  const medalRowsOnly = athleteRows.filter((r) => r.medal && r.medal !== 'NA');

  const medalByNoc = mapToSortedRows(
    groupCount(medalRowsOnly, (r) => r.noc),
    'noc',
    'medal_count',
    10
  );

  const goldBySport = mapToSortedRows(
    groupCount(medalRowsOnly.filter((r) => r.medal === 'Gold'), (r) => r.sport),
    'sport',
    'gold_count',
    10
  );

  const athletesBySeason = mapToSortedRows(
    groupCount(athleteRows, (r) => r.season),
    'season',
    'athlete_count'
  );

  const regionsRows = fs.existsSync(regionsFile)
    ? readCsv(regionsFile, 260).rows.map((r) => ({
        noc: r.NOC,
        region: r.region ? String(r.region).slice(0, 80) : null,
        notes: r.notes ? String(r.notes).slice(0, 120) : null
      }))
    : [];

  const regionsTable = {
    tableName: 'noc_regions',
    columns: [
      { columnName: 'noc', dataType: 'VARCHAR(10)' },
      { columnName: 'region', dataType: 'VARCHAR(80)' },
      { columnName: 'notes', dataType: 'VARCHAR(120)' }
    ],
    rows: regionsRows
  };

  const regionByMedal = (() => {
    if (!regionsRows.length) return [];
    const regionMap = new Map();
    regionsRows.forEach((r) => {
      if (r.noc) regionMap.set(r.noc, r.region || r.noc);
    });

    const regionCounter = new Map();
    medalRowsOnly.forEach((r) => {
      const region = regionMap.get(r.noc);
      if (!region) return;
      regionCounter.set(region, (regionCounter.get(region) || 0) + 1);
    });

    return mapToSortedRows(regionCounter, 'region', 'medal_count', 10);
  })();

  const problems = [
    {
      title: 'Kaggle Olympics - Medal Count By NOC',
      difficulty: 'Medium',
      topic: 'GROUP BY',
      tags: ['kaggle', 'olympics', 'aggregation'],
      datasetKey: 'olympics',
      description: 'Count medals by NOC using Kaggle Olympics rows.',
      question: 'Return noc and medal_count for rows where medal is not null, top 10 sorted by count desc.',
      starterSql: 'SELECT noc, COUNT(*) AS medal_count\nFROM athlete_events\nWHERE medal IS NOT NULL\nGROUP BY noc\nORDER BY medal_count DESC, noc ASC\nLIMIT 10;',
      solutionSql: 'SELECT noc, COUNT(*) AS medal_count\nFROM athlete_events\nWHERE medal IS NOT NULL\nGROUP BY noc\nORDER BY medal_count DESC, noc ASC\nLIMIT 10;',
      hints: [
        'Filter with medal IS NOT NULL.',
        'Group by noc.',
        'Sort by medal_count descending.'
      ],
      sampleTables: [eventsTable],
      expectedOutput: {
        type: 'table',
        columns: ['noc', 'medal_count'],
        value: medalByNoc
      }
    },
    {
      title: 'Kaggle Olympics - Gold Medals By Sport',
      difficulty: 'Hard',
      topic: 'GROUP BY',
      tags: ['kaggle', 'olympics', 'gold'],
      datasetKey: 'olympics',
      description: 'Find sports with highest gold medal rows.',
      question: 'Return sport and gold_count for top 10 sports with most Gold medals.',
      starterSql: 'SELECT sport, COUNT(*) AS gold_count\nFROM athlete_events\nWHERE medal = \'Gold\'\nGROUP BY sport\nORDER BY gold_count DESC, sport ASC\nLIMIT 10;',
      solutionSql: 'SELECT sport, COUNT(*) AS gold_count\nFROM athlete_events\nWHERE medal = \'Gold\'\nGROUP BY sport\nORDER BY gold_count DESC, sport ASC\nLIMIT 10;',
      hints: [
        'Use WHERE medal = Gold.',
        'Group by sport.',
        'Sort and limit to top 10.'
      ],
      sampleTables: [eventsTable],
      expectedOutput: {
        type: 'table',
        columns: ['sport', 'gold_count'],
        value: goldBySport
      }
    },
    {
      title: 'Kaggle Olympics - Athletes By Season',
      difficulty: 'Easy',
      topic: 'GROUP BY',
      tags: ['kaggle', 'olympics', 'season'],
      datasetKey: 'olympics',
      description: 'Count athlete event rows by season.',
      question: 'Return season and athlete_count sorted by athlete_count desc.',
      starterSql: 'SELECT season, COUNT(*) AS athlete_count\nFROM athlete_events\nGROUP BY season\nORDER BY athlete_count DESC, season ASC;',
      solutionSql: 'SELECT season, COUNT(*) AS athlete_count\nFROM athlete_events\nGROUP BY season\nORDER BY athlete_count DESC, season ASC;',
      hints: [
        'Group rows by season.',
        'Count all rows.',
        'Sort by athlete_count descending.'
      ],
      sampleTables: [eventsTable],
      expectedOutput: {
        type: 'table',
        columns: ['season', 'athlete_count'],
        value: athletesBySeason
      }
    }
  ];

  if (regionsRows.length && regionByMedal.length) {
    problems.push({
      title: 'Kaggle Olympics - Top Regions By Medals',
      difficulty: 'Hard',
      topic: 'JOIN',
      tags: ['kaggle', 'olympics', 'join'],
      datasetKey: 'olympics',
      description: 'Join athlete events with region lookup table.',
      question: 'Join athlete_events and noc_regions on noc, then return top 10 regions by medal_count.',
      starterSql: 'SELECT r.region, COUNT(*) AS medal_count\nFROM athlete_events e\nJOIN noc_regions r ON r.noc = e.noc\nWHERE e.medal IS NOT NULL\nGROUP BY r.region\nORDER BY medal_count DESC, r.region ASC\nLIMIT 10;',
      solutionSql: 'SELECT r.region, COUNT(*) AS medal_count\nFROM athlete_events e\nJOIN noc_regions r ON r.noc = e.noc\nWHERE e.medal IS NOT NULL\nGROUP BY r.region\nORDER BY medal_count DESC, r.region ASC\nLIMIT 10;',
      hints: [
        'Join using noc key.',
        'Filter medal IS NOT NULL.',
        'Group by region and count.'
      ],
      sampleTables: [eventsTable, regionsTable],
      expectedOutput: {
        type: 'table',
        columns: ['region', 'medal_count'],
        value: regionByMedal
      }
    });
  }

  return problems;
}

function generateKaggleQuestions(datasetsRoot) {
  const netflixProblems = generateFromNetflix(datasetsRoot);
  const olympicsProblems = generateFromOlympics(datasetsRoot);
  return [...netflixProblems, ...olympicsProblems];
}

module.exports = {
  generateKaggleQuestions
};

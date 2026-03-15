const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const Assignment = require('../models/Assignment');
const questionBank = require('./unifiedQuestionBank');
const { generateKaggleQuestions } = require('./kaggleGeneratedQuestions');

function normalizeProblem(problem, datasetIndex, packName) {
  const dataset = datasetIndex[problem.datasetKey] || {};
  return {
    sourcePack: packName,
    dataset: {
      key: problem.datasetKey,
      name: dataset.name || problem.datasetKey,
      sourceUrl: dataset.sourceUrl || ''
    },
    title: problem.title,
    difficulty: problem.difficulty,
    topic: problem.topic,
    description: problem.description,
    question: problem.question,
    starterSql: problem.starterSql || '',
    solutionSql: problem.solutionSql || '',
    tags: Array.isArray(problem.tags) ? problem.tags : [],
    hints: Array.isArray(problem.hints) ? problem.hints : [],
    sampleTables: Array.isArray(problem.sampleTables) ? problem.sampleTables : [],
    expectedOutput: problem.expectedOutput || { type: 'table', columns: [], value: [] }
  };
}

async function seedUnifiedQuestionBank() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const packName = questionBank.packName || 'community-pack-v1';
    const datasetIndex = questionBank.datasets || {};

    const datasetsRoot = path.resolve(__dirname, '../../datasets');
    const generatedProblems = generateKaggleQuestions(datasetsRoot);

    const allProblems = [
      ...questionBank.problems,
      ...generatedProblems
    ];

    // Replace existing assignments to ensure site shows only the fresh Kaggle pack.
    await Assignment.deleteMany({});

    const docs = allProblems.map((problem) => normalizeProblem(problem, datasetIndex, packName));

    const inserted = await Assignment.insertMany(docs, { ordered: false });

    console.log(`Seeded ${inserted.length} assignments from ${packName}`);
    console.log(`- Base problems: ${questionBank.problems.length}`);
    console.log(`- Generated from Kaggle CSV: ${generatedProblems.length}`);
    console.log('Datasets in this pack:');
    Object.keys(datasetIndex).forEach((key) => {
      console.log(`- ${key}: ${datasetIndex[key].sourceUrl}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Unified seeding failed:', error.message);
    process.exit(1);
  }
}

seedUnifiedQuestionBank();

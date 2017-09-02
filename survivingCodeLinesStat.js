var execSync = require('child_process').execSync;
var readFileSync = require('fs').readFileSync;


// Handle input arguments

var argMap = {};
process.argv.forEach(function (val) {
  if (val.includes('=')) {
  	argMap[val.split('=')[0]] = val.split('=')[1];
  }
});

var { 
	earliestRevision,
	latestRevision,
	fileFilter,
} = argMap;

if (!earliestRevision || !latestRevision) {
	console.log(`Arguments earliestRevision and latestRevision must be specified. \n
		Usage: node <pathToScript> latestRevision=<latestRevision> earliestRevision=<earliestRevision> [fileFilter=<fileFilter>] \n
		Example: node ../../survivingCodeLinesStat.js latestRevision=64c223818a0 earliestRevision=25fbbb20535 fileFilter='| grep .js | grep -v .json | grep -v .jsp'`);
	process.exit(0);
}

if (!fileFilter) {
	fileFilter = '';
}


// Do the actual processing of the files

var uniqueLinesEarliestRevision = getUniqueLinesOfCodeFromRevision(earliestRevision, fileFilter);
var uniqueLinesLatestRevision = getUniqueLinesOfCodeFromRevision(latestRevision, fileFilter);
compareRevisions(uniqueLinesEarliestRevision, uniqueLinesLatestRevision);


// Functions

function getLinesOfCodeFromFile(file, lineMap) {
	var lines = readFileSync(file, "utf8").split('\n');
	lines.forEach(function(line) {
		if (line.trim().length > 0) { 
			if (lineMap[line.trim()]) {
				lineMap[line.trim()]++;
			} else {
				lineMap[line.trim()] = 1;
			}
		}
	});
}

function getLinesOfCodeFromRevision(revision, fileFilter) {
	var fileNames;
	var fileCounter = 0;
	var lineMap = {};

	// avoid printing to stdout
	execSync(`git checkout ${revision}`, { stdio: [] });
	// restore stdio
	process.stdio = 'inherit';
	var fileNames = execSync(`git ls-files ${fileFilter} | xargs`).toString();
	var files = fileNames.replace('\n', '').split(' ');

	files.forEach(file => {
		fileCounter++;
		getLinesOfCodeFromFile(file, lineMap);
	});
	console.log(`Number of files in revision ${revision}: ${fileCounter}`)
	return lineMap;
}

function getUniqueLinesOfCode(lineMap, revision) {
	var uniqueLineCounter = 0;
	var uniqueLines = [];
	Object.keys(lineMap).forEach(function(key) {
		// only keep entries that occur 1 time
		if (lineMap[key] === 1) {
			uniqueLineCounter++;
			uniqueLines.push(key);
		}
	});
	console.log(`Unique number of lines of code in revision ${revision}: ${uniqueLineCounter}`);
	return uniqueLines;
}

function getUniqueLinesOfCodeFromRevision(revision, fileFilter) {
	var lineMap = getLinesOfCodeFromRevision(revision, fileFilter);
	return getUniqueLinesOfCode(lineMap, revision);
}

function compareRevisions(uniqueLinesEarliestRevision, uniqueLinesLatestRevision) {
	var numberOfSurvivingLines = 0;
	var numberOfLinesEarliestRevision = 0;
	uniqueLinesEarliestRevision.forEach(function(oldLine) {
		var found = false;
		numberOfLinesEarliestRevision++;
		uniqueLinesLatestRevision.forEach(function(newLine) {
			if (!found && newLine === oldLine) {
				found = true;
				numberOfSurvivingLines++;
			}
		});
	});
	console.log(`Number of surviving lines of code: ${numberOfSurvivingLines}`);
	// present percentage with two decimals
	console.log(`Surviving lines of code percentage: ${Math.round((numberOfSurvivingLines / numberOfLinesEarliestRevision) * 10000) / 100} %`)
}

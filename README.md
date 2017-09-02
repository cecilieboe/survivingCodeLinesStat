# survivingCodeLinesStat
Script for creating stats for number of surviving unique code lines between to git revisions. 

This is done by picking out all (trimmed) lines which are totally unique (the code line exists 
exactly once in the code base at the specific revision) from each of the two provided git revisions.

The two lists of unique code lines are then compared, to count how many lines from the earliest
revision still exists in the latest revision.  

The motivation is that this will give a clear indication about how much your code base changes.

## Usage
* Check the git log to decide which two revisions you want as your earliest and latest revision
* Download the script `survivingCodeLinesStat.js`
* Go to the root folder of the git repo you want to run statistics for
* Run the script from here, by specifying the path where you downloaded the script to
* How to run: `node <pathToScript> latestRevision=<latestRevision> earliestRevision=<earliestRevision> [fileFilter=<fileFilter>]`
* Example: `node ../../survivingCodeLinesStat.js latestRevision=64c223818a0 earliestRevision=25fbbb20535 fileFilter='| grep .js | grep -v .json | grep -v .jsp'` 

## Requirements
Node with javascript version that supports destructuring and template strings 
(I believe this is from node version 6.x +).
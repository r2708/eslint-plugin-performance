module.exports = function(results) {
  // Implementation will be added in Task 8
  let score = 100;
  let issueCount = 0;

  for (const result of results) {
    for (const message of result.messages) {
      issueCount++;
      if (message.severity === 1) {
        score -= 2;
      } else if (message.severity === 2) {
        score -= 5;
      }
    }
  }

  score = Math.max(0, score);

  const pointsDeducted = 100 - score;
  let impact;
  if (pointsDeducted <= 10) {
    impact = 'Low';
  } else if (pointsDeducted <= 30) {
    impact = 'Medium';
  } else {
    impact = 'High';
  }

  return `Performance Score: ${score}/100\nIssues Found: ${issueCount}\nEstimated Impact: ${impact}\n`;
};

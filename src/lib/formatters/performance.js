'use strict';

module.exports = function(results) {
  let score = 100;
  let totalWarnings = 0;
  let totalErrors = 0;
  const fileReports = [];

  for (const result of results) {
    const fileWarnings = result.messages.filter(m => m.severity === 1).length;
    const fileErrors = result.messages.filter(m => m.severity === 2).length;

    totalWarnings += fileWarnings;
    totalErrors += fileErrors;
    score -= fileWarnings * 2;
    score -= fileErrors * 5;

    if (result.messages.length > 0) {
      fileReports.push({ filePath: result.filePath, warnings: fileWarnings, errors: fileErrors });
    }
  }

  score = Math.max(0, score);

  const totalIssues = totalWarnings + totalErrors;
  const pointsDeducted = 100 - score;
  let impact;
  if (pointsDeducted === 0) {
    impact = 'None';
  } else if (pointsDeducted <= 10) {
    impact = 'Low';
  } else if (pointsDeducted <= 30) {
    impact = 'Medium';
  } else {
    impact = 'High';
  }

  const lines = [
    '',
    '╔══════════════════════════════════════════╗',
    '║       Performance Plugin Report          ║',
    '╚══════════════════════════════════════════╝',
    '',
    `  Score:            ${score}/100`,
    `  Performance Impact: ${impact}`,
    `  Total Issues:     ${totalIssues} (${totalErrors} errors, ${totalWarnings} warnings)`,
  ];

  if (fileReports.length > 0) {
    lines.push('');
    lines.push('  Files with issues:');
    for (const file of fileReports) {
      const short = file.filePath.replace(process.cwd(), '.');
      lines.push(`    ${short}: ${file.errors} error(s), ${file.warnings} warning(s)`);
    }
  }

  lines.push('');

  return lines.join('\n');
};

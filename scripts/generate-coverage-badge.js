#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

try {
  // 讀取 coverage summary
  const coverageFile = join(process.cwd(), 'coverage', 'coverage-summary.json');
  const coverageData = JSON.parse(readFileSync(coverageFile, 'utf8'));

  // 取得總體覆蓋率
  const totalCoverage = coverageData.total;
  const statements = totalCoverage.statements.pct;
  const branches = totalCoverage.branches.pct;
  const functions = totalCoverage.functions.pct;
  const lines = totalCoverage.lines.pct;

  // 計算平均覆蓋率
  const avgCoverage = Math.round((statements + branches + functions + lines) / 4);

  // 決定 badge 顏色
  let color = 'red';
  if (avgCoverage >= 80) color = 'brightgreen';
  else if (avgCoverage >= 60) color = 'yellow';
  else if (avgCoverage >= 40) color = 'orange';

  // 生成 badge URL
  const badgeUrl = `https://img.shields.io/badge/coverage-${avgCoverage}%25-${color}`;

  // 生成 coverage 報告
  const coverageReport = {
    timestamp: new Date().toISOString(),
    coverage: {
      statements: `${statements}%`,
      branches: `${branches}%`,
      functions: `${functions}%`,
      lines: `${lines}%`,
      average: `${avgCoverage}%`
    },
    badge: {
      url: badgeUrl,
      markdown: `![Coverage](${badgeUrl})`,
      html: `<img src="${badgeUrl}" alt="Coverage Badge" />`
    },
    details: {
      statements: totalCoverage.statements,
      branches: totalCoverage.branches,
      functions: totalCoverage.functions,
      lines: totalCoverage.lines
    }
  };

  // 輸出到檔案
  writeFileSync('coverage-badge.json', JSON.stringify(coverageReport, null, 2));

  // 輸出到 console
  console.log('📊 Coverage Report Generated:');
  console.log(`📈 Statements: ${statements}%`);
  console.log(`🌿 Branches: ${branches}%`);
  console.log(`⚡ Functions: ${functions}%`);
  console.log(`📝 Lines: ${lines}%`);
  console.log(`🎯 Average: ${avgCoverage}%`);
  console.log(`\n🏷️  Badge Markdown: ${coverageReport.badge.markdown}`);
  console.log(`📄 Coverage badge saved to: coverage-badge.json`);
} catch (error) {
  console.error('❌ Error generating coverage badge:', error.message);
  process.exit(1);
}

const reportService = require('../services/reportService');
const asyncHandler = require('../utils/asyncHandler');

const plannedVsActual = asyncHandler(async (req, res) => {
  const result = await reportService.plannedVsActualReport({
    cycleId: req.query.cycleId ? parseInt(req.query.cycleId, 10) : undefined,
    departmentId: req.query.departmentId ? parseInt(req.query.departmentId, 10) : undefined,
  });
  if (req.query.format === 'csv') {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=planned-vs-actual.csv');
    return res.send(result.csv);
  }
  res.json({ success: true, data: result.rows });
});

const employeeCompletion = asyncHandler(async (req, res) => {
  const result = await reportService.employeeCompletionReport({
    cycleId: req.query.cycleId ? parseInt(req.query.cycleId, 10) : undefined,
  });
  if (req.query.format === 'csv') {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=employee-completion.csv');
    return res.send(result.csv);
  }
  res.json({ success: true, data: result.rows });
});

const quarterlySummary = asyncHandler(async (req, res) => {
  const result = await reportService.quarterlySummaryReport(
    req.query.cycleId ? parseInt(req.query.cycleId, 10) : undefined
  );
  if (req.query.format === 'csv') {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=quarterly-summary.csv');
    return res.send(result.csv);
  }
  res.json({ success: true, data: result.rows });
});

module.exports = { plannedVsActual, employeeCompletion, quarterlySummary };

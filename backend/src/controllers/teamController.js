const teamService = require('../services/teamService');
const asyncHandler = require('../utils/asyncHandler');

const getTeam = asyncHandler(async (req, res) => {
  const team = await teamService.getTeam(req.user.id);
  const mapped = team.map((m) => ({
    id: m.id,
    email: m.email,
    first_name: m.firstName,
    last_name: m.lastName,
    goal_count: m.goals.length,
    approval_status: m.goalApprovals[0]?.status || null,
  }));
  res.json({ success: true, data: mapped });
});

module.exports = { getTeam };

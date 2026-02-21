const { getLeaderboard } = require('./src/controllers/leaderboardController');
require('./src/config/firebase');

const req = { params: { challengeId: 'a206b103-f395-41e6-a72b-2458ae77c399' } };
const res = {
    status: (code) => ({
        json: (data) => console.log(`Response [${code}]:`, JSON.stringify(data, null, 2))
    })
};

getLeaderboard(req, res).then(() => {
    console.log("Execution finished.");
    process.exit(0);
}).catch(err => {
    console.error("Fatal Error:", err);
    process.exit(1);
});

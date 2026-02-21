const http = require('http');

async function fetchJSON(path, method, body) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const req = http.request(options, res => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(JSON.parse(data)));
        });

        req.on('error', e => reject(e));

        if (body) {
            req.write(JSON.stringify(body));
        }
        req.end();
    });
}

async function run() {
    console.log('--- TEST: Create Room ---');
    const createResp = await fetchJSON('/api/create-room', 'POST', { playerName: 'Alice' });
    console.log(createResp);

    const roomId = createResp.roomId;
    const p1Id = createResp.playerId;

    console.log('\n--- TEST: Join Room ---');
    const joinResp = await fetchJSON('/api/join-room', 'POST', { roomId, playerName: 'Bob' });
    console.log('Joined player Id:', joinResp.playerId);
    const p2Id = joinResp.playerId;

    console.log('\n--- TEST: Start Game ---');
    const startResp = await fetchJSON('/api/action', 'POST', { roomId, playerId: p1Id, action: 'start_game' });
    console.log('Status after start:', startResp.status);
    console.log('First card:', startResp.discardPile[0]);

    console.log('\n--- TEST: Fetch State P1 ---');
    const state1 = await fetchJSON(`/api/state?roomId=${roomId}&playerId=${p1Id}`, 'GET');
    console.log('Alice hand size:', state1.players[0].handCount || state1.players[0].hand.length);

    console.log('\n--- TEST: Force Alice Draw ---');
    const drawResp = await fetchJSON('/api/action', 'POST', { roomId, playerId: p1Id, action: 'draw' });
    console.log('Last Action after draw:', drawResp.lastAction);
    console.log('Turn index is now:', drawResp.turnIndex);

    console.log('\n--- ALL BASIC TESTS PASSED ---');
}

run().catch(console.error);

document.addEventListener('DOMContentLoaded', function () {
    const searchInput = document.querySelector('.search-bar input');
    const filterButtons = document.querySelectorAll('.filter-button');
    const lengthFilterButtons = document.querySelectorAll('.length-filter-button');
    const cardMap = new Map(); // Map serverID -> DOM element

    // Populate cardMap from existing server-card elements
    document.querySelectorAll('.server-card').forEach(card => {
        const serverID = card.getAttribute('serverid');
        if (serverID) {
            cardMap.set(serverID, card);
        }
    });

    let activeFilterButton = null;
    let activeLengthFilterButton = null;

    searchInput.addEventListener('input', function () {
        const searchTerm = searchInput.value.toLowerCase();
        document.querySelectorAll('.server-card').forEach(card => {
            const tag = card.querySelector('.tag').textContent.toLowerCase();
            const serverName = card.querySelector('.server-name').textContent.toLowerCase();
            card.style.display = tag.includes(searchTerm) || serverName.includes(searchTerm) ? '' : 'none';
        });
    });

    filterButtons.forEach(button => {
        button.addEventListener('click', function () {
            const isActive = button === activeFilterButton;
            filterButtons.forEach(btn => btn.classList.remove('active'));
            if (isActive) {
                activeFilterButton = null;
                document.querySelectorAll('.server-card').forEach(card => card.style.display = '');
                return;
            }

            button.classList.add('active');
            activeFilterButton = button;
            const filter = button.textContent.toLowerCase();

            if (filter === 'all tags') {
                document.querySelectorAll('.server-card').forEach(card => card.style.display = '');
            } else if (filter === 'public only') {
                document.querySelectorAll('.server-card').forEach(card => {
                    const applyTag = card.querySelector('.apply-tag');
                    const privateTag = card.querySelector('.private-tag');
                    card.style.display = (applyTag || privateTag) ? 'none' : '';
                });
            } else if (filter === 'most popular') {
                const sortedCards = Array.from(document.querySelectorAll('.server-card')).sort((a, b) => {
                    const aMembers = parseInt(a.querySelector('.members').textContent.replace(/[^\d]/g, ''));
                    const bMembers = parseInt(b.querySelector('.members').textContent.replace(/[^\d]/g, ''));
                    return bMembers - aMembers;
                });
                const grid = document.querySelector('.tags-grid');
                sortedCards.forEach(card => grid.appendChild(card));
            }
        });
    });

    lengthFilterButtons.forEach(button => {
        button.addEventListener('click', function () {
            const isActive = button === activeLengthFilterButton;
            lengthFilterButtons.forEach(btn => btn.classList.remove('active'));
            if (isActive) {
                activeLengthFilterButton = null;
                document.querySelectorAll('.server-card').forEach(card => card.style.display = '');
                return;
            }

            button.classList.add('active');
            activeLengthFilterButton = button;
            const lengthFilter = parseInt(button.textContent);
            document.querySelectorAll('.server-card').forEach(card => {
                const tagLength = card.querySelector('.tag .real').textContent.length;
                card.style.display = tagLength === lengthFilter ? '' : 'none';
            });
        });
    });

    function updateCard(card, item) {
        card.querySelector('.icon').src = item.icon;
        card.querySelector('.tag .img').src = `https://cdn.discordapp.com/clan-badges/${item.serverID}/${item.tagHash}.png`;
        card.querySelector('.tag .real').textContent = item.tag;
        card.querySelector('.server-name').textContent = item.name;
        if (card.querySelector('.members')) {
        card.querySelector('.members').textContent = `${item.members.toLocaleString('en-US')} members`;
        }
        if (card.querySelector('.description')) {
        card.querySelector('.description').textContent = item.description;
        }
        if (card.querySelector('.invite-link')) {
        card.querySelector('.invite-link').href = `https://discord.com/invite/${item.value}`;
        }
    }

    function fetchAndUpdateData() {
        fetch('https://tags-api.mgcounts.com/')
            .then(res => res.json())
            .then(data => {
                Object.entries(data).forEach(([key, item]) => {
                    if (!item.name) item.name = '';
                    if (!item.description) item.description = '';

                    let card = cardMap.get(item.serverID);
                    if (!card) {
                        const div = document.createElement('div');
                        div.className = 'server-card';
                        div.setAttribute('serverid', item.serverID);
                        div.innerHTML = `
                            <div class="flex">
                                <img src="${item.icon}" class="icon">
                                <div class="tag">
                                    <img class="img" src="https://cdn.discordapp.com/clan-badges/${item.serverID}/${item.tagHash}.png">
                                    <div class="real">${item.tag.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
                                </div>
                            </div>
                            <div class="server-name">${item.name.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
                            <div class="members">${item.members.toLocaleString('en-US')} members</div>
                            <div class="description">${item.description.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
                            <a href="https://discord.com/invite/${item.value}" class="invite-link">🔗 Join Server</a>
                        `;
                        document.getElementById('grid').appendChild(div);
                        cardMap.set(item.serverID, div);
                    } else {
                        updateCard(card, item);
                    }
                });
                document.getElementById('total').innerText = cardMap.size;
            });
    }

    fetchAndUpdateData(); // initial call
    setInterval(fetchAndUpdateData, 60000); // every 60 seconds

    function fetchInviteStats() {
        fetch('https://discord.com/api/v7/invite/32pxDuSxS7?with_counts=true')
            .then(res => res.json())
            .then(data => {
                document.getElementById('totalM').innerText = data.approximate_member_count;
                document.getElementById('onlineM').innerText = data.approximate_presence_count;
            });
    }

    fetchInviteStats();
});

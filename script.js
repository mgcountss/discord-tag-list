document.addEventListener('DOMContentLoaded', function () {
    const searchInput = document.querySelector('.search-bar input');
    const filterButtons = document.querySelectorAll('.filter-button');
    const serverCards = Array.from(document.querySelectorAll('.server-card'));
    const lengthFilterButtons = document.querySelectorAll('.length-filter-button');

    let activeFilterButton = null;
    let activeLengthFilterButton = null;

    searchInput.addEventListener('input', function () {
        const searchTerm = searchInput.value.toLowerCase();
        serverCards.forEach(card => {
            const tag = card.querySelector('.tag').textContent.toLowerCase();
            const serverName = card.querySelector('.server-name').textContent.toLowerCase();
            if (tag.includes(searchTerm) || serverName.includes(searchTerm)) {
                card.style.display = '';
            } else {
                card.style.display = 'none';
            }
        });
    });

    filterButtons.forEach(button => {
        button.addEventListener('click', function () {
            const isActive = button === activeFilterButton;

            filterButtons.forEach(btn => btn.classList.remove('active'));
            if (isActive) {
                activeFilterButton = null;
                serverCards.forEach(card => card.style.display = '');
                return;
            }

            button.classList.add('active');
            activeFilterButton = button;
            const filter = button.textContent.toLowerCase();

            if (filter === 'all tags') {
                serverCards.forEach(card => card.style.display = '');
            } else if (filter === 'public only') {
                serverCards.forEach(card => {
                    const applyTag = card.querySelector('.apply-tag');
                    const privateTag = card.querySelector('.private-tag');
                    card.style.display = (applyTag || privateTag) ? 'none' : '';
                });
            } else if (filter === 'most popular') {
                const sortedCards = serverCards.sort((a, b) => {
                    const aMembers = parseInt(a.querySelector('.members').textContent.replace(/[^\d]/g, ''));
                    const bMembers = parseInt(b.querySelector('.members').textContent.replace(/[^\d]/g, ''));
                    return bMembers - aMembers;
                });
                sortedCards.forEach(card => {
                    card.style.display = '';
                    document.querySelector('.tags-grid').appendChild(card);
                });
            }
        });
    });

    lengthFilterButtons.forEach(button => {
        button.addEventListener('click', function () {
            const isActive = button === activeLengthFilterButton;

            lengthFilterButtons.forEach(btn => btn.classList.remove('active'));
            if (isActive) {
                activeLengthFilterButton = null;
                serverCards.forEach(card => card.style.display = '');
                return;
            }

            button.classList.add('active');
            activeLengthFilterButton = button;
            const lengthFilter = parseInt(button.textContent);

            serverCards.forEach(card => {
                const tagLength = card.querySelector('.tag').textContent.length;
                card.style.display = tagLength === lengthFilter ? '' : 'none';
            });
        });
    });

    function findParentFromInvite(invite) {
        for (const inviteTag of document.querySelectorAll('.invite-link')) {
            if (inviteTag.href.split('/invite/')[1] === invite) {
                return inviteTag.parentElement;
            }
        }
        return null;
    }

    function prependChild(parent, child) {
        if (parent.firstChild) {
            parent.insertBefore(child, parent.firstChild);
        } else {
            parent.appendChild(child);
        }
    }

    fetch('https://tags-api.mgcounts.com/')
        .then(res => res.json())
        .then(data => {
            Object.entries(data).forEach(([key, item]) => {
                let parent = findParentFromInvite(key);
                if (parent) {
                    parent.children[0].style.backgroundImage = 'url("'+item.banner+'")';
                    parent.children[0].children[0].src = item.icon;
                    parent.children[1].innerText = item.name;
                    parent.children[2].innerText = item.members.toLocaleString('en-US') + ' members';
                    parent.children[3].innerText = item.description

                    if (item.tag) {
                        parent.children[0].children[1].children[0] = item.tag;
                        const tagId = 'img_' + item.tag.toLowerCase();
                        if (!document.getElementById(tagId)) {
                            const img = document.createElement('img');
                            img.classList.add('img');
                            img.src = `https://cdn.discordapp.com/clan-badges/${item.serverID}/${item.tagHash}.png?size=64`;
                            img.id = tagId;
                            prependChild(parent.children[0].children[1], img);
                        }
                    }
                }
            });

            handleFallbackTags();
        });

    function handleFallbackTags() {
        document.querySelectorAll('.server-card').forEach(parent => {
            let tag = parent.children[0].children[1].innerText;

            tag = tag.replace(/(Applied Only|Private|Invite Only|Manually Given|Invites Paused)/g, '')
                .trim();

            if (tag.includes('Removed') || tag.includes('nopePrivate')) {
                tag = './invalid';
            }

            const tagId = 'img_' + tag.toLowerCase();
            if (!document.getElementById(tagId)) {
                const img = document.createElement('img');
                img.classList.add('img');
                img.src = `./imgs/${tag.toLowerCase()}.png`;
                img.id = tagId;
                prependChild(parent.children[0].children[1], img);
            }
        });
    }

    document.getElementById('total').innerText = document.querySelectorAll('.server-card').length;

    fetch('https://discord.com/api/v7/invite/7Tzr23WE?with_counts=true')
    .then(res=>res.json())
    .then(data=>{
        document.getElementById('totalM').innerText = data.approximate_member_count;
        document.getElementById('onlineM').innerText = data.approximate_presence_count;
    })
});

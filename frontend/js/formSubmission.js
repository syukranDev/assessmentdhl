const apiForm = document.getElementById('apiForm');
const warning = document.getElementById('warning');
const clearBtn = document.getElementById('clearBtn');
const dataContainer = document.getElementById('dataContainer');
const baseUrl = 'https://jsonplaceholder.typicode.com';


async function fetchData(endpoint) {
    console.log(`${baseUrl}/${endpoint}`)

    const response = await fetch(`${baseUrl}/${endpoint}`);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
}

function getSelectedEndpoints() {
    return Array.from(document.querySelectorAll('input[type="checkbox"]:checked'))
        .map(checkbox => checkbox.value);
}

function createDataCard(data, type, selectedCheckboxArr) {

console.log(data)
    const card = document.createElement('div');
    card.className = 'data-card';

    const header = document.createElement('div');
    header.className = 'data-card-header';
    header.innerHTML = `<h4>Result: ${selectedCheckboxArr.length > 1 ? 'Combined Filter' : 'Single Filter'} - (${selectedCheckboxArr})</h4>`;

    const list = document.createElement('ul');
    list.className = 'data-list';

    data.forEach(item => {
        const listItem = document.createElement('li');
        listItem.className = 'data-item';
        
        switch(type) {
            case 'comments':
                listItem.innerHTML = `
                    <h5><span style="text-decoration: underline">Name</span>: ${item.name}</h5>
                    <p><span style="text-decoration: underline">Body</span>: ${item.body}</p>
                `;
                break;
            case 'todos':
                listItem.className += item.completed ? ' completed' : '';
                listItem.innerHTML = `
                    <h5><span style="text-decoration: underline">Title</span>: ${item.title}</h5>
                    <span class="badge ${item.completed ? 'badge-success' : 'badge-warning'}">
                        ${item.completed ? 'Completed' : 'Pending'}
                    </span>
                `;
                break;
            case 'combined':
                listItem.innerHTML = `
                    <h5><span style="text-decoration: underline">Title</span>: ${item.title}</h5>
                    <p><span style="text-decoration: underline">Body</span>: ${item.body}</p>
                    <div class="author">Author: ${item.name}</div>
                `;

                if (item.comments && item.comments.length > 0) {
                let commentsHTML = `
                    <div class="data-card-comments">
                        <div class="data-card-header"><h4>Comments for this Post</h4></div>
                        <ul class="data-list">
                `;
                
                for (let comment of item.comments) {
                    commentsHTML += `
                        <li class="data-item">
                            <p><span style="text-decoration: underline">Body</span>: ${comment.body}</p>
                            <div class="author">Author: ${comment.name || 'NA'}</div>
                            <div class="author">Emaiil: ${comment.email || 'NA'}</div>
                        </li>
                    `;
                }
                
                commentsHTML += `
                        </ul>
                    </div>
                `;
                
                listItem.innerHTML += commentsHTML;
            }
                break;
            case 'combine_posts_comments':
                listItem.innerHTML = `
                    <h5><span style="text-decoration: underline">Title</span>: ${item.title}</h5>
                    <p><span style="text-decoration: underline">Body</span>: ${item.body}</p>
                `;

                if (item.comments && item.comments.length > 0) {
                let commentsHTML = `
                    <div class="data-card-comments">
                        <div class="data-card-header"><h4>Comments for this Post</h4></div>
                        <ul class="data-list">
                `;
                
                for (let comment of item.comments) {
                    commentsHTML += `
                        <li class="data-item">
                            <p><span style="text-decoration: underline">Body</span>: ${comment.body}</p>
                            <div class="author">Author: ${comment.name || 'NA'}</div>
                            <div class="author">Emaiil: ${comment.email || 'NA'}</div>
                        </li>
                    `;
                }
                
                commentsHTML += `
                        </ul>
                    </div>
                `;
                
                listItem.innerHTML += commentsHTML;
            }
                break;
            case 'combine_todos_users':
            listItem.className += item.completed ? ' completed' : '';
            listItem.innerHTML = `
                <h5><span style="text-decoration: underline">Title</span>: ${item.title}</h5>
                <span class="badge ${item.completed ? 'badge-success' : 'badge-warning'}">
                    ${item.completed ? 'Completed' : 'Pending'}
                </span>
                <div class="author">Author: ${item.users}</div>
            `;

                
                break;
            default:
                listItem.innerHTML = `
                ${item.title ? `<h5><span style="text-decoration: underline">Title</span>: ${item.title}</h5>` : item.name ? `<h5><span style="text-decoration: underline">Name</span>: ${item.name}</h5>` : ''}
                    ${item.body ? `<p><span style="text-decoration: underline">Body</span>: ${item.body}</p>` : ''}
                `;
        }
        
        list.appendChild(listItem);
    });

    card.appendChild(header);
    card.appendChild(list);
    return card;
}

async function handleSubmit(event) {
    event.preventDefault();
    const selectedEndpoints = getSelectedEndpoints();

    console.log(selectedEndpoints)

    if (selectedEndpoints.length === 0) {
        warning.style.display = 'block';
        return;
    }

    warning.style.display = 'none';
    dataContainer.innerHTML = '<p style="color:white">Loading..</p>';

    try {
        if (selectedEndpoints.includes('posts') && selectedEndpoints.includes('users') && !selectedEndpoints.includes('comments')) {
        console.log('================= 1')
            const [posts, users] = await Promise.all([
                fetchData('posts'),
                fetchData('users')
            ]);

            setTimeout(() => {
            // NOTE DEV: dummy 0.8 sec delay to show loading
            const combinedData = posts.map(post => {
                const user = users.find(user => user.id === post.userId);
                return { ...post, name: user ? user.name : 'Unknown User' };
            });

            dataContainer.innerHTML = '';
            dataContainer.appendChild(createDataCard(combinedData, 'combined', selectedEndpoints));
            }, 800); 

    } else if (selectedEndpoints.includes('posts') && selectedEndpoints.includes('users') & selectedEndpoints.includes('comments')) {
        console.log('================= 2')
        const [posts, users, comments] = await Promise.all([
            fetchData('posts'),
            fetchData('users'),
            fetchData('comments')
        ]);

        // console.log('post below')
        // console.log(posts)
        // console.log('users below')
        // console.log(users)
        // console.log('comments below')
        // console.log(comments)

        setTimeout(() => {
            // NOTE DEV: dummy 0.8 sec delay to show loading
            const combinedData = posts.map(post => {
                const user = users.find(user => user.id === post.userId);
                const postComments = comments.filter(comment => comment.postId === post.id);
                return { 
                    ...post, 
                    name: user ? user.name : 'Unknown User',
                    comments: postComments
                };
            });

            dataContainer.innerHTML = '';
            dataContainer.appendChild(createDataCard(combinedData, 'combined', selectedEndpoints));
            }, 800); 

    } else if (selectedEndpoints.includes('posts') & selectedEndpoints.includes('comments') && !selectedEndpoints.includes('users') ) {
        const [posts, comments] = await Promise.all([
            fetchData('posts'),
            fetchData('comments')
        ]);

        // console.log(posts)
        // console.log(comments)

        setTimeout(() => {
            // NOTE DEV: dummy 0.8 sec delay to show loading
            const combinedData = posts.map(post => {
                const postComments = comments.filter(comment => comment.postId === post.id);
                return { 
                    ...post, 
                    comments: postComments
                };
            });

            dataContainer.innerHTML = '';
            dataContainer.appendChild(createDataCard(combinedData, 'combine_posts_comments', selectedEndpoints));
            }, 800); 

    } else if (selectedEndpoints.includes('todos') & selectedEndpoints.includes('users') && !selectedEndpoints.includes('posts') && !selectedEndpoints.includes('comments')) {
        const [todos, users] = await Promise.all([
            fetchData('todos'),
            fetchData('users')
        ]);

        setTimeout(() => {
            // NOTE DEV: dummy 0.8 sec delay to show loading
            const combinedData = todos.map(todo => {
                const postUsers = users.filter(user => user.id === todo.userId);
                return { 
                    ...todo, 
                    users: postUsers[0].name
                };
            });

            dataContainer.innerHTML = '';
            dataContainer.appendChild(createDataCard(combinedData, 'combine_todos_users', selectedEndpoints));
            }, 800); 
    } else {
        //NOTE DEV: cater for single selection or default
        const results = await Promise.all(
        selectedEndpoints.map(async endpoint => {
            const data = await fetchData(endpoint);
            return createDataCard(data.slice(0, 10), endpoint, selectedEndpoints);
        })
        );
        
        dataContainer.innerHTML = '';
        results.forEach(card => dataContainer.appendChild(card));
    }
    } catch (error) {
        dataContainer.innerHTML = `
            <div class="error-message">
                Error fetching data: ${error.message}
            </div>
        `;
    }
}

function handleClear() {
    //NOTE DEV: reset everything...
    apiForm.reset();
    dataContainer.innerHTML = '';
    warning.style.display = 'none';
}

//NOTE DEV: Checkbox user input validation
const checkboxes = document.querySelectorAll('input[type="checkbox"]');

function validateSelections() {
    const selectedValues = Array.from(checkboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.value);

    // NOTE DEV: Allow none selection    
    if (selectedValues.length === 0) {
        return true;
    }

    // NOTE DEV: Allow single selection regardless
    if (selectedValues.length === 1) {
        return true;
    }

    const validCombinations = [
        ['posts', 'users'],
        ['posts', 'comments'],
        ['posts', 'comments', 'users'],
        ['todos', 'users']
    ];

    const isValidCombination = validCombinations.some(combination => {
        return combination.length === selectedValues.length &&
            combination.every(value => selectedValues.includes(value));
    });

    if (!isValidCombination) {
        alert('Invalid combination! Valid combinations are:\n' +
            '- Single selection\n' +
            '- Posts + Users\n' +
            '- Posts + Comments\n' +
            '- Posts + Comments + Users\n' +
            '- Todos + Users');
        return false;
    }

    return true;
}

checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', (e) => {
        if (!validateSelections()) {
            e.target.checked = false;
        }
    });
});

 apiForm.addEventListener('submit', handleSubmit);
 clearBtn.addEventListener('click', handleClear);
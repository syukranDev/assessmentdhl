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

 function createDataCard(data, type) {
     const card = document.createElement('div');
     card.className = 'data-card';

     const header = document.createElement('div');
     header.className = 'data-card-header';
     header.innerHTML = `<h4>${type.charAt(0).toUpperCase() + type.slice(1)}</h4>`;

     const list = document.createElement('ul');
     list.className = 'data-list';

     data.forEach(item => {
         const listItem = document.createElement('li');
         listItem.className = 'data-item';
         
         switch(type) {
             case 'comments':
                 listItem.innerHTML = `
                     <h5>${item.name}</h5>
                     <p>${item.body}</p>
                 `;
                 break;
             case 'todos':
                 listItem.className += item.completed ? ' completed' : '';
                 listItem.innerHTML = `
                     <h5>${item.title}</h5>
                     <span class="badge ${item.completed ? 'badge-success' : 'badge-warning'}">
                         ${item.completed ? 'Completed' : 'Pending'}
                     </span>
                 `;
                 break;
             case 'combined':
                 listItem.innerHTML = `
                     <h5>${item.title}</h5>
                     <p>${item.body}</p>
                     <div class="author">Author: ${item.name}</div>
                 `;
                 break;
             default:
                 listItem.innerHTML = `
                     <h5>${item.title || item.name}</h5>
                     ${item.body ? `<p>${item.body}</p>` : ''}
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
         if (selectedEndpoints.includes('posts') && selectedEndpoints.includes('users')) {
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
                dataContainer.appendChild(createDataCard(combinedData, 'combined'));
              }, 800); 

         } else {
             //NOTE DEV: if selected check other than posts and users
             const results = await Promise.all(
                selectedEndpoints.map(async endpoint => {
                    const data = await fetchData(endpoint);
                    return createDataCard(data.slice(0, 10), endpoint);
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

 apiForm.addEventListener('submit', handleSubmit);
 clearBtn.addEventListener('click', handleClear);
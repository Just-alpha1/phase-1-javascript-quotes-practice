const API_URL = 'http://localhost:3000';
let isSortedByAuthor = false;

// Fetch and render quotes
function fetchQuotes() {
  const url = isSortedByAuthor
    ? `${API_URL}/quotes?_sort=author&_embed=likes`
    : `${API_URL}/quotes?_embed=likes`;
  fetch(url)
    .then(response => response.json())
    .then(quotes => renderQuotes(quotes))
    .catch(error => console.error('Error fetching quotes:', error));
}

// Render quotes to the DOM
function renderQuotes(quotes) {
  const quoteList = document.getElementById('quote-list');
  quoteList.innerHTML = '';
  quotes.forEach(quote => {
    const quoteCard = document.createElement('li');
    quoteCard.className = 'quote-card';
    quoteCard.innerHTML = `
      <blockquote class="blockquote">
        <p class="mb-0">${quote.quote}</p>
        <footer class="blockquote-footer">${quote.author}</footer>
        <br>
        <button class='btn-success'>Likes: <span>${quote.likes ? quote.likes.length : 0}</span></button>
        <button class='btn-danger'>Delete</button>
        <button class='btn-edit'>Edit</button>
        <form class="edit-form" style="display: none;">
          <label for="edit-quote-${quote.id}">Quote:</label>
          <input type="text" id="edit-quote-${quote.id}" value="${quote.quote}" required>
          <label for="edit-author-${quote.id}">Author:</label>
          <input type="text" id="edit-author-${quote.id}" value="${quote.author}" required>
          <button type="submit">Save</button>
        </form>
      </blockquote>
    `;
    quoteList.appendChild(quoteCard);

    // Event listeners for buttons
    quoteCard.querySelector('.btn-success').addEventListener('click', () => handleLike(quote.id));
    quoteCard.querySelector('.btn-danger').addEventListener('click', () => handleDelete(quote.id));
    quoteCard.querySelector('.btn-edit').addEventListener('click', () => toggleEditForm(quote.id));
    quoteCard.querySelector('.edit-form').addEventListener('submit', (e) => handleEdit(e, quote.id));
  });
}

// Handle new quote submission
function handleQuoteSubmission(e) {
  e.preventDefault();
  const quoteInput = document.getElementById('quote').value;
  const authorInput = document.getElementById('author').value;

  fetch(`${API_URL}/quotes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quote: quoteInput, author: authorInput })
  })
    .then(response => {
      if (!response.ok) throw new Error('Failed to create quote');
      return response.json();
    })
    .then(() => {
      fetchQuotes(); // Pessimistic rendering: refresh after successful POST
      e.target.reset();
    })
    .catch(error => console.error('Error creating quote:', error));
}

// Handle like button
function handleLike(quoteId) {
  fetch(`${API_URL}/likes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quoteId: Number(quoteId), createdAt: Math.floor(Date.now() / 1000) })
  })
    .then(response => {
      if (!response.ok) throw new Error('Failed to create like');
      return response.json();
    })
    .then(() => fetchQuotes())
    .catch(error => console.error('Error liking quote:', error));
}

// Handle delete button
function handleDelete(quoteId) {
  fetch(`${API_URL}/quotes/${quoteId}`, {
    method: 'DELETE'
  })
    .then(response => {
      if (!response.ok) throw new Error('Failed to delete quote');
      fetchQuotes();
    })
    .catch(error => console.error('Error deleting quote:', error));
}

// Handle edit button (Bonus)
function toggleEditForm(quoteId) {
  const form = document.querySelector(`#edit-quote-${quoteId}`).closest('form');
  form.style.display = form.style.display === 'none' ? 'block' : 'none';
}

// Handle edit submission (Bonus)
function handleEdit(e, quoteId) {
  e.preventDefault();
  const quoteInput = document.getElementById(`edit-quote-${quoteId}`).value;
  const authorInput = document.getElementById(`edit-author-${quoteId}`).value;

  fetch(`${API_URL}/quotes/${quoteId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quote: quoteInput, author: authorInput })
  })
    .then(response => {
      if (!response.ok) throw new Error('Failed to update quote');
      return response.json();
    })
    .then(() => fetchQuotes())
    .catch(error => console.error('Error updating quote:', error));
}

// Handle sort button (Bonus)
function handleSort() {
  isSortedByAuthor = !isSortedByAuthor;
  document.getElementById('sort-btn').textContent = `Sort by Author: ${isSortedByAuthor ? 'On' : 'Off'}`;
  fetchQuotes();
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  fetchQuotes();
  document.getElementById('quote-form').addEventListener('submit', handleQuoteSubmission);
  document.getElementById('sort-btn').addEventListener('click', handleSort);
});
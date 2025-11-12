/**
 * Last Updated Date Handler
 * Updates the last-updated-date element with the current date
 */

document.addEventListener('DOMContentLoaded', function() {
    const dateElement = document.getElementById('last-updated-date');

    if (dateElement) {
        const currentDate = new Date();

        // Format: November 12, 2025
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        const formattedDate = currentDate.toLocaleDateString('en-US', options);

        dateElement.textContent = formattedDate;
    }
});

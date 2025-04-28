// Button Status
const ButtonStatus = document.querySelectorAll('[button-status]')

if (ButtonStatus.length > 0) {
    let url = new URL(window.location.href);
    console.log(url);
    ButtonStatus.forEach((button) => {
        button.addEventListener('click', () => {
            const status = button.getAttribute('button-status')

            if (status) {
                url.searchParams.set('status', status);
            } else {
                url.searchParams.delete('status');
            }
            window.location.href = url.href;
        })
    })
}

console.log(ButtonStatus);
// End Button Status
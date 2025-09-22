// Gestione semplice del form footer per Netlify
document.addEventListener('DOMContentLoaded', function() {
    const footerButton = document.getElementById('footer-request-cta');
    
    if (footerButton) {
        footerButton.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Prendi i valori dal form del footer
            const nome = document.getElementById('footer-nome').value;
            const cognome = document.getElementById('footer-cognome').value;
            const messaggio = document.getElementById('footer-messaggio').value;
            
            // Validazione base
            if (!nome || !cognome || !messaggio) {
                alert('Per favore compila tutti i campi');
                return;
            }
            
            // Crea FormData per Netlify
            const formData = new FormData();
            formData.append("form-name", "contact-footer");
            formData.append("nome", nome);
            formData.append("cognome", cognome);
            formData.append("messaggio", messaggio);
            
            // Disabilita il bottone
            footerButton.style.opacity = '0.5';
            footerButton.style.pointerEvents = 'none';
            
            // Invia il form
            fetch('/', {
                method: 'POST',
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams(formData).toString()
            })
            .then(() => {
                // Successo
                alert('Grazie! Il tuo messaggio è stato inviato.');
                // Reset form
                document.getElementById('footer-nome').value = '';
                document.getElementById('footer-cognome').value = '';
                document.getElementById('footer-messaggio').value = '';
            })
            .catch(() => {
                // Errore
                alert('Ops! Qualcosa è andato storto. Riprova.');
            })
            .finally(() => {
                // Riabilita il bottone
                footerButton.style.opacity = '1';
                footerButton.style.pointerEvents = 'auto';
            });
        });
    }
});
const API_URL = 'https://projeto-sistema-salas.onrender.com/api';

// Verificar se já está logado
if (localStorage.getItem('token')) {
    window.location.href = 'dashboard.html';
}

// Form de login
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const loginBtn = document.getElementById('loginBtn');
    
    loginBtn.disabled = true;
    loginBtn.textContent = 'Entrando...';
    
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Salvar token e dados do usuário
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            showAlert('Login realizado com sucesso!', 'success');
            
            // Redirecionar para dashboard
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        } else {
            showAlert(data.error || 'Erro ao fazer login', 'error');
        }
    } catch (error) {
        console.error('Erro:', error);
        showAlert('Erro ao conectar com o servidor', 'error');
    } finally {
        loginBtn.disabled = false;
        loginBtn.textContent = 'Entrar';
    }
});

function showAlert(message, type) {
    const alertDiv = document.getElementById('alert');
    alertDiv.innerHTML = `
        <div class="alert alert-${type}">
            ${message}
        </div>
    `;
    
    setTimeout(() => {
        alertDiv.innerHTML = '';
    }, 5000);
}
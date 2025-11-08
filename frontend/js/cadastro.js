const API_URL = 'https://projeto-sistema-salas.onrender.com/api';

// Verificar autenticação e permissão
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user'));

if (!token || !user) {
    window.location.href = 'index.html';
}

if (user.role !== 'admin') {
    alert('Acesso negado! Apenas administradores podem acessar esta página.');
    window.location.href = 'dashboard.html';
}

// Form de cadastro
document.getElementById('cadastroForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const cadastroBtn = document.getElementById('cadastroBtn');
    
    // Validar senha
    if (password.length < 6) {
        showAlert('A senha deve ter no mínimo 6 caracteres', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showAlert('As senhas não coincidem', 'error');
        return;
    }
    
    cadastroBtn.disabled = true;
    cadastroBtn.textContent = 'Cadastrando...';
    
    try {
        const response = await fetch(`${API_URL}/users/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ name, email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showAlert('Professor cadastrado com sucesso!', 'success');
            
            // Limpar formulário
            document.getElementById('cadastroForm').reset();
            
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 2000);
        } else {
            showAlert(data.error || 'Erro ao cadastrar professor', 'error');
        }
    } catch (error) {
        console.error('Erro:', error);
        showAlert('Erro ao conectar com o servidor', 'error');
    } finally {
        cadastroBtn.disabled = false;
        cadastroBtn.textContent = 'Cadastrar Professor';
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
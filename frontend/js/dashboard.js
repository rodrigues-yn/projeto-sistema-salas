const API_URL = 'http://localhost:3000/api';

// Verificar autenticação
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user'));

if (!token || !user) {
    window.location.href = 'index.html';
}

// Configurar interface baseado no papel do usuário
document.getElementById('userName').textContent = user.name;
document.getElementById('userRole').textContent = user.role === 'admin' ? 'Administrador' : 'Professor';
document.getElementById('userRole').classList.add(user.role === 'admin' ? 'badge-admin' : '');

if (user.role === 'admin') {
    document.getElementById('pendentesTab').style.display = 'block';
    document.getElementById('cadastroTab').style.display = 'block';
}

// Carregar dados iniciais
loadSalas();
loadMinhasReservas();
if (user.role === 'admin') {
    loadReservasPendentes();
}

// Função para trocar de tab
function switchTab(tabName) {
    // Remover classe active de todas as tabs
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    // Ativar tab selecionada
    document.getElementById(`${tabName}-tab`).classList.add('active');
    event.target.classList.add('active');
    
    // Recarregar dados da tab
    if (tabName === 'salas') {
        loadSalas();
    } else if (tabName === 'minhas-reservas') {
        loadMinhasReservas();
    } else if (tabName === 'pendentes') {
        loadReservasPendentes();
    }
}

// Carregar salas
async function loadSalas() {
    const grid = document.getElementById('salasGrid');
    const loading = document.getElementById('loadingSalas');
    
    loading.style.display = 'block';
    grid.innerHTML = '';
    
    try {
        const response = await fetch(`${API_URL}/rooms`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const salas = await response.json();
        
        loading.style.display = 'none';
        
        if (salas.length === 0) {
            grid.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📭</div><p>Nenhuma sala cadastrada</p></div>';
            return;
        }
        
        salas.forEach(sala => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <div class="card-header">
                    <h3 class="card-title">${sala.name}</h3>
                    <span class="badge">${sala.type}</span>
                </div>
                <p class="card-info">📊 Capacidade: ${sala.capacity} pessoas</p>
                <p class="card-info">${sala.description || 'Sem descrição'}</p>
                <div class="card-actions">
                    <button class="btn btn-primary btn-small" onclick="openReservaModal('${sala.id}', '${sala.name}')">
                        Reservar
                    </button>
                </div>
            `;
            grid.appendChild(card);
        });
    } catch (error) {
        console.error('Erro:', error);
        loading.style.display = 'none';
        showAlert('Erro ao carregar salas', 'error');
    }
}

// Carregar minhas reservas
async function loadMinhasReservas() {
    const grid = document.getElementById('reservasGrid');
    const loading = document.getElementById('loadingReservas');
    
    loading.style.display = 'block';
    grid.innerHTML = '';
    
    try {
        const response = await fetch(`${API_URL}/reservations`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const reservas = await response.json();
        
        loading.style.display = 'none';
        
        if (reservas.length === 0) {
            grid.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📅</div><p>Você não possui reservas</p></div>';
            return;
        }
        
        reservas.forEach(reserva => {
            const card = document.createElement('div');
            card.className = 'card';
            
            const statusClass = `status-${reserva.status}`;
            const statusText = {
                'pending': 'Pendente',
                'approved': 'Aprovada',
                'rejected': 'Rejeitada'
            }[reserva.status];
            
            card.innerHTML = `
                <div class="card-header">
                    <h3 class="card-title">${reserva.room.name}</h3>
                    <span class="status-badge ${statusClass}">${statusText}</span>
                </div>
                <p class="card-info">📅 ${formatDate(reserva.date)}</p>
                <p class="card-info">🕐 ${reserva.start_time} - ${reserva.end_time}</p>
                ${reserva.reason ? `<p class="card-info">📝 ${reserva.reason}</p>` : ''}
                ${reserva.status === 'pending' ? `
                    <div class="card-actions">
                        <button class="btn btn-danger btn-small" onclick="cancelarReserva('${reserva.id}')">
                            Cancelar
                        </button>
                    </div>
                ` : ''}
            `;
            grid.appendChild(card);
        });
    } catch (error) {
        console.error('Erro:', error);
        loading.style.display = 'none';
        showAlert('Erro ao carregar reservas', 'error');
    }
}

// Carregar reservas pendentes (admin)
async function loadReservasPendentes() {
    const grid = document.getElementById('pendentesGrid');
    const loading = document.getElementById('loadingPendentes');
    
    loading.style.display = 'block';
    grid.innerHTML = '';
    
    try {
        const response = await fetch(`${API_URL}/reservations?status=pending`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const reservas = await response.json();
        
        loading.style.display = 'none';
        
        if (reservas.length === 0) {
            grid.innerHTML = '<div class="empty-state"><div class="empty-state-icon">✅</div><p>Nenhuma reserva pendente</p></div>';
            return;
        }
        
        reservas.forEach(reserva => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <div class="card-header">
                    <h3 class="card-title">${reserva.room.name}</h3>
                    <span class="status-badge status-pending">Pendente</span>
                </div>
                <p class="card-info">👤 ${reserva.user.name}</p>
                <p class="card-info">📅 ${formatDate(reserva.date)}</p>
                <p class="card-info">🕐 ${reserva.start_time} - ${reserva.end_time}</p>
                ${reserva.reason ? `<p class="card-info">📝 ${reserva.reason}</p>` : ''}
                <div class="card-actions">
                    <button class="btn btn-success btn-small" onclick="aprovarReserva('${reserva.id}')">
                        Aprovar
                    </button>
                    <button class="btn btn-danger btn-small" onclick="rejeitarReserva('${reserva.id}')">
                        Rejeitar
                    </button>
                </div>
            `;
            grid.appendChild(card);
        });
    } catch (error) {
        console.error('Erro:', error);
        loading.style.display = 'none';
        showAlert('Erro ao carregar reservas pendentes', 'error');
    }
}

// Abrir modal de reserva
function openReservaModal(roomId, roomName) {
    document.getElementById('roomId').value = roomId;
    document.getElementById('roomName').value = roomName;
    document.getElementById('modalReserva').classList.add('active');
    
    // Definir data mínima como hoje
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date').setAttribute('min', today);
    document.getElementById('date').value = today;
}

// Fechar modal
function closeModal() {
    document.getElementById('modalReserva').classList.remove('active');
    document.getElementById('reservaForm').reset();
    document.getElementById('availability').style.display = 'none';
}

// Verificar disponibilidade
document.getElementById('date').addEventListener('change', checkAvailability);

async function checkAvailability() {
    const roomId = document.getElementById('roomId').value;
    const date = document.getElementById('date').value;
    
    if (!roomId || !date) return;
    
    try {
        const response = await fetch(`${API_URL}/reservations/availability/${roomId}?date=${date}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const ocupados = await response.json();
        const availabilityDiv = document.getElementById('availability');
        const list = document.getElementById('availabilityList');
        
        if (ocupados.length === 0) {
            availabilityDiv.style.display = 'none';
        } else {
            list.innerHTML = ocupados.map(slot => `
                <div class="time-slot occupied">
                    ${slot.start_time} - ${slot.end_time}
                </div>
            `).join('');
            availabilityDiv.style.display = 'block';
        }
    } catch (error) {
        console.error('Erro:', error);
    }
}

// Submeter reserva
document.getElementById('reservaForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const roomId = document.getElementById('roomId').value;
    const date = document.getElementById('date').value;
    const startTime = document.getElementById('startTime').value;
    const endTime = document.getElementById('endTime').value;
    const reason = document.getElementById('reason').value;
    
    // Validar horários
    if (startTime >= endTime) {
        showAlert('Horário de término deve ser maior que o de início', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/reservations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                room_id: roomId,
                date,
                start_time: startTime,
                end_time: endTime,
                reason
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showAlert('Reserva solicitada com sucesso! Aguarde aprovação.', 'success');
            closeModal();
            loadMinhasReservas();
        } else {
            showAlert(data.error || 'Erro ao criar reserva', 'error');
        }
    } catch (error) {
        console.error('Erro:', error);
        showAlert('Erro ao conectar com o servidor', 'error');
    }
});

// Cancelar reserva
async function cancelarReserva(id) {
    if (!confirm('Deseja realmente cancelar esta reserva?')) return;
    
    try {
        const response = await fetch(`${API_URL}/reservations/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            showAlert('Reserva cancelada com sucesso', 'success');
            loadMinhasReservas();
        } else {
            const data = await response.json();
            showAlert(data.error || 'Erro ao cancelar reserva', 'error');
        }
    } catch (error) {
        console.error('Erro:', error);
        showAlert('Erro ao conectar com o servidor', 'error');
    }
}

// Aprovar reserva
async function aprovarReserva(id) {
    try {
        const response = await fetch(`${API_URL}/reservations/${id}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status: 'approved' })
        });
        
        if (response.ok) {
            showAlert('Reserva aprovada com sucesso', 'success');
            loadReservasPendentes();
        } else {
            const data = await response.json();
            showAlert(data.error || 'Erro ao aprovar reserva', 'error');
        }
    } catch (error) {
        console.error('Erro:', error);
        showAlert('Erro ao conectar com o servidor', 'error');
    }
}

// Rejeitar reserva
async function rejeitarReserva(id) {
    if (!confirm('Deseja realmente rejeitar esta reserva?')) return;
    
    try {
        const response = await fetch(`${API_URL}/reservations/${id}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status: 'rejected' })
        });
        
        if (response.ok) {
            showAlert('Reserva rejeitada', 'success');
            loadReservasPendentes();
        } else {
            const data = await response.json();
            showAlert(data.error || 'Erro ao rejeitar reserva', 'error');
        }
    } catch (error) {
        console.error('Erro:', error);
        showAlert('Erro ao conectar com o servidor', 'error');
    }
}

// Logout
function logout() {
    if (confirm('Deseja realmente sair?')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    }
}

// Função auxiliar para formatar data
function formatDate(dateString) {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('pt-BR');
}

// Função para mostrar alertas
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

// Fechar modal ao clicar fora
document.getElementById('modalReserva').addEventListener('click', (e) => {
    if (e.target.id === 'modalReserva') {
        closeModal();
    }
});
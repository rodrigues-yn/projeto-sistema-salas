const API_URL = 'https://projeto-sistema-salas.onrender.com/api';

// Verificar autenticação
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user'));

if (!token || !user) {
    window.location.href = 'index.html';
}

// Configurar interface baseado no papel do usuário
document.getElementById('userName').textContent = user.name;
document.getElementById('userRole').textContent = user.role === 'admin' ? 'Administrador' : 'Professor';

// Adicionar classe apenas se for admin
if (user.role === 'admin') {
    document.getElementById('userRole').classList.add('badge-admin');
    document.getElementById('pendentesTab').style.display = 'block';
    document.getElementById('cadastroTab').style.display = 'block';
    document.getElementById('btnNovaSala').style.display = 'block';
}

// Variáveis globais
let allRooms = [];
let currentViewMode = 'grid';
let currentReservationData = null;

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
        allRooms = salas; // Guardar para o calendário
        
        loading.style.display = 'none';
        
        // Preencher select de salas para o calendário
        const filterRoom = document.getElementById('filterRoom');
        filterRoom.innerHTML = '<option value="">Selecione uma sala</option>';
        salas.forEach(sala => {
            const option = document.createElement('option');
            option.value = sala.id;
            option.textContent = sala.name;
            filterRoom.appendChild(option);
        });
        
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

// Mudar modo de visualização
function changeViewMode() {
    const mode = document.getElementById('viewMode').value;
    currentViewMode = mode;
    
    const grid = document.getElementById('salasGrid');
    const calendar = document.getElementById('calendarView');
    const filters = document.getElementById('calendarFilters');
    
    if (mode === 'grid') {
        grid.style.display = 'grid';
        calendar.style.display = 'none';
        filters.style.display = 'none';
    } else {
        grid.style.display = 'none';
        calendar.style.display = 'block';
        filters.style.display = 'flex';
        
        // Definir data padrão como hoje
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('filterDate').value = today;
        
        // Se já tiver uma sala selecionada, carregar
        const selectedRoom = document.getElementById('filterRoom').value;
        if (selectedRoom) {
            loadCalendar();
        }
    }
}

// Carregar calendário
async function loadCalendar() {
    const roomId = document.getElementById('filterRoom').value;
    const date = document.getElementById('filterDate').value;
    const container = document.getElementById('calendarContainer');
    
    if (!roomId || !date) {
        container.innerHTML = '<div class="calendar-empty">📅 Selecione uma sala e uma data</div>';
        return;
    }
    
    try {
        // Buscar reservas para a sala e data
        const response = await fetch(`${API_URL}/reservations/availability/${roomId}?date=${date}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const reservations = await response.json();
        
        // Buscar informações da sala
        const room = allRooms.find(r => r.id === roomId);
        
        // Renderizar calendário
        renderCalendar(room, date, reservations);
        
    } catch (error) {
        console.error('Erro ao carregar calendário:', error);
        container.innerHTML = '<div class="calendar-empty">❌ Erro ao carregar disponibilidade</div>';
    }
}

// Renderizar calendário
function renderCalendar(room, date, reservations) {
    const container = document.getElementById('calendarContainer');
    const dateObj = new Date(date + 'T00:00:00');
    const dateFormatted = dateObj.toLocaleDateString('pt-BR', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    let html = `
        <div class="calendar-container">
            <div class="calendar-header">
                ${room.name} - ${dateFormatted}
            </div>
            <div class="calendar-timeline">
                <div class="calendar-hours">
    `;
    
    // Horários de 7h às 22h
    for (let hour = 7; hour <= 22; hour++) {
        html += `<div class="calendar-hour">${hour.toString().padStart(2, '0')}:00</div>`;
    }
    
    html += `
                </div>
                <div class="calendar-events" id="calendarEventsContainer">
    `;
    
    // Adicionar eventos (reservas)
    reservations.forEach(reservation => {
        const startParts = reservation.start_time.split(':');
        const endParts = reservation.end_time.split(':');
        const startHour = parseInt(startParts[0]);
        const startMin = parseInt(startParts[1]);
        const endHour = parseInt(endParts[0]);
        const endMin = parseInt(endParts[1]);
        
        // Calcular posição e altura
        const top = ((startHour - 7) * 60 + startMin);
        const duration = ((endHour - startHour) * 60 + (endMin - startMin));
        
        const statusClass = reservation.status || 'approved';
        const statusText = {
            'pending': 'Pendente',
            'approved': 'Confirmada',
            'rejected': 'Rejeitada'
        }[statusClass] || 'Confirmada';
        
        html += `
            <div class="calendar-event ${statusClass}" style="top: ${top}px; height: ${duration}px;">
                <div class="calendar-event-title">${reservation.user?.name || 'Reservado'}</div>
                <div class="calendar-event-time">${reservation.start_time} - ${reservation.end_time}</div>
                <div style="font-size: 10px; margin-top: 2px;">${statusText}</div>
            </div>
        `;
    });
    
    if (reservations.length === 0) {
        html += '<div class="calendar-empty">✅ Nenhuma reserva para este dia</div>';
    }
    
    html += `
                </div>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
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
            
            const canEdit = reserva.status === 'approved' || reserva.status === 'pending';
            
            card.innerHTML = `
                <div class="card-header">
                    <h3 class="card-title">${reserva.room.name}</h3>
                    <span class="status-badge ${statusClass}">${statusText}</span>
                </div>
                <p class="card-info">📅 ${formatDate(reserva.date)}</p>
                <p class="card-info">🕐 ${reserva.start_time} - ${reserva.end_time}</p>
                ${reserva.reason ? `<p class="card-info">📝 ${reserva.reason}</p>` : ''}
                <div class="card-actions">
                    ${canEdit ? `
                        <button class="btn btn-primary btn-small" onclick='editarReserva(${JSON.stringify(reserva)})'>
                            ✏️ Editar
                        </button>
                    ` : ''}
                    ${reserva.status === 'pending' ? `
                        <button class="btn btn-danger btn-small" onclick="cancelarReserva('${reserva.id}')">
                            Cancelar
                        </button>
                    ` : ''}
                </div>
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
        console.log('🔍 Buscando reservas pendentes...');
        
        const response = await fetch(`${API_URL}/reservations?status=pending`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('📡 Status da resposta:', response.status);
        
        if (!response.ok) {
            throw new Error(`Erro na API: ${response.status}`);
        }
        
        const reservas = await response.json();
        
        console.log('📋 Reservas pendentes:', reservas);
        
        loading.style.display = 'none';
        
        if (!reservas || reservas.length === 0) {
            grid.innerHTML = '<div class="empty-state"><div class="empty-state-icon">✅</div><p>Nenhuma reserva pendente</p></div>';
            return;
        }
        
        reservas.forEach(reserva => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <div class="card-header">
                    <h3 class="card-title">${reserva.room?.name || 'Sala não identificada'}</h3>
                    <span class="status-badge status-pending">Pendente</span>
                </div>
                <p class="card-info">👤 ${reserva.user?.name || 'Usuário não identificado'}</p>
                <p class="card-info">📧 ${reserva.user?.email || ''}</p>
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
        console.error('❌ Erro ao carregar pendentes:', error);
        loading.style.display = 'none';
        showAlert('Erro ao carregar reservas pendentes: ' + error.message, 'error');
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

document.getElementById('modalNovaSala').addEventListener('click', (e) => {
    if (e.target.id === 'modalNovaSala') {
        closeNovaSalaModal();
    }
});

document.getElementById('modalEditarReserva').addEventListener('click', (e) => {
    if (e.target.id === 'modalEditarReserva') {
        closeEditarReservaModal();
    }
});

// ========================================
// FUNÇÕES PARA NOVA SALA
// ========================================

function openNovaSalaModal() {
    document.getElementById('modalNovaSala').classList.add('active');
}

function closeNovaSalaModal() {
    document.getElementById('modalNovaSala').classList.remove('active');
    document.getElementById('novaSalaForm').reset();
}

document.getElementById('novaSalaForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('salaNome').value;
    const capacity = document.getElementById('salaCapacidade').value;
    const type = document.getElementById('salaTipo').value;
    const description = document.getElementById('salaDescricao').value;
    
    try {
        const response = await fetch(`${API_URL}/rooms`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ name, capacity: parseInt(capacity), type, description })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showAlert('Sala criada com sucesso!', 'success');
            closeNovaSalaModal();
            loadSalas();
        } else {
            showAlert(data.error || 'Erro ao criar sala', 'error');
        }
    } catch (error) {
        console.error('Erro:', error);
        showAlert('Erro ao conectar com o servidor', 'error');
    }
});

// ========================================
// FUNÇÕES PARA EDITAR RESERVA
// ========================================

function editarReserva(reserva) {
    currentReservationData = reserva;
    
    document.getElementById('editReservaId').value = reserva.id;
    document.getElementById('editRoomName').value = reserva.room.name;
    document.getElementById('editDate').value = reserva.date;
    document.getElementById('editStartTime').value = reserva.start_time;
    document.getElementById('editEndTime').value = reserva.end_time;
    document.getElementById('editReason').value = reserva.reason || '';
    
    // Definir data mínima como hoje
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('editDate').setAttribute('min', today);
    
    document.getElementById('modalEditarReserva').classList.add('active');
}

function closeEditarReservaModal() {
    document.getElementById('modalEditarReserva').classList.remove('active');
    document.getElementById('editarReservaForm').reset();
    currentReservationData = null;
}

document.getElementById('editarReservaForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const date = document.getElementById('editDate').value;
    const startTime = document.getElementById('editStartTime').value;
    const endTime = document.getElementById('editEndTime').value;
    const reason = document.getElementById('editReason').value;
    
    // Validar horários
    if (startTime >= endTime) {
        showAlert('Horário de término deve ser maior que o de início', 'error');
        return;
    }
    
    try {
        // Primeiro, cancelar a reserva antiga
        const deleteResponse = await fetch(`${API_URL}/reservations/${currentReservationData.id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!deleteResponse.ok) {
            throw new Error('Erro ao cancelar reserva anterior');
        }
        
        // Depois, criar nova reserva (que ficará pendente)
        const createResponse = await fetch(`${API_URL}/reservations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                room_id: currentReservationData.room.id,
                date,
                start_time: startTime,
                end_time: endTime,
                reason
            })
        });
        
        const data = await createResponse.json();
        
        if (createResponse.ok) {
            showAlert('Reserva editada! Aguardando nova aprovação do administrador.', 'success');
            closeEditarReservaModal();
            loadMinhasReservas();
        } else {
            showAlert(data.error || 'Erro ao editar reserva', 'error');
        }
    } catch (error) {
        console.error('Erro:', error);
        showAlert('Erro ao conectar com o servidor', 'error');
    }
});
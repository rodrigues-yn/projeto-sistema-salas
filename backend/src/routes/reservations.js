const express = require('express');
const supabase = require('../config/supabase');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// Listar reservas
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { status } = req.query;
    let query = supabase
      .from('reservations')
      .select(`
        *,
        room:rooms(name, type),
        user:users(name, email)
      `)
      .order('date', { ascending: true })
      .order('start_time', { ascending: true });

    // Filtrar por status se fornecido
    if (status) {
      query = query.eq('status', status);
    }

    // Se for professor, mostrar apenas suas reservas
    if (req.user.role === 'professor') {
      query = query.eq('user_id', req.user.id);
    }

    const { data: reservations, error } = await query;

    if (error) throw error;

    res.json(reservations);
  } catch (error) {
    console.error('Erro ao listar reservas:', error);
    res.status(500).json({ error: 'Erro ao listar reservas' });
  }
});

// Criar reserva
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { room_id, date, start_time, end_time, reason } = req.body;

    if (!room_id || !date || !start_time || !end_time) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    // Verificar conflito de horário
    const { data: conflicts } = await supabase
      .from('reservations')
      .select('*')
      .eq('room_id', room_id)
      .eq('date', date)
      .in('status', ['pending', 'approved'])
      .or(`and(start_time.lte.${end_time},end_time.gte.${start_time})`);

    if (conflicts && conflicts.length > 0) {
      return res.status(400).json({ error: 'Horário indisponível para esta sala' });
    }

    const { data: reservation, error } = await supabase
      .from('reservations')
      .insert([{
        room_id,
        user_id: req.user.id,
        date,
        start_time,
        end_time,
        reason,
        status: 'pending'
      }])
      .select(`
        *,
        room:rooms(name, type),
        user:users(name, email)
      `)
      .single();

    if (error) throw error;

    res.status(201).json(reservation);
  } catch (error) {
    console.error('Erro ao criar reserva:', error);
    res.status(500).json({ error: 'Erro ao criar reserva' });
  }
});

// Aprovar/Rejeitar reserva (apenas admin)
router.patch('/:id/status', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Status inválido' });
    }

    const { data: reservation, error } = await supabase
      .from('reservations')
      .update({ status })
      .eq('id', id)
      .select(`
        *,
        room:rooms(name, type),
        user:users(name, email)
      `)
      .single();

    if (error) throw error;

    res.json(reservation);
  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    res.status(500).json({ error: 'Erro ao atualizar status da reserva' });
  }
});

// Cancelar reserva
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    let query = supabase
      .from('reservations')
      .delete()
      .eq('id', id);

    // Professor só pode deletar suas próprias reservas
    if (req.user.role === 'professor') {
      query = query.eq('user_id', req.user.id);
    }

    const { error } = await query;

    if (error) throw error;

    res.json({ message: 'Reserva cancelada com sucesso' });
  } catch (error) {
    console.error('Erro ao cancelar reserva:', error);
    res.status(500).json({ error: 'Erro ao cancelar reserva' });
  }
});

// Verificar disponibilidade
router.get('/availability/:room_id', authMiddleware, async (req, res) => {
  try {
    const { room_id } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ error: 'Data é obrigatória' });
    }

    const { data: reservations, error } = await supabase
      .from('reservations')
      .select('start_time, end_time')
      .eq('room_id', room_id)
      .eq('date', date)
      .in('status', ['pending', 'approved'])
      .order('start_time', { ascending: true });

    if (error) throw error;

    res.json(reservations || []);
  } catch (error) {
    console.error('Erro ao verificar disponibilidade:', error);
    res.status(500).json({ error: 'Erro ao verificar disponibilidade' });
  }
});

module.exports = router;
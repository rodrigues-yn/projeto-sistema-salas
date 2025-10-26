const express = require('express');
const supabase = require('../config/supabase');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// Listar todas as salas
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { data: rooms, error } = await supabase
      .from('rooms')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;

    res.json(rooms);
  } catch (error) {
    console.error('Erro ao listar salas:', error);
    res.status(500).json({ error: 'Erro ao listar salas' });
  }
});

// Criar sala (apenas admin)
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, capacity, type, description } = req.body;

    if (!name || !capacity || !type) {
      return res.status(400).json({ error: 'Nome, capacidade e tipo são obrigatórios' });
    }

    const { data: room, error } = await supabase
      .from('rooms')
      .insert([{ name, capacity, type, description }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(room);
  } catch (error) {
    console.error('Erro ao criar sala:', error);
    res.status(500).json({ error: 'Erro ao criar sala' });
  }
});

// Atualizar sala (apenas admin)
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, capacity, type, description } = req.body;

    const { data: room, error } = await supabase
      .from('rooms')
      .update({ name, capacity, type, description })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json(room);
  } catch (error) {
    console.error('Erro ao atualizar sala:', error);
    res.status(500).json({ error: 'Erro ao atualizar sala' });
  }
});

// Deletar sala (apenas admin)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('rooms')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ message: 'Sala deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar sala:', error);
    res.status(500).json({ error: 'Erro ao deletar sala' });
  }
});

module.exports = router;
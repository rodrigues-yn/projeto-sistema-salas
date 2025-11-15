const express = require('express');
const bcrypt = require('bcrypt');
const supabase = require('../config/supabase');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// Cadastrar professor (apenas admin)
router.post('/register', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    // Verificar se email já existe
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Inserir usuário
    const { data: newUser, error } = await supabase
      .from('users')
      .insert([
        {
          name,
          email,
          password: hashedPassword,
          role: 'professor'
        }
      ])
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.status(201).json({
      message: 'Professor cadastrado com sucesso',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error('Erro no cadastro:', error);
    res.status(500).json({ error: 'Erro ao cadastrar professor' });
  }
});

// Listar professores (apenas admin)
router.get('/professors', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { data: professors, error } = await supabase
      .from('users')
      .select('id, name, email, created_at')
      .eq('role', 'professor')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(professors);
  } catch (error) {
    console.error('Erro ao listar professores:', error);
    res.status(500).json({ error: 'Erro ao listar professores' });
  }
});

module.exports = router;
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

const workshops = [
    { name: 'Cauê Oliveira', title: 'O papel do pai como educador' },
    { name: 'Rosely Garcia', title: 'Treinamento e Formação de Professores' },
    { name: 'Elmer Pires', title: 'Liturgias na Escola Clássica' },
    { name: 'Maurício Fonseca', title: 'Educando meninos e Educando Meninas' },
    { name: 'Matheus Macedo', title: 'A beleza em uma escola Clássica' },
    { name: 'Cleiton Balieiro', title: 'Quadrivium' },
    { name: 'Thiago Dutra', title: 'Transicionando uma escola para a educação clássica' },
    { name: 'Rodrigo Brotto', title: 'Disciplina Virtuosa' },
    { name: 'Marília Chimara', title: 'Trivium e Literatura' },
    { name: 'Anderson Queiroz', title: 'Educação domiciliar e as Umbrella Schools' }
];

async function seed() {
    console.log('--- Iniciando Seed de Palestrantes e Agenda ---');

    // 1. Inserir Palestrantes únicos das oficinas
    for (const w of workshops) {
        const { data: speaker } = await supabase.from('speakers').insert({
            name: w.name,
            institution: 'Palestrante CIECC'
        }).select().single();

        if (speaker) {
            await supabase.from('agenda_sessions').insert({
                title: w.title,
                speaker_id: speaker.id,
                session_date: '2026-05-02',
                start_time: '14:15:00',
                end_time: '15:15:00',
                room: 'Salas Acadêmicas',
                category: 'Oficina'
            });
        }
    }

    // 2. Inserir Palestras Principais (Exemplos)
    const mainSpeakers = [
        { name: 'Thiago Dutra', institution: 'CIECC' },
        { name: 'Chris Schlect', institution: 'Professor' },
        { name: 'Keith Nix', institution: 'Diretor' }
    ];

    for (const s of mainSpeakers) {
        const { data: speaker } = await supabase.from('speakers').insert(s).select().single();
        if (speaker && s.name === 'Thiago Dutra') {
             await supabase.from('agenda_sessions').insert({
                title: 'História da Educação Cristã Clássica (Paideia Grega)',
                speaker_id: speaker.id,
                session_date: '2026-05-01',
                start_time: '15:00:00',
                end_time: '15:45:00',
                room: 'Auditório Principal',
                category: 'Palestra'
            });
        }
    }

    console.log('--- Seed Concluído! ---');
}

seed();

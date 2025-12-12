// backend/seeder.js (KODE FINAL DENGAN 10 PROYEK)
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const colors = require('colors'); 
const User = require('./models/User');
const Project = require('./models/Project');
const Task = require('./models/Task');
const Column = require('./models/Column');

dotenv.config();

// Koneksi ke DB
mongoose.connect(process.env.MONGO_URI);

const PROJECT_COUNT = 10;
const defaultColumnsData = [
    { title: 'To Do', columnId: 'todo', order: 1 },
    { title: 'In Progress', columnId: 'in-progress', order: 2 },
    { title: 'Testing', columnId: 'testing', order: 3 }, // Tambah satu kolom baru
    { title: 'Done', columnId: 'done', order: 4 },
];

const importData = async () => {
    try {
        // 1. BERSIHKAN DATABASE LAMA
        // Hapus index lama secara paksa untuk menghindari error E11000
        await mongoose.connection.collection('columns').drop().catch(() => {});
        
        await Task.deleteMany();
        await Column.deleteMany();
        await Project.deleteMany();
        await User.deleteMany();

        console.log('Data Lama Dihapus...'.red.inverse);

        // 2. BUAT MULTIPLE USERS
        const user1 = await User.create({
            name: 'Admin Owner',
            email: 'admin@example.com',
            password: '123456', 
        });
        const user2 = await User.create({
            name: 'Dev Member',
            email: 'dev@example.com',
            password: '123456', 
        });
        const users = [user1, user2];

        console.log(`2 Users Dibuat: admin@example.com & dev@example.com`.green.inverse);

        // Array untuk menyimpan semua proyek yang dibuat
        const createdProjects = [];

        // 3. BUAT 10 PROJECT
        for (let i = 1; i <= PROJECT_COUNT; i++) {
            const project = await Project.create({
                name: `Proyek ${i} - ${i % 2 === 0 ? 'Internal' : 'Client'}`,
                description: `Ini adalah deskripsi untuk Proyek nomor ${i}. Digunakan untuk pengujian tampilan dashboard dengan data banyak.`,
                owner: user1._id, // User1 sebagai Owner utama
                members: i % 3 === 0 ? [user2._id] : [], // Tambahkan user2 sebagai member pada proyek kelipatan 3
            });
            createdProjects.push(project);

            // 4. BUAT KOLOM UNTUK PROYEK INI
            const projectColumnsData = defaultColumnsData.map(col => ({
                ...col,
                project: project._id,
            }));
            await Column.insertMany(projectColumnsData);
            
            // 5. BUAT TASKS DUMMY (3 tasks per proyek)
            await Task.insertMany([
                {
                    title: `[P${i}] Kebutuhan Dasar`,
                    description: `Analisis kebutuhan dan scope proyek ${i}.`,
                    status: 'todo',
                    priority: 'High',
                    project: project._id,
                    assignedTo: user1._id,
                },
                {
                    title: `[P${i}] Pengembangan Fitur Utama`,
                    description: `Mulai koding fitur utama di iterasi ini.`,
                    status: 'in-progress',
                    priority: 'Critical',
                    project: project._id,
                    assignedTo: i % 2 === 0 ? user2._id : undefined,
                },
                {
                    title: `[P${i}] Cek Ulang QA`,
                    description: `Lakukan Quality Assurance dan perbaiki bug.`,
                    status: 'testing',
                    priority: 'Medium',
                    project: project._id,
                },
            ]);
        }
        
        console.log(`Total ${PROJECT_COUNT} Proyek dan Tasks Dibuat...`.yellow.inverse);
        console.log('DATA IMPORTED SUCCESS!'.green.inverse);
        process.exit();

    } catch (error) {
        console.error(`${error}`.red.inverse);
        process.exit(1);
    }
};

const destroyData = async () => {
    try {
        await Task.deleteMany();
        await Column.deleteMany();
        await Project.deleteMany();
        await User.deleteMany();

        console.log('Data Destroyed!'.red.inverse);
        process.exit();
    } catch (error) {
        console.error(`${error}`.red.inverse);
        process.exit(1);
    }
};

// Logika command line argumen
if (process.argv[2] === '-d') {
    destroyData();
} else {
    importData();
}
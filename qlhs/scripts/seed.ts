import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Tạo admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const adminUser = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      idUser: 'user_' + Date.now() + '_admin',
      username: 'admin',
      password: hashedPassword,
      fullName: 'Administrator',
      role: 'ADMINQL',
      loginType: 'BASIC',
    },
  });

  console.log('✅ Admin user created:', adminUser.username);

  // Tạo một số columns mẫu
  const sampleColumns = [
    { id: 'ten', label: 'Tên', type: 'string' },
    { id: 'tuoi', label: 'Tuổi', type: 'number' },
    { id: 'dia-chi', label: 'Địa chỉ', type: 'string' },
    { id: 'so-dien-thoai', label: 'Số điện thoại', type: 'string' },
    { id: 'email', label: 'Email', type: 'string' },
  ];

  for (const column of sampleColumns) {
    await prisma.column.upsert({
      where: { id: column.id },
      update: {},
      create: column,
    });
  }

  console.log('✅ Sample columns created');

  // Tạo một số data rows mẫu
  const sampleData = [
    {
      values: {
        ten: 'Nguyễn Văn A',
        tuoi: 25,
        'dia-chi': 'Hà Nội',
        'so-dien-thoai': '0123456789',
        email: 'nguyenvana@example.com',
      },
    },
    {
      values: {
        ten: 'Trần Thị B',
        tuoi: 30,
        'dia-chi': 'TP.HCM',
        'so-dien-thoai': '0987654321',
        email: 'tranthib@example.com',
      },
    },
  ];

  for (const data of sampleData) {
    await prisma.dataColumn.create({
      data,
    });
  }

  console.log('✅ Sample data rows created');

  console.log('🎉 Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 
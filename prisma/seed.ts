import { PrismaClient } from '@prisma/client'
import { hashPassword, Role } from '../src/lib/auth'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Hash default password for all users
  const defaultPassword = await hashPassword('password123')

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@stackit.com' },
    update: {},
    create: {
      email: 'admin@stackit.com',
      username: 'admin',
      password: defaultPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: Role.ADMIN,
      bio: 'System administrator'
    }
  })

  // Create regular users
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'john@example.com' },
      update: {},
      create: {
        email: 'john@example.com',
        username: 'johndoe',
        password: defaultPassword,
        firstName: 'John',
        lastName: 'Doe',
        role: Role.USER,
        bio: 'Full-stack developer passionate about web technologies'
      }
    }),
    prisma.user.upsert({
      where: { email: 'jane@example.com' },
      update: {},
      create: {
        email: 'jane@example.com',
        username: 'janesmith',
        password: defaultPassword,
        firstName: 'Jane',
        lastName: 'Smith',
        role: Role.USER,
        bio: 'Frontend developer specializing in React and TypeScript'
      }
    }),
    prisma.user.upsert({
      where: { email: 'alice@example.com' },
      update: {},
      create: {
        email: 'alice@example.com',
        username: 'alicejohnson',
        password: defaultPassword,
        firstName: 'Alice',
        lastName: 'Johnson',
        role: Role.USER,
        bio: 'Backend developer with expertise in Node.js and databases'
      }
    })
  ])

  // Create tags
  const tags = await Promise.all([
    prisma.tag.upsert({
      where: { name: 'javascript' },
      update: {},
      create: {
        name: 'javascript',
        description: 'JavaScript programming language',
        color: '#F7DF1E'
      }
    }),
    prisma.tag.upsert({
      where: { name: 'typescript' },
      update: {},
      create: {
        name: 'typescript',
        description: 'TypeScript programming language',
        color: '#3178C6'
      }
    }),
    prisma.tag.upsert({
      where: { name: 'react' },
      update: {},
      create: {
        name: 'react',
        description: 'React JavaScript library',
        color: '#61DAFB'
      }
    }),
    prisma.tag.upsert({
      where: { name: 'nextjs' },
      update: {},
      create: {
        name: 'nextjs',
        description: 'Next.js React framework',
        color: '#000000'
      }
    }),
    prisma.tag.upsert({
      where: { name: 'nodejs' },
      update: {},
      create: {
        name: 'nodejs',
        description: 'Node.js runtime environment',
        color: '#339933'
      }
    }),
    prisma.tag.upsert({
      where: { name: 'prisma' },
      update: {},
      create: {
        name: 'prisma',
        description: 'Prisma database toolkit',
        color: '#2D3748'
      }
    })
  ])

  // Create sample questions
  const question1 = await prisma.question.create({
    data: {
      title: 'How to implement authentication in Next.js with JWT?',
      content: '<p>I\'m building a Next.js application and need to implement JWT-based authentication. What\'s the best approach for handling user sessions and protecting routes?</p><p>I\'ve heard about NextAuth.js, but I want to understand the fundamentals first. Can someone explain the complete flow from login to protecting API routes?</p>',
      authorId: users[0].id,
      tags: {
        create: [
          { tagId: tags.find(t => t.name === 'nextjs')!.id },
          { tagId: tags.find(t => t.name === 'javascript')!.id },
          { tagId: tags.find(t => t.name === 'nodejs')!.id }
        ]
      }
    }
  })

  const question2 = await prisma.question.create({
    data: {
      title: 'Best practices for React component state management?',
      content: '<p>I\'m working on a large React application and struggling with state management. The component tree is getting complex, and I\'m not sure when to use local state vs context vs external state management.</p><p>What are the current best practices for managing state in React applications? Should I use Redux, Zustand, or stick with built-in React state management?</p>',
      authorId: users[1].id,
      tags: {
        create: [
          { tagId: tags.find(t => t.name === 'react')!.id },
          { tagId: tags.find(t => t.name === 'javascript')!.id },
          { tagId: tags.find(t => t.name === 'typescript')!.id }
        ]
      }
    }
  })

  const question3 = await prisma.question.create({
    data: {
      title: 'How to optimize database queries with Prisma?',
      content: '<p>I\'m using Prisma ORM in my Node.js application, but I\'m experiencing slow query performance with complex relations. My database has grown significantly, and some queries are taking too long.</p><p>What are the best practices for optimizing Prisma queries? Should I use raw queries for complex operations, or are there better ways to handle this?</p>',
      authorId: users[2].id,
      tags: {
        create: [
          { tagId: tags.find(t => t.name === 'prisma')!.id },
          { tagId: tags.find(t => t.name === 'nodejs')!.id },
          { tagId: tags.find(t => t.name === 'typescript')!.id }
        ]
      }
    }
  })

  // Create sample answers
  const answer1 = await prisma.answer.create({
    data: {
      content: '<p>Great question! Here\'s a comprehensive approach to implementing JWT authentication in Next.js:</p><h3>1. Setup JWT utilities</h3><p>First, create utility functions for token generation and verification:</p><pre><code>import jwt from \'jsonwebtoken\'\n\nexport const generateToken = (payload) => {\n  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: \'7d\' })\n}\n\nexport const verifyToken = (token) => {\n  try {\n    return jwt.verify(token, process.env.JWT_SECRET)\n  } catch (error) {\n    return null\n  }\n}</code></pre><h3>2. Create authentication middleware</h3><p>Use middleware to protect your API routes and pages.</p><p>This approach gives you full control over the authentication flow and is perfect for learning the fundamentals!</p>',
      questionId: question1.id,
      authorId: users[1].id
    }
  })

  const answer2 = await prisma.answer.create({
    data: {
      content: '<p>For React state management, here\'s my recommended approach based on application size and complexity:</p><h3>Small to Medium Apps:</h3><ul><li><strong>Local State:</strong> Use useState for component-specific data</li><li><strong>Context API:</strong> For shared state across multiple components</li><li><strong>useReducer:</strong> For complex state logic</li></ul><h3>Large Apps:</h3><ul><li><strong>Zustand:</strong> Lightweight and modern state management</li><li><strong>Redux Toolkit:</strong> If you need time-travel debugging and complex middleware</li></ul><p>The key is to start simple and add complexity only when needed!</p>',
      questionId: question2.id,
      authorId: users[2].id,
      isAccepted: true
    }
  })

  // Create sample votes
  await prisma.vote.createMany({
    data: [
      { userId: users[1].id, questionId: question1.id, type: 'UP' },
      { userId: users[2].id, questionId: question1.id, type: 'UP' },
      { userId: users[0].id, questionId: question2.id, type: 'UP' },
      { userId: users[0].id, answerId: answer1.id, type: 'UP' },
      { userId: users[2].id, answerId: answer1.id, type: 'UP' },
      { userId: users[0].id, answerId: answer2.id, type: 'UP' },
      { userId: users[1].id, answerId: answer2.id, type: 'UP' }
    ]
  })

  // Update question and answer vote counts
  await prisma.question.update({
    where: { id: question1.id },
    data: { voteCount: 2, answerCount: 1 }
  })

  await prisma.question.update({
    where: { id: question2.id },
    data: { voteCount: 1, answerCount: 1, isAnswered: true }
  })

  await prisma.answer.update({
    where: { id: answer1.id },
    data: { voteCount: 2 }
  })

  await prisma.answer.update({
    where: { id: answer2.id },
    data: { voteCount: 2 }
  })

  // Create sample comments
  await prisma.comment.createMany({
    data: [
      {
        content: 'This is a great explanation! Thanks for the detailed code examples.',
        authorId: users[0].id,
        answerId: answer1.id
      },
      {
        content: 'Have you considered using NextAuth.js for a more robust solution?',
        authorId: users[2].id,
        answerId: answer1.id
      },
      {
        content: 'I agree with using Zustand for larger apps. It\'s much simpler than Redux.',
        authorId: users[0].id,
        answerId: answer2.id
      }
    ]
  })

  // Create system settings
  await prisma.systemSettings.createMany({
    data: [
      { key: 'site_name', value: 'StackIt', type: 'STRING' },
      { key: 'site_description', value: 'A minimal Q&A forum platform', type: 'STRING' },
      { key: 'max_questions_per_day', value: '10', type: 'NUMBER' },
      { key: 'max_answers_per_question', value: '50', type: 'NUMBER' },
      { key: 'allow_anonymous_questions', value: 'false', type: 'BOOLEAN' },
      { key: 'require_email_verification', value: 'true', type: 'BOOLEAN' }
    ]
  })

  console.log('✅ Database seeded successfully!')
  console.log(`📊 Created:`)
  console.log(`  - ${await prisma.user.count()} users`)
  console.log(`  - ${await prisma.question.count()} questions`)
  console.log(`  - ${await prisma.answer.count()} answers`)
  console.log(`  - ${await prisma.tag.count()} tags`)
  console.log(`  - ${await prisma.vote.count()} votes`)
  console.log(`  - ${await prisma.comment.count()} comments`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Error seeding database:', e)
    await prisma.$disconnect()
    process.exit(1)
  }) 